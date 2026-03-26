const API = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: getHeaders(),
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email, username, password) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, username, password }) }),
  me: () => request('/auth/me'),

  // Domains
  getDomains: (params = '') => request(`/domains?${params}`),
  getDomain: (id) => request(`/domains/${id}`),
  createDomain: (data) => request('/domains', { method: 'POST', body: JSON.stringify(data) }),
  toggleWatch: (id) => request(`/domains/${id}/watch`, { method: 'POST' }),
  myListings: () => request('/domains/user/listings'),
  myWatchlist: () => request('/domains/user/watchlist'),

  // Auctions
  getAuctions: (params = '') => request(`/auctions?${params}`),
  getAuction: (id) => request(`/auctions/${id}`),
  createAuction: (data) => request('/auctions', { method: 'POST', body: JSON.stringify(data) }),
  placeBid: (id, amount) => request(`/auctions/${id}/bid`, { method: 'POST', body: JSON.stringify({ amount }) }),

  // Escrow
  initiatePurchase: (domain_id) => request('/escrow/initiate', { method: 'POST', body: JSON.stringify({ domain_id }) }),
  markPaymentSent: (id, ref) => request(`/escrow/${id}/payment-sent`, { method: 'POST', body: JSON.stringify({ payment_reference: ref }) }),
  myEscrow: () => request('/escrow/my'),

  // Admin
  adminStats: () => request('/admin/stats'),
  adminEscrow: () => request('/admin/escrow'),
  adminVerifyEscrow: (id) => request(`/admin/escrow/${id}/verify`, { method: 'POST' }),
  adminCompleteEscrow: (id) => request(`/admin/escrow/${id}/complete`, { method: 'POST' }),
  adminCancelEscrow: (id) => request(`/admin/escrow/${id}/cancel`, { method: 'POST' }),
  adminUsers: () => request('/admin/users'),
  adminDomains: () => request('/admin/domains'),
};
