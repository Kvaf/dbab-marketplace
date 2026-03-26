import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Gavel, ArrowUp } from 'lucide-react';
import { api } from '../api';

const SORTS = [
  { value: 'ending_soon', label: 'Ending Soon' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_high', label: 'Highest Bid' },
  { value: 'most_bids', label: 'Most Bids' },
];

function TimeLeft({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt) - Date.now();
      if (diff <= 0) { setTimeLeft('Ended'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(h > 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);
  return <span>{timeLeft}</span>;
}

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [sort, setSort] = useState('ending_soon');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAuctions(`sort=${sort}`).then(d => setAuctions(d.auctions)).catch(() => {}).finally(() => setLoading(false));
  }, [sort]);

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Gavel className="w-8 h-8 text-info" /> Live Auctions
          </h1>
          <p className="text-text-secondary">Bid on premium and expiring domains</p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-bg-card border border-border rounded-xl px-4 py-3 text-text-primary text-sm outline-none cursor-pointer"
        >
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-text-muted">Loading auctions...</div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-20">
          <Gavel className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted text-lg">No active auctions</p>
          <p className="text-text-muted text-sm mt-2">Check back soon or list your domain for auction!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.map(a => (
            <Link key={a.id} to={`/auctions/${a.id}`} className="group block no-underline">
              <div className="bg-bg-card border border-border rounded-xl p-5 hover:border-info/30 hover:bg-bg-card-hover transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-text-primary font-semibold text-lg group-hover:text-info transition-colors">
                    {a.domain_name}.{a.tld}
                  </h3>
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <ArrowUp className="w-3 h-3" /> {a.bid_count} bids
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <div>
                    <div className="text-text-muted text-xs">Current Bid</div>
                    <div className="text-info font-bold text-xl">${(a.current_price || a.starting_price)?.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-text-muted text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Time Left</div>
                    <div className="text-warning font-mono text-sm font-semibold"><TimeLeft endsAt={a.ends_at} /></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
