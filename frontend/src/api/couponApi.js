import api from './api';

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';

export const validateCoupon = async (code, orderAmount) => {
  try {
    const { data } = await api.post('/coupons/validate', { code, orderAmount });
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getAllCoupons = async () => {
  try {
    const { data } = await api.get('/coupons');
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createCoupon = async (coupon) => {
  try {
    const { data } = await api.post('/coupons', coupon);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateCoupon = async (id, coupon) => {
  try {
    const { data } = await api.put(`/coupons/${id}`, coupon);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteCoupon = async (id) => {
  try {
    const { data } = await api.delete(`/coupons/${id}`);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
