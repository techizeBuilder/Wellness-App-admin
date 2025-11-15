import config from './config';

const getToken = () => localStorage.getItem('adminToken');

// Get the base URL for API calls
const getBaseUrl = () => {
  return config.getApiUrl();
};

const headers = (isJson = true) => {
  const h = {};
  if (isJson) h['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

export const apiGet = async (path) => {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, { method: 'GET', headers: headers() });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw body;
  return body;
};

export const apiPost = async (path, data) => {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw body;
  return body;
};

export const apiPut = async (path, data) => {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, { method: 'PUT', headers: headers(), body: JSON.stringify(data) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw body;
  return body;
};

export const apiDelete = async (path) => {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, { method: 'DELETE', headers: headers() });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw body;
  return body;
};

export const apiPatch = async (path, data) => {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, { method: 'PATCH', headers: headers(), body: JSON.stringify(data) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw body;
  return body;
};