import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-md mx-auto">
      <div className="text-center mb-8">
        <LogIn className="w-10 h-10 text-accent mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-text-secondary mt-2">Log in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-text-secondary text-sm block mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-text-primary outline-none focus:border-accent/40 transition" />
        </div>
        <div>
          <label className="text-text-secondary text-sm block mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-text-primary outline-none focus:border-accent/40 transition" />
        </div>
        {error && <div className="text-danger text-sm">{error}</div>}
        <button type="submit" className="w-full bg-accent text-bg-primary py-3 rounded-xl font-semibold hover:brightness-110 transition border-none cursor-pointer">Log in</button>
        <p className="text-text-muted text-sm text-center">
          Don't have an account? <Link to="/register" className="text-accent no-underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
