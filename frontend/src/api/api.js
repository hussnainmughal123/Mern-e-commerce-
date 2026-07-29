import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach the auth token (once Phase 2 login is added) to every
// outgoing request, without any calling code needing to know about it.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized response handling: normalizes errors and will later handle
// automatic logout on 401 once auth is wired up in Phase 2.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';

export const getProducts = async ({ search = '', category = '' } = {}) => {
  try {
    const params = {};
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;
    const { data } = await api.get('/products', { params });
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getProduct = async (id) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createProduct = async (product) => {
  try {
    const { data } = await api.post('/products', product);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateProduct = async (id, product) => {
  try {
    const { data } = await api.put(`/products/${id}`, product);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteProduct = async (id) => {
  try {
    const { data } = await api.delete(`/products/${id}`);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getStats = async () => {
  try {
    const { data } = await api.get('/products/stats/summary');
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getCategories = async () => {
  try {
    const { data } = await api.get('/products/categories/list');
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export default api;
