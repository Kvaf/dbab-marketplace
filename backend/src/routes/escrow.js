const express = require('express');
const { getDb } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Initiate purchase (creates escrow)
router.post('/initiate', authenticate, (req, res) => {
  const { domain_id } = req.body;
  if (!domain_id) return res.status(400).json({ error: 'Domain ID required' });

  const db = getDb();
  const domain = db.prepare('SELECT * FROM domains WHERE id = ? AND status = ?').get(domain_id, 'active');
  if (!domain) return res.status(404).json({ error: 'Domain not available' });
  if (domain.seller_id === req.user.id) return res.status(400).json({ error: 'Cannot buy your own domain' });

  // Check if escrow already exists
  const existing = db.prepare(`SELECT id FROM escrow WHERE domain_id = ? AND buyer_id = ? AND status IN ('pending', 'paid')`).get(domain_id, req.user.id);
  if (existing) return res.status(409).json({ error: 'Purchase already in progress' });

  const result = db.prepare(`
    INSERT INTO escrow (domain_id, buyer_id, seller_id, amount, currency)
    VALUES (?, ?, ?, ?, ?)
  `).run(domain_id, req.user.id, domain.seller_id, domain.price, domain.currency);

  db.prepare('UPDATE domains SET status = ? WHERE id = ?').run('escrow', domain_id);

  res.json({
    escrow_id: result.lastInsertRowid,
    amount: domain.price,
    currency: domain.currency,
    message: 'Escrow created. Please send payment and provide reference.'
  });
});

// Buyer confirms payment sent
router.post('/:id/payment-sent', authenticate, (req, res) => {
  const { payment_reference } = req.body;
  const db = getDb();
  const escrow = db.prepare('SELECT * FROM escrow WHERE id = ? AND buyer_id = ? AND status = ?').get(req.params.id, req.user.id, 'pending');
  if (!escrow) return res.status(404).json({ error: 'Escrow not found' });

  db.prepare('UPDATE escrow SET status = ?, payment_reference = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('paid', payment_reference || '', escrow.id);
  res.json({ message: 'Payment marked as sent. Awaiting admin verification.' });
});

// Get user's escrow transactions
router.get('/my', authenticate, (req, res) => {
  const db = getDb();
  const escrows = db.prepare(`
    SELECT e.*, d.name as domain_name, d.tld,
           buyer.username as buyer_name, seller.username as seller_name
    FROM escrow e
    JOIN domains d ON e.domain_id = d.id
    JOIN users buyer ON e.buyer_id = buyer.id
    JOIN users seller ON e.seller_id = seller.id
    WHERE e.buyer_id = ? OR e.seller_id = ?
    ORDER BY e.created_at DESC
  `).all(req.user.id, req.user.id);
  res.json(escrows);
});

module.exports = router;
