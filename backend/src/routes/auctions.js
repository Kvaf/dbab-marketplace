const express = require('express');
const { getDb } = require('../database');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// List active auctions
router.get('/', optionalAuth, (req, res) => {
  const db = getDb();
  const { sort, page = 1, limit = 24 } = req.query;
  const offset = (page - 1) * limit;

  let orderBy = 'a.ends_at ASC';
  if (sort === 'ending_soon') orderBy = 'a.ends_at ASC';
  else if (sort === 'newest') orderBy = 'a.created_at DESC';
  else if (sort === 'price_high') orderBy = 'COALESCE(a.current_price, a.starting_price) DESC';
  else if (sort === 'most_bids') orderBy = 'bid_count DESC';

  const total = db.prepare(`SELECT COUNT(*) as count FROM auctions a WHERE a.status = 'active' AND a.ends_at > datetime('now')`).get().count;

  const auctions = db.prepare(`
    SELECT a.*, d.name as domain_name, d.tld, d.description, d.category,
           u.username as seller_name, COUNT(b.id) as bid_count
    FROM auctions a
    JOIN domains d ON a.domain_id = d.id
    JOIN users u ON d.seller_id = u.id
    LEFT JOIN bids b ON b.auction_id = a.id
    WHERE a.status = 'active' AND a.ends_at > datetime('now')
    GROUP BY a.id
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all(Number(limit), Number(offset));

  res.json({ auctions, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// Get single auction with bids
router.get('/:id', optionalAuth, (req, res) => {
  const db = getDb();
  const auction = db.prepare(`
    SELECT a.*, d.name as domain_name, d.tld, d.description, d.category, d.seller_id,
           u.username as seller_name
    FROM auctions a
    JOIN domains d ON a.domain_id = d.id
    JOIN users u ON d.seller_id = u.id
    WHERE a.id = ?
  `).get(req.params.id);

  if (!auction) return res.status(404).json({ error: 'Auction not found' });

  const bids = db.prepare(`
    SELECT b.*, u.username as bidder_name
    FROM bids b
    JOIN users u ON b.bidder_id = u.id
    WHERE b.auction_id = ?
    ORDER BY b.amount DESC
    LIMIT 20
  `).all(auction.id);

  res.json({ ...auction, bids, bid_count: bids.length });
});

// Place bid
router.post('/:id/bid', authenticate, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid bid amount required' });
  }

  const db = getDb();
  const auction = db.prepare(`
    SELECT a.*, d.seller_id
    FROM auctions a
    JOIN domains d ON a.domain_id = d.id
    WHERE a.id = ? AND a.status = 'active' AND a.ends_at > datetime('now')
  `).get(req.params.id);

  if (!auction) return res.status(404).json({ error: 'Auction not found or ended' });
  if (auction.seller_id === req.user.id) return res.status(400).json({ error: 'Cannot bid on your own auction' });

  const minBid = auction.current_price || auction.starting_price;
  if (amount <= minBid) {
    return res.status(400).json({ error: `Bid must be higher than ${minBid}` });
  }

  db.prepare('INSERT INTO bids (auction_id, bidder_id, amount) VALUES (?, ?, ?)').run(auction.id, req.user.id, amount);
  db.prepare('UPDATE auctions SET current_price = ? WHERE id = ?').run(amount, auction.id);

  res.json({ message: 'Bid placed successfully', current_price: amount });
});

// Create auction (authenticated seller)
router.post('/', authenticate, (req, res) => {
  const { domain_id, starting_price, reserve_price, currency, duration_hours } = req.body;
  if (!domain_id || !starting_price || !duration_hours) {
    return res.status(400).json({ error: 'Domain, starting price, and duration required' });
  }

  const db = getDb();
  const domain = db.prepare('SELECT * FROM domains WHERE id = ? AND seller_id = ?').get(domain_id, req.user.id);
  if (!domain) return res.status(404).json({ error: 'Domain not found or not yours' });

  const starts_at = new Date().toISOString();
  const ends_at = new Date(Date.now() + duration_hours * 60 * 60 * 1000).toISOString();

  const result = db.prepare(`
    INSERT INTO auctions (domain_id, starting_price, reserve_price, currency, starts_at, ends_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(domain_id, starting_price, reserve_price || null, currency || 'USD', starts_at, ends_at);

  db.prepare('UPDATE domains SET status = ? WHERE id = ?').run('auction', domain_id);
  res.json({ id: result.lastInsertRowid, message: 'Auction created' });
});

module.exports = router;
