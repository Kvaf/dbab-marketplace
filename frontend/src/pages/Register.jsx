import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form.email, form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-md mx-auto">
      <div className="text-center mb-8">
        <UserPlus className="w-10 h-10 text-accent mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-text-secondary mt-2">Join the domain marketplace</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-text-secondary text-sm block mb-1">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
            className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-text-primary outline-none focus:border-accent/40 transition" />
        </div>
        <div>
          <label className="text-text-secondary text-sm block mb-1">Username</label>
          <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required
            className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-text-primary outline-none focus:border-accent/40 transition" />
        </div>
        <div>
          <label className="text-text-secondary text-sm block mb-1">Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6}
            className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-text-primary outline-none focus:border-accent/40 transition" />
        </div>
        {error && <div className="text-danger text-sm">{error}</div>}
        <button type="submit" className="w-full bg-accent text-bg-primary py-3 rounded-xl font-semibold hover:brightness-110 transition border-none cursor-pointer">Create Account</button>
        <p className="text-text-muted text-sm text-center">
          Already have an account? <Link to="/login" className="text-accent no-underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}
