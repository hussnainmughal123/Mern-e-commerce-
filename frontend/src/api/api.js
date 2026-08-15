import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export const getProducts = async ({
  search = '',
  category = '',
  brand = '',
  minRating = '',
  sort = '',
  page = 1,
  limit = 12,
} = {}) => {
  try {
    const params = { page, limit };
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;
    if (brand && brand !== 'All') params.brand = brand;
    if (minRating) params.minRating = minRating;
    if (sort) params.sort = sort;
    const { data } = await api.get('/products', { params });
    return { products: data.data, total: data.total, page: data.page, totalPages: data.totalPages };
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

export const bulkDeleteProducts = async (ids) => {
  try {
    const { data } = await api.delete('/products/bulk', { data: { ids } });
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

export const getBrands = async () => {
  try {
    const { data } = await api.get('/products/brands/list');
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export default api;
