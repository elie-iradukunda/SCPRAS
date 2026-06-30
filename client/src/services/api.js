import axios from 'axios';

const TOKEN_KEY = 'scpras_token';
const USER_KEY = 'scpras_user';

function migrateLegacySession() {
  const legacyToken = localStorage.getItem('buildintel_token');
  const legacyUser = localStorage.getItem('buildintel_user');
  if (!localStorage.getItem(TOKEN_KEY) && legacyToken) localStorage.setItem(TOKEN_KEY, legacyToken);
  if (!localStorage.getItem(USER_KEY) && legacyUser) localStorage.setItem(USER_KEY, legacyUser);
  localStorage.removeItem('buildintel_token');
  localStorage.removeItem('buildintel_user');
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  migrateLegacySession();
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function saveSession({ token, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getSessionUser() {
  migrateLegacySession();
  const rawUser = localStorage.getItem(USER_KEY);
  return rawUser ? JSON.parse(rawUser) : null;
}

export function hasSession() {
  migrateLegacySession();
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('buildintel_token');
  localStorage.removeItem('buildintel_user');
}

export function apiErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Request failed.';
}
