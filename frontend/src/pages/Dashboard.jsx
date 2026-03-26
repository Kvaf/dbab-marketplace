import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Package, Heart, ArrowRightLeft, Plus } from 'lucide-react';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    Promise.all([
      api.myListings().catch(() => []),
      api.myWatchlist().catch(() => []),
      api.myEscrow().catch(() => []),
    ]).then(([l, w, e]) => {
      setListings(l);
      setWatchlist(w);
      setEscrows(e);
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const TABS = [
    { id: 'listings', label: 'My Listings', icon: Package, count: listings.length },
    { id: 'watchlist', label: 'Watchlist', icon: Heart, count: watchlist.length },
    { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft, count: escrows.length },
  ];

  const statusColors = {
    pending: 'text-warning bg-warning/10',
    paid: 'text-info bg-info/10',
    verified: 'text-accent bg-accent-dim',
    completed: 'text-accent bg-accent-dim',
    cancelled: 'text-danger bg-danger/10',
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-text-secondary mt-1">Welcome back, {user.username}</p>
        </div>
        <Link to="/sell" className="bg-accent text-bg-primary px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:brightness-110 transition no-underline">
          <Plus className="w-4 h-4" /> List Domain
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border pb-2">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border-none cursor-pointer transition-colors ${
              tab === t.id ? 'bg-bg-card text-text-primary' : 'bg-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
            <span className="bg-bg-secondary text-text-muted text-xs px-2 py-0.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? <div className="text-text-muted py-10 text-center">Loading...</div> : (
        <>
          {/* Listings */}
          {tab === 'listings' && (
            <div className="space-y-3">
              {listings.length === 0 ? (
                <div className="text-center py-10 text-text-muted">No listings yet. <Link to="/sell" className="text-accent no-underline">List your first domain</Link></div>
              ) : listings.map(d => (
                <div key={d.id} className="bg-bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-text-primary font-semibold">{d.name}.{d.tld}</span>
                    <span className={`ml-3 text-xs px-2 py-0.5 rounded capitalize ${d.status === 'active' ? 'text-accent bg-accent-dim' : 'text-text-muted bg-bg-secondary'}`}>{d.status}</span>
                  </div>
                  <span className="text-accent font-bold">${d.price?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Watchlist */}
          {tab === 'watchlist' && (
            <div className="space-y-3">
              {watchlist.length === 0 ? (
                <div className="text-center py-10 text-text-muted">Your watchlist is empty. <Link to="/browse" className="text-accent no-underline">Browse domains</Link></div>
              ) : watchlist.map(d => (
                <Link key={d.id} to={`/domains/${d.id}`} className="bg-bg-card border border-border rounded-xl p-4 flex items-center justify-between no-underline block hover:border-border-hover transition">
                  <div>
                    <span className="text-text-primary font-semibold">{d.name}.{d.tld}</span>
                    <span className="text-text-muted text-sm ml-3">by {d.seller_name}</span>
                  </div>
                  <span className="text-accent font-bold">${d.price?.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Transactions */}
          {tab === 'transactions' && (
            <div className="space-y-3">
              {escrows.length === 0 ? (
                <div className="text-center py-10 text-text-muted">No transactions yet.</div>
              ) : escrows.map(e => (
                <div key={e.id} className="bg-bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-primary font-semibold">{e.domain_name}.{e.tld}</span>
                    <span className={`text-xs px-2 py-1 rounded-lg font-semibold capitalize ${statusColors[e.status] || ''}`}>{e.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">
                      {e.buyer_id === user.id ? `Buying from ${e.seller_name}` : `Selling to ${e.buyer_name}`}
                    </span>
                    <span className="text-accent font-bold">${e.amount?.toLocaleString()}</span>
                  </div>
                  {e.status === 'pending' && e.buyer_id === user.id && (
                    <button
                      onClick={async () => {
                        const ref = prompt('Enter payment reference:');
                        if (ref) {
                          await api.markPaymentSent(e.id, ref);
                          window.location.reload();
                        }
                      }}
                      className="mt-3 bg-info/20 text-info px-4 py-2 rounded-lg text-sm border border-info/30 cursor-pointer hover:bg-info/30 transition"
                    >
                      Mark Payment Sent
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
