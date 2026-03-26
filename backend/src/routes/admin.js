const express = require('express');
const { getDb } = require('../database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/stats', (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const domains = db.prepare('SELECT COUNT(*) as count FROM domains').get().count;
  const activeAuctions = db.prepare(`SELECT COUNT(*) as count FROM auctions WHERE status = 'active' AND ends_at > datetime('now')`).get().count;
  const pendingEscrow = db.prepare(`SELECT COUNT(*) as count FROM escrow WHERE status IN ('pending', 'paid')`).get().count;
  const completedSales = db.prepare(`SELECT COUNT(*) as count FROM escrow WHERE status = 'completed'`).get().count;
  res.json({ users, domains, activeAuctions, pendingEscrow, completedSales });
});

// List all escrows
router.get('/escrow', (req, res) => {
  const db = getDb();
  const escrows = db.prepare(`
    SELECT e.*, d.name as domain_name, d.tld,
           buyer.username as buyer_name, seller.username as seller_name
    FROM escrow e
    JOIN domains d ON e.domain_id = d.id
    JOIN users buyer ON e.buyer_id = buyer.id
    JOIN users seller ON e.seller_id = seller.id
    ORDER BY e.created_at DESC
  `).all();
  res.json(escrows);
});

// Verify payment & release domain
router.post('/escrow/:id/verify', (req, res) => {
  const db = getDb();
  const escrow = db.prepare('SELECT * FROM escrow WHERE id = ?').get(req.params.id);
  if (!escrow) return res.status(404).json({ error: 'Escrow not found' });

  db.prepare('UPDATE escrow SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('verified', escrow.id);
  res.json({ message: 'Payment verified. Seller notified to transfer domain.' });
});

// Confirm domain transferred → complete escrow
router.post('/escrow/:id/complete', (req, res) => {
  const db = getDb();
  const escrow = db.prepare('SELECT * FROM escrow WHERE id = ?').get(req.params.id);
  if (!escrow) return res.status(404).json({ error: 'Escrow not found' });

  db.prepare('UPDATE escrow SET status = ?, domain_transferred = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('completed', escrow.id);
  db.prepare('UPDATE domains SET status = ? WHERE id = ?').run('sold', escrow.domain_id);
  res.json({ message: 'Escrow completed. Domain marked as sold.' });
});

// Cancel escrow
router.post('/escrow/:id/cancel', (req, res) => {
  const db = getDb();
  const escrow = db.prepare('SELECT * FROM escrow WHERE id = ?').get(req.params.id);
  if (!escrow) return res.status(404).json({ error: 'Escrow not found' });

  db.prepare('UPDATE escrow SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('cancelled', escrow.id);
  db.prepare('UPDATE domains SET status = ? WHERE id = ?').run('active', escrow.domain_id);
  res.json({ message: 'Escrow cancelled. Domain re-listed.' });
});

// List all users
router.get('/users', (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, email, username, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

// List all domains
router.get('/domains', (req, res) => {
  const db = getDb();
  const domains = db.prepare(`
    SELECT d.*, u.username as seller_name
    FROM domains d
    JOIN users u ON d.seller_id = u.id
    ORDER BY d.created_at DESC
  `).all();
  res.json(domains);
});

module.exports = router;
