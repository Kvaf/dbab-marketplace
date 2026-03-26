const express = require('express');
const { getDb } = require('../database');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// List domains (public)
router.get('/', optionalAuth, (req, res) => {
  const db = getDb();
  const { search, tld, category, sort, min_price, max_price, page = 1, limit = 24 } = req.query;
  const offset = (page - 1) * limit;

  let where = ['d.status = ?'];
  let params = ['active'];

  if (search) {
    where.push('d.name LIKE ?');
    params.push(`%${search}%`);
  }
  if (tld) {
    where.push('d.tld = ?');
    params.push(tld);
  }
  if (category) {
    where.push('d.category = ?');
    params.push(category);
  }
  if (min_price) {
    where.push('d.price >= ?');
    params.push(Number(min_price));
  }
  if (max_price) {
    where.push('d.price <= ?');
    params.push(Number(max_price));
  }

  let orderBy = 'd.created_at DESC';
  if (sort === 'price_asc') orderBy = 'd.price ASC';
  else if (sort === 'price_desc') orderBy = 'd.price DESC';
  else if (sort === 'popular') orderBy = 'd.views DESC';
  else if (sort === 'newest') orderBy = 'd.created_at DESC';

  const whereClause = where.join(' AND ');
  const total = db.prepare(`SELECT COUNT(*) as count FROM domains d WHERE ${whereClause}`).get(...params).count;
  const domains = db.prepare(`
    SELECT d.*, u.username as seller_name
    FROM domains d
    JOIN users u ON d.seller_id = u.id
    WHERE ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), Number(offset));

  res.json({ domains, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// Get single domain
router.get('/:id', optionalAuth, (req, res) => {
  const db = getDb();
  const domain = db.prepare(`
    SELECT d.*, u.username as seller_name
    FROM domains d
    JOIN users u ON d.seller_id = u.id
    WHERE d.id = ?
  `).get(req.params.id);
  if (!domain) return res.status(404).json({ error: 'Domain not found' });

  // Increment views
  db.prepare('UPDATE domains SET views = views + 1 WHERE id = ?').run(req.params.id);

  // Check if user has it in watchlist
  let watched = false;
  if (req.user) {
    const w = db.prepare('SELECT id FROM watchlist WHERE user_id = ? AND domain_id = ?').get(req.user.id, domain.id);
    watched = !!w;
  }

  // Check active auction
  const auction = db.prepare(`
    SELECT a.*, COUNT(b.id) as bid_count
    FROM auctions a
    LEFT JOIN bids b ON b.auction_id = a.id
    WHERE a.domain_id = ? AND a.status = 'active' AND a.ends_at > datetime('now')
    GROUP BY a.id
  `).get(domain.id);

  res.json({ ...domain, watched, auction: auction || null });
});

// Create listing (authenticated)
router.post('/', authenticate, (req, res) => {
  const { name, tld, description, price, currency, category, is_premium } = req.body;
  if (!name || !tld || !price) {
    return res.status(400).json({ error: 'Name, TLD, and price are required' });
  }
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO domains (name, tld, description, price, currency, seller_id, category, is_premium)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, tld, description || '', price, currency || 'USD', req.user.id, category || 'other', is_premium ? 1 : 0);
  res.json({ id: result.lastInsertRowid, message: 'Domain listed successfully' });
});

// Toggle watchlist
router.post('/:id/watch', authenticate, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM watchlist WHERE user_id = ? AND domain_id = ?').get(req.user.id, req.params.id);
  if (existing) {
    db.prepare('DELETE FROM watchlist WHERE id = ?').run(existing.id);
    res.json({ watched: false });
  } else {
    db.prepare('INSERT INTO watchlist (user_id, domain_id) VALUES (?, ?)').run(req.user.id, req.params.id);
    res.json({ watched: true });
  }
});

// Get user's listings
router.get('/user/listings', authenticate, (req, res) => {
  const db = getDb();
  const domains = db.prepare('SELECT * FROM domains WHERE seller_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(domains);
});

// Get user's watchlist
router.get('/user/watchlist', authenticate, (req, res) => {
  const db = getDb();
  const domains = db.prepare(`
    SELECT d.*, u.username as seller_name
    FROM watchlist w
    JOIN domains d ON w.domain_id = d.id
    JOIN users u ON d.seller_id = u.id
    WHERE w.user_id = ?
  `).all(req.user.id);
  res.json(domains);
});

module.exports = router;
