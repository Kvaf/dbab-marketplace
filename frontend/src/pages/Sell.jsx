import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { DollarSign, Tag, Globe } from 'lucide-react';

const CATEGORIES = ['technology', 'finance', 'crypto', 'gaming', 'business', 'health', 'education', 'other'];

export default function Sell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', tld: 'com', description: '', price: '', category: 'technology', is_premium: false });
  const [auctionMode, setAuctionMode] = useState(false);
  const [auctionForm, setAuctionForm] = useState({ starting_price: '', reserve_price: '', duration_hours: 72 });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="pt-24 pb-16 px-4 max-w-xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Sell a Domain</h1>
        <p className="text-text-secondary mb-6">Please log in to list your domain for sale.</p>
        <button onClick={() => navigate('/login')} className="bg-accent text-bg-primary px-6 py-3 rounded-xl font-semibold border-none cursor-pointer">Log in</button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const domain = await api.createDomain({
        ...form,
        price: Number(form.price),
      });
      if (auctionMode) {
        await api.createAuction({
          domain_id: domain.id,
          starting_price: Number(auctionForm.starting_price),
          reserve_price: auctionForm.reserve_price ? Number(auctionForm.reserve_price) : undefined,
          duration_hours: Number(auctionForm.duration_hours),
        });
        setMessage('Domain listed and auction started!');
      } else {
        setMessage('Domain listed successfully!');
      }
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Sell a Domain</h1>
      <p className="text-text-secondary mb-8">List your domain for a fixed price or start an auction.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Domain name */}
        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-text-primary font-semibold flex items-center gap-2"><Globe className="w-5 h-5 text-accent" /> Domain Info</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="mydomain"
              required
              className="flex-1 bg-bg-secondary border border-border rounded-xl px-4 py-3 text-text-primary outline-none focus:border-accent/40 transition"
            />
            <select
              value={form.tld}
              onChange={(e) => setForm({ ...form, tld: e.target.value })}
              className="bg-bg-secondary border border-border rounded-xl px-4 py-3 text-text-primary outline-none cursor-pointer"
            >
              {['com', 'io', 'ai', 'tech', 'net', 'org', 'se', 'de', 'co', 'xyz', 'app'].map(t => (
                <option key={t} value={t}>.{t}</option>
              ))}
            </select>
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your domain (optional)"
            rows={3}
            className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-text-primary outline-none resize-none focus:border-accent/40 transition"
          />
          <div className="flex gap-3">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="flex-1 bg-bg-secondary border border-border rounded-xl px-4 py-3 text-text-primary outline-none cursor-pointer capitalize"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-2 bg-bg-secondary border border-border rounded-xl px-4 py-3 cursor-pointer">
              <input type="checkbox" checked={form.is_premium} onChange={(e) => setForm({ ...form, is_premium: e.target.checked })} className="accent-accent" />
              <span className="text-text-secondary text-sm">Premium</span>
            </label>
          </div>
        </div>

        {/* Price */}
        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-text-primary font-semibold flex items-center gap-2"><DollarSign className="w-5 h-5 text-accent" /> Pricing</h3>
          <div className="flex items-center bg-bg-secondary border border-border rounded-xl overflow-hidden focus-within:border-accent/40">
            <span className="text-text-muted pl-4 text-lg">$</span>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="5000"
              min="1"
              required
              className="flex-1 bg-transparent text-text-primary px-3 py-3 outline-none text-lg"
            />
          </div>

          {/* Auction toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={auctionMode} onChange={(e) => setAuctionMode(e.target.checked)} className="accent-info w-4 h-4" />
            <span className="text-text-secondary text-sm">Also start an auction for this domain</span>
          </label>

          {auctionMode && (
            <div className="space-y-3 pl-7 border-l-2 border-info/20">
              <div className="flex items-center bg-bg-secondary border border-border rounded-xl overflow-hidden">
                <span className="text-text-muted pl-4">Starting $</span>
                <input
                  type="number"
                  value={auctionForm.starting_price}
                  onChange={(e) => setAuctionForm({ ...auctionForm, starting_price: e.target.value })}
                  placeholder="100"
                  min="1"
                  required={auctionMode}
                  className="flex-1 bg-transparent text-text-primary px-3 py-3 outline-none"
                />
              </div>
              <div className="flex items-center bg-bg-secondary border border-border rounded-xl overflow-hidden">
                <span className="text-text-muted pl-4">Reserve $</span>
                <input
                  type="number"
                  value={auctionForm.reserve_price}
                  onChange={(e) => setAuctionForm({ ...auctionForm, reserve_price: e.target.value })}
                  placeholder="Optional"
                  className="flex-1 bg-transparent text-text-primary px-3 py-3 outline-none"
                />
              </div>
              <select
                value={auctionForm.duration_hours}
                onChange={(e) => setAuctionForm({ ...auctionForm, duration_hours: e.target.value })}
                className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-text-primary outline-none cursor-pointer"
              >
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={72}>3 days</option>
                <option value={168}>7 days</option>
                <option value={336}>14 days</option>
              </select>
            </div>
          )}
        </div>

        {error && <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm">{error}</div>}
        {message && <div className="bg-accent-dim border border-accent/20 text-accent rounded-xl p-4 text-sm">{message}</div>}

        <button type="submit" className="w-full bg-accent text-bg-primary py-4 rounded-xl font-semibold text-lg hover:brightness-110 transition border-none cursor-pointer">
          {auctionMode ? 'List & Start Auction' : 'List Domain for Sale'}
        </button>
      </form>
    </div>
  );
}
