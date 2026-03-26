import { Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-accent" />
              <span className="text-lg font-bold text-text-primary">dbab<span className="text-accent">.tech</span></span>
            </div>
            <p className="text-text-muted text-sm">The trusted domain marketplace. Buy, sell, and auction premium domains with secure escrow.</p>
          </div>
          <div>
            <h4 className="text-text-primary font-semibold text-sm mb-3">Marketplace</h4>
            <div className="space-y-2">
              <a href="/browse" className="block text-text-muted hover:text-text-secondary text-sm no-underline">Browse Domains</a>
              <a href="/auctions" className="block text-text-muted hover:text-text-secondary text-sm no-underline">Auctions</a>
              <a href="/sell" className="block text-text-muted hover:text-text-secondary text-sm no-underline">Sell a Domain</a>
            </div>
          </div>
          <div>
            <h4 className="text-text-primary font-semibold text-sm mb-3">Support</h4>
            <div className="space-y-2">
              <a href="#" className="block text-text-muted hover:text-text-secondary text-sm no-underline">How it Works</a>
              <a href="#" className="block text-text-muted hover:text-text-secondary text-sm no-underline">Escrow Protection</a>
              <a href="#" className="block text-text-muted hover:text-text-secondary text-sm no-underline">FAQ</a>
            </div>
          </div>
          <div>
            <h4 className="text-text-primary font-semibold text-sm mb-3">Legal</h4>
            <div className="space-y-2">
              <a href="#" className="block text-text-muted hover:text-text-secondary text-sm no-underline">Terms of Service</a>
              <a href="#" className="block text-text-muted hover:text-text-secondary text-sm no-underline">Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-text-muted text-xs">
          &copy; {new Date().getFullYear()} dbab.tech. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
