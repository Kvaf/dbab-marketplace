import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Eye, Tag, Clock, Shield, ArrowLeft } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function DomainDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getDomain(id).then(setDomain).catch(() => navigate('/browse')).finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    if (!user) return navigate('/login');
    setPurchasing(true);
    try {
      const result = await api.initiatePurchase(domain.id);
      setMessage(`Escrow created! Amount: $${result.amount}. Please send payment and go to your dashboard to confirm.`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  const handleWatch = async () => {
    if (!user) return navigate('/login');
    const result = await api.toggleWatch(domain.id);
    setDomain(prev => ({ ...prev, watched: result.watched }));
  };

  if (loading) return <div className="pt-24 text-center text-text-muted">Loading...</div>;
  if (!domain) return null;

  const fullName = `${domain.name}.${domain.tld}`;

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-text-muted hover:text-text-secondary text-sm mb-6 bg-transparent border-none cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-bg-card border border-border rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">{fullName}</h1>
            <div className="flex items-center gap-4 mt-2 text-text-muted text-sm">
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {domain.views} views</span>
              <span className="flex items-center gap-1"><Tag className="w-4 h-4" /> {domain.category}</span>
              <span>Listed by <strong className="text-text-secondary">{domain.seller_name}</strong></span>
            </div>
          </div>
          {domain.is_premium ? (
            <span className="bg-accent-dim text-accent text-sm font-bold px-3 py-1.5 rounded-lg">PREMIUM</span>
          ) : null}
        </div>

        {domain.description && (
          <p className="text-text-secondary mb-6 leading-relaxed">{domain.description}</p>
        )}

        <div className="bg-bg-secondary border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-text-muted text-sm mb-1">Buy Now Price</div>
              <div className="text-4xl font-bold text-accent">${domain.price?.toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleWatch}
                className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                  domain.watched ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-bg-card border-border text-text-muted hover:text-text-primary'
                }`}
              >
                <Heart className={`w-5 h-5 ${domain.watched ? 'fill-current' : ''}`} />
              </button>
              {domain.status === 'active' && (!user || user.id !== domain.seller_id) && (
                <button
                  onClick={handleBuy}
                  disabled={purchasing}
                  className="bg-accent text-bg-primary px-8 py-3 rounded-xl font-semibold hover:brightness-110 transition text-base border-none cursor-pointer disabled:opacity-50"
                >
                  {purchasing ? 'Processing...' : 'Buy Now'}
                </button>
              )}
            </div>
          </div>
        </div>

        {message && (
          <div className="bg-accent-dim border border-accent/20 text-accent rounded-xl p-4 mb-6 text-sm">
            {message}
          </div>
        )}

        {/* Auction info if exists */}
        {domain.auction && (
          <div className="bg-info/5 border border-info/20 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-info" />
              <h3 className="text-info font-semibold">Active Auction</h3>
            </div>
            <p className="text-text-secondary text-sm">
              Current bid: <strong className="text-text-primary">${domain.auction.current_price || domain.auction.starting_price}</strong>
              {' · '}Ends: {new Date(domain.auction.ends_at).toLocaleString()}
            </p>
            <button
              onClick={() => navigate(`/auctions/${domain.auction.id}`)}
              className="mt-3 bg-info/20 text-info px-4 py-2 rounded-lg text-sm border border-info/30 cursor-pointer hover:bg-info/30 transition"
            >
              Go to Auction
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 text-text-muted text-sm">
          <Shield className="w-4 h-4 text-accent" />
          <span>Protected by secure escrow. Your payment is held safely until domain transfer is confirmed.</span>
        </div>
      </div>
    </div>
  );
}
