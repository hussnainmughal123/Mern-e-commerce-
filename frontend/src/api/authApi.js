import api from './api';

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';

export const signup = async ({ name, email, password }) => {
  try {
    const { data } = await api.post('/auth/signup', { name, email, password });
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const login = async ({ email, password }) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getProfile = async () => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateProfile = async ({ name, email }) => {
  try {
    const { data } = await api.put('/auth/profile', { name, email });
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const forgotPassword = async (email) => {
  try {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data.message;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const resetPassword = async (token, password) => {
  try {
    const { data } = await api.put(`/auth/reset-password/${token}`, { password });
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
