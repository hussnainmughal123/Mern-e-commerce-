import api from './api';

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';

export const createOrder = async (shippingAddress) => {
  try {
    const { data } = await api.post('/orders', { shippingAddress });
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getMyOrders = async () => {
  try {
    const { data } = await api.get('/orders/my');
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getOrder = async (id) => {
  try {
    const { data } = await api.get(`/orders/${id}`);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
