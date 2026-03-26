import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Globe, Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <Globe className="w-7 h-7 text-accent" />
            <span className="text-xl font-bold text-text-primary tracking-tight">dbab<span className="text-accent">.tech</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/browse" className="text-text-secondary hover:text-text-primary transition-colors text-sm no-underline">Browse</Link>
            <Link to="/auctions" className="text-text-secondary hover:text-text-primary transition-colors text-sm no-underline">Auctions</Link>
            <Link to="/sell" className="text-text-secondary hover:text-text-primary transition-colors text-sm no-underline">Sell</Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors text-sm no-underline flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-warning hover:text-text-primary transition-colors text-sm no-underline flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="text-text-muted hover:text-danger transition-colors text-sm flex items-center gap-1 bg-transparent border-none cursor-pointer">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-text-secondary hover:text-text-primary transition-colors text-sm no-underline">Log in</Link>
                <Link to="/register" className="bg-accent text-bg-primary px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition no-underline">Sign up</Link>
              </div>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-text-secondary bg-transparent border-none cursor-pointer">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-bg-secondary px-4 py-4 space-y-3">
          <Link to="/browse" onClick={() => setMenuOpen(false)} className="block text-text-secondary hover:text-text-primary text-sm no-underline">Browse Domains</Link>
          <Link to="/auctions" onClick={() => setMenuOpen(false)} className="block text-text-secondary hover:text-text-primary text-sm no-underline">Auctions</Link>
          <Link to="/sell" onClick={() => setMenuOpen(false)} className="block text-text-secondary hover:text-text-primary text-sm no-underline">Sell a Domain</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-text-secondary hover:text-text-primary text-sm no-underline">Dashboard</Link>
              {user.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-warning text-sm no-underline">Admin</Link>}
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-danger text-sm bg-transparent border-none cursor-pointer">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-text-secondary text-sm no-underline">Log in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block text-accent font-semibold text-sm no-underline">Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
