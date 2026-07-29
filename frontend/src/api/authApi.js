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
