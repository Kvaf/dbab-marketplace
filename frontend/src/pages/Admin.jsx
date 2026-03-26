import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Shield, Users, Globe, Gavel, ArrowRightLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('escrow');
  const [escrows, setEscrows] = useState([]);
  const [users, setUsers] = useState([]);
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    api.adminStats().then(setStats).catch(() => {});
    api.adminEscrow().then(setEscrows).catch(() => {});
  }, [user, loading]);

  useEffect(() => {
    if (tab === 'users') api.adminUsers().then(setUsers).catch(() => {});
    if (tab === 'domains') api.adminDomains().then(setDomains).catch(() => {});
  }, [tab]);

  if (loading) return <div className="pt-24 text-center text-text-muted">Loading...</div>;
  if (!user || user.role !== 'admin') return null;

  const handleEscrowAction = async (id, action) => {
    try {
      if (action === 'verify') await api.adminVerifyEscrow(id);
      else if (action === 'complete') await api.adminCompleteEscrow(id);
      else if (action === 'cancel') await api.adminCancelEscrow(id);
      api.adminEscrow().then(setEscrows);
      api.adminStats().then(setStats);
    } catch (err) {
      alert(err.message);
    }
  };

  const statusColors = {
    pending: 'text-warning', paid: 'text-info', verified: 'text-accent', completed: 'text-accent', cancelled: 'text-danger',
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3"><Shield className="w-8 h-8 text-warning" /> Admin Panel</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Users', value: stats.users, icon: Users },
            { label: 'Domains', value: stats.domains, icon: Globe },
            { label: 'Auctions', value: stats.activeAuctions, icon: Gavel },
            { label: 'Pending Escrow', value: stats.pendingEscrow, icon: Clock },
            { label: 'Completed Sales', value: stats.completedSales, icon: CheckCircle },
          ].map((s, i) => (
            <div key={i} className="bg-bg-card border border-border rounded-xl p-4 text-center">
              <s.icon className="w-5 h-5 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-text-primary">{s.value}</div>
              <div className="text-text-muted text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['escrow', 'domains', 'users'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm capitalize border-none cursor-pointer transition ${tab === t ? 'bg-bg-card text-text-primary' : 'bg-transparent text-text-muted hover:text-text-secondary'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Escrow management */}
      {tab === 'escrow' && (
        <div className="space-y-3">
          {escrows.map(e => (
            <div key={e.id} className="bg-bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-text-primary font-semibold">{e.domain_name}.{e.tld}</span>
                  <span className={`ml-3 text-xs font-bold capitalize ${statusColors[e.status]}`}>{e.status}</span>
                </div>
                <span className="text-accent font-bold text-lg">${e.amount?.toLocaleString()}</span>
              </div>
              <div className="text-text-muted text-sm mb-3">
                Buyer: <strong className="text-text-secondary">{e.buyer_name}</strong> → Seller: <strong className="text-text-secondary">{e.seller_name}</strong>
                {e.payment_reference && <span className="ml-3">Ref: {e.payment_reference}</span>}
              </div>
              <div className="flex gap-2">
                {e.status === 'paid' && (
                  <button onClick={() => handleEscrowAction(e.id, 'verify')} className="bg-accent/20 text-accent px-3 py-1.5 rounded-lg text-sm border border-accent/30 cursor-pointer hover:bg-accent/30 transition flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verify Payment
                  </button>
                )}
                {e.status === 'verified' && (
                  <button onClick={() => handleEscrowAction(e.id, 'complete')} className="bg-accent/20 text-accent px-3 py-1.5 rounded-lg text-sm border border-accent/30 cursor-pointer hover:bg-accent/30 transition flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Complete & Transfer
                  </button>
                )}
                {['pending', 'paid', 'verified'].includes(e.status) && (
                  <button onClick={() => handleEscrowAction(e.id, 'cancel')} className="bg-danger/10 text-danger px-3 py-1.5 rounded-lg text-sm border border-danger/20 cursor-pointer hover:bg-danger/20 transition flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
          {escrows.length === 0 && <div className="text-text-muted text-center py-10">No escrow transactions</div>}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="bg-bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-text-primary font-semibold">{u.username}</span>
                <span className="text-text-muted text-sm ml-3">{u.email}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded capitalize ${u.role === 'admin' ? 'text-warning bg-warning/10' : 'text-text-muted bg-bg-secondary'}`}>{u.role}</span>
            </div>
          ))}
        </div>
      )}

      {/* Domains */}
      {tab === 'domains' && (
        <div className="space-y-2">
          {domains.map(d => (
            <div key={d.id} className="bg-bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-text-primary font-semibold">{d.name}.{d.tld}</span>
                <span className="text-text-muted text-sm ml-3">by {d.seller_name}</span>
                <span className={`ml-3 text-xs capitalize ${d.status === 'active' ? 'text-accent' : 'text-text-muted'}`}>{d.status}</span>
              </div>
              <span className="text-accent font-bold">${d.price?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
