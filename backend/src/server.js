const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const domainRoutes = require('./routes/domains');
const auctionRoutes = require('./routes/auctions');
const escrowRoutes = require('./routes/escrow');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Health check (before catch-all)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'dbab-marketplace' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend
const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendPath));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`DBAB Marketplace API running on port ${PORT}`);
});
