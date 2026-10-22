const API_BASE_URL = 'http://localhost:5000';

/**
 * Universal request wrapper around browser fetch().
 * Automatically adds Content-Type and Bearer auth headers if available.
 */
export async function apiRequest(endpoint, { method = 'GET', body = null } = {}) {
  const token = localStorage.getItem('phishguard_token');

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}