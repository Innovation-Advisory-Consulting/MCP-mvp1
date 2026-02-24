const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mcp-mvp1-api.delightfulplant-00baa31a.eastus.azurecontainerapps.io/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408, null);
    }
    throw error;
  }
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorData;
    if (isJson) {
      errorData = await response.json();
    } else {
      errorData = { message: await response.text() };
    }

    throw new ApiError(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData
    );
  }

  if (response.status === 204) {
    return null;
  }

  if (isJson) {
    return response.json();
  }

  return response.text();
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetchWithTimeout(url, { ...defaultOptions, ...options });
  return handleResponse(response);
}

export const customerApi = {
  async getAll({ page = 1, limit = 10, search = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);

    const query = params.toString();
    return apiRequest(`/customers${query ? `?${query}` : ''}`);
  },

  async getById(id) {
    return apiRequest(`/customers/${id}`);
  },

  async create(customerData) {
    return apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  async update(id, customerData) {
    return apiRequest(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(customerData),
    });
  },

  async delete(id) {
    return apiRequest(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

export const healthApi = {
  async check() {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL.replace('/api', '')}/health`, {}, 5000);
      return handleResponse(response);
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  },

  async ready() {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL.replace('/api', '')}/ready`, {}, 5000);
      return handleResponse(response);
    } catch (error) {
      console.error('Ready check failed:', error);
      return { status: 'not ready', error: error.message };
    }
  },
};

export { ApiError, API_BASE_URL };
