const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('equinox_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || 'Request failed', response.status, data);
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
};

export const authApi = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  bootstrap: () => api.get('/bootstrap'),
};

export const walletApi = {
  transfer: (data) => api.post('/wallet/transfer', data),
};

export const paymentApi = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  upi: (data) => api.post('/payments/upi', data),
};

export const cardApi = {
  freeze: (data) => api.post('/cards/freeze', data),
};

export const poolApi = {
  create: (data) => api.post('/pools', data),
  contribute: (data) => api.post('/pools/contribute', data),
};

export const skillApi = {
  create: (data) => api.post('/skills', data),
};

export const contractApi = {
  create: (data) => api.post('/contracts', data),
  settle: (data) => api.post('/contracts/settle', data),
};

export const reviewApi = {
  create: (data) => api.post('/reviews', data),
};

export const queryApi = {
  run: (data) => api.post('/query-demonstrator', data),
};

export { ApiError };