import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Gavel, ArrowRight, Globe, Zap, Lock } from 'lucide-react';
import { api } from '../api';
import DomainCard from '../components/DomainCard';

export default function Home() {
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getDomains('limit=6&sort=popular').then(d => setFeatured(d.domains)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/browse?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-72 h-72 bg-info/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-bg-card border border-border rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-text-secondary text-sm">Domain Marketplace</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-accent to-info bg-clip-text text-transparent">Domain Name</span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Buy, sell, and auction premium domains with secure escrow protection. No buyer fees.
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
            <div className="flex items-center bg-bg-card border border-border rounded-xl overflow-hidden focus-within:border-accent/40 transition-colors">
              <Search className="w-5 h-5 text-text-muted ml-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search domains... e.g. crypto, tech, ai"
                className="flex-1 bg-transparent text-text-primary placeholder-text-muted px-4 py-4 outline-none text-base"
              />
              <button type="submit" className="bg-accent text-bg-primary px-6 py-4 font-semibold hover:brightness-110 transition text-sm border-none cursor-pointer">
                Search
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 md:gap-16 mt-12">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold font-mono text-accent">0%</div>
              <div className="text-text-muted text-sm mt-1">Buyer Fees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold font-mono text-accent">24h</div>
              <div className="text-text-muted text-sm mt-1">Transfer Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold font-mono text-accent">100%</div>
              <div className="text-text-muted text-sm mt-1">Escrow Protected</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: 'Find', desc: 'Browse our marketplace or search for the perfect domain name for your project.' },
              { icon: Lock, title: 'Secure Escrow', desc: 'Payment is held safely in escrow until the domain is verified and transferred.' },
              { icon: Globe, title: 'Transfer', desc: 'Domain is transferred to your account. Fast, safe, and guaranteed.' },
            ].map((item, i) => (
              <div key={i} className="bg-bg-card border border-border rounded-xl p-6 text-center hover:border-border-hover transition-colors">
                <div className="w-12 h-12 bg-accent-dim rounded-lg flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-text-primary font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-text-secondary text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Domains */}
      {featured.length > 0 && (
        <section className="py-20 px-4 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Featured Domains</h2>
              <Link to="/browse" className="text-accent hover:text-accent/80 text-sm flex items-center gap-1 no-underline">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map(d => <DomainCard key={d.id} domain={d} />)}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why dbab.tech?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Buyer Protection', desc: 'No buyer fees. Every transaction is protected with escrow.' },
              { icon: Gavel, title: 'Live Auctions', desc: 'Bid on expiring and premium domains. Set your max and let us handle the rest.' },
              { icon: Zap, title: 'Fast Transfers', desc: 'Domain codes delivered within 24 hours of confirmed payment.' },
              { icon: Lock, title: 'Secure Escrow', desc: 'Funds held securely until domain transfer is verified.' },
              { icon: Globe, title: 'All TLDs', desc: 'Support for .com, .io, .ai, .tech, .se, and hundreds more.' },
              { icon: Search, title: 'Smart Search', desc: 'Find exactly what you need with powerful search and filters.' },
            ].map((item, i) => (
              <div key={i} className="bg-bg-card border border-border rounded-xl p-5 hover:border-border-hover hover:-translate-y-0.5 transition-all duration-200">
                <item.icon className="w-5 h-5 text-accent mb-3" />
                <h3 className="text-text-primary font-semibold mb-1">{item.title}</h3>
                <p className="text-text-secondary text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-text-secondary mb-8">Join the marketplace and start buying or selling domains today.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="bg-accent text-bg-primary px-8 py-3 rounded-xl font-semibold hover:brightness-110 transition no-underline">
              Create Account
            </Link>
            <Link to="/browse" className="border border-border text-text-primary px-8 py-3 rounded-xl font-semibold hover:bg-bg-card transition no-underline">
              Browse Domains
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
