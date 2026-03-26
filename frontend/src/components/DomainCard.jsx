import { Link } from 'react-router-dom';
import { ExternalLink, Gavel } from 'lucide-react';

export default function DomainCard({ domain, auction }) {
  const fullName = `${domain.name || domain.domain_name}.${domain.tld}`;
  const price = auction
    ? (auction.current_price || auction.starting_price)
    : domain.price;
  const currency = auction ? auction.currency : domain.currency;
  const linkTo = auction ? `/auctions/${auction.id}` : `/domains/${domain.id}`;

  return (
    <Link to={linkTo} className="group block no-underline">
      <div className="bg-bg-card border border-border rounded-xl p-5 hover:border-border-hover hover:bg-bg-card-hover transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-text-primary font-semibold text-lg truncate group-hover:text-accent transition-colors">
              {fullName}
            </h3>
            {domain.category && (
              <span className="text-xs text-text-muted uppercase tracking-wider">{domain.category}</span>
            )}
          </div>
          {domain.is_premium ? (
            <span className="bg-accent-dim text-accent text-xs font-bold px-2 py-1 rounded-md ml-2">PREMIUM</span>
          ) : null}
        </div>

        {domain.description && (
          <p className="text-text-secondary text-sm mb-3 line-clamp-2">{domain.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div>
            <span className="text-accent font-bold text-xl">{currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency}{price?.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            {auction && (
              <span className="flex items-center gap-1 text-info text-xs">
                <Gavel className="w-3 h-3" /> Auction
              </span>
            )}
            <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
