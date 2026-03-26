import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { api } from '../api';
import DomainCard from '../components/DomainCard';

const TLDS = ['All', '.com', '.io', '.ai', '.tech', '.net', '.org', '.se', '.de', '.co'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'popular', label: 'Most Viewed' },
];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [domains, setDomains] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [tld, setTld] = useState('All');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (tld !== 'All') params.set('tld', tld.replace('.', ''));
      params.set('sort', sort);
      params.set('page', page);
      const data = await api.getDomains(params.toString());
      setDomains(data.domains);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setDomains([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDomains(); }, [search, tld, sort, page]);

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Domains</h1>
        <p className="text-text-secondary">{total} domains available</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 flex items-center bg-bg-card border border-border rounded-xl overflow-hidden focus-within:border-accent/40 transition-colors">
          <Search className="w-5 h-5 text-text-muted ml-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search domains..."
            className="flex-1 bg-transparent text-text-primary placeholder-text-muted px-4 py-3 outline-none text-sm"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="bg-bg-card border border-border rounded-xl px-4 py-3 text-text-primary text-sm outline-none cursor-pointer"
        >
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* TLD filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TLDS.map(t => (
          <button
            key={t}
            onClick={() => { setTld(t); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm border cursor-pointer transition-colors ${
              tld === t
                ? 'bg-accent text-bg-primary border-accent font-semibold'
                : 'bg-bg-card border-border text-text-secondary hover:border-border-hover'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-20 text-text-muted">Loading...</div>
      ) : domains.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-muted text-lg">No domains found</p>
          <p className="text-text-muted text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map(d => <DomainCard key={d.id} domain={d} />)}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg text-sm border cursor-pointer transition-colors ${
                    page === i + 1
                      ? 'bg-accent text-bg-primary border-accent font-semibold'
                      : 'bg-bg-card border-border text-text-secondary hover:border-border-hover'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
