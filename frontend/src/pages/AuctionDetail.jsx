import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gavel, Clock, ArrowLeft, User, Shield } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

function TimeLeft({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt) - Date.now();
      if (diff <= 0) { setTimeLeft('Auction Ended'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);
  return <span>{timeLeft}</span>;
}

export default function AuctionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAuction = () => {
    api.getAuction(id).then(setAuction).catch(() => navigate('/auctions')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAuction(); }, [id]);

  const handleBid = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setMessage('');
    try {
      const result = await api.placeBid(id, Number(bidAmount));
      setMessage(`Bid placed! Current price: $${result.current_price}`);
      setBidAmount('');
      fetchAuction();
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) return <div className="pt-24 text-center text-text-muted">Loading...</div>;
  if (!auction) return null;

  const currentPrice = auction.current_price || auction.starting_price;
  const isEnded = new Date(auction.ends_at) <= Date.now();

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-text-muted hover:text-text-secondary text-sm mb-6 bg-transparent border-none cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-bg-card border border-border rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-2">
          <Gavel className="w-6 h-6 text-info" />
          <span className={`text-xs font-bold px-2 py-1 rounded ${isEnded ? 'bg-danger/10 text-danger' : 'bg-info/10 text-info'}`}>
            {isEnded ? 'ENDED' : 'LIVE'}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
          {auction.domain_name}.{auction.tld}
        </h1>
        <p className="text-text-muted text-sm mb-6">Listed by {auction.seller_name}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <div className="text-text-muted text-sm mb-1">Current Bid</div>
            <div className="text-3xl font-bold text-info">${currentPrice?.toLocaleString()}</div>
            <div className="text-text-muted text-xs mt-1">{auction.bid_count} bids total</div>
          </div>
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <div className="text-text-muted text-sm mb-1 flex items-center gap-1"><Clock className="w-4 h-4" /> Time Remaining</div>
            <div className="text-2xl font-bold font-mono text-warning"><TimeLeft endsAt={auction.ends_at} /></div>
            <div className="text-text-muted text-xs mt-1">Ends: {new Date(auction.ends_at).toLocaleString()}</div>
          </div>
        </div>

        {/* Bid form */}
        {!isEnded && (!user || user.id !== auction.seller_id) && (
          <form onSubmit={handleBid} className="bg-bg-secondary border border-border rounded-xl p-5 mb-6">
            <label className="text-text-secondary text-sm mb-2 block">Place your bid (minimum ${(currentPrice + 1).toLocaleString()})</label>
            <div className="flex gap-3">
              <div className="flex-1 flex items-center bg-bg-card border border-border rounded-xl overflow-hidden focus-within:border-info/40">
                <span className="text-text-muted pl-4">$</span>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={currentPrice + 1}
                  step="1"
                  placeholder={(currentPrice + 1).toString()}
                  className="flex-1 bg-transparent text-text-primary px-3 py-3 outline-none text-base"
                />
              </div>
              <button type="submit" className="bg-info text-white px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition border-none cursor-pointer">
                Place Bid
              </button>
            </div>
          </form>
        )}

        {message && (
          <div className="bg-info/5 border border-info/20 text-info rounded-xl p-4 mb-6 text-sm">{message}</div>
        )}

        {/* Bid history */}
        {auction.bids && auction.bids.length > 0 && (
          <div>
            <h3 className="text-text-primary font-semibold mb-3">Bid History</h3>
            <div className="space-y-2">
              {auction.bids.map((bid, i) => (
                <div key={bid.id} className="flex items-center justify-between bg-bg-secondary border border-border rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-text-muted" />
                    <span className="text-text-secondary text-sm">{bid.bidder_name}</span>
                    {i === 0 && <span className="text-xs bg-accent-dim text-accent px-2 py-0.5 rounded">Highest</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-text-primary font-semibold">${bid.amount?.toLocaleString()}</span>
                    <span className="text-text-muted text-xs">{new Date(bid.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-text-muted text-sm mt-6">
          <Shield className="w-4 h-4 text-accent" />
          <span>Winner will be contacted to complete the purchase via secure escrow.</span>
        </div>
      </div>
    </div>
  );
}
