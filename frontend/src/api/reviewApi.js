import api from './api';

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';

export const getProductReviews = async (productId) => {
  try {
    const { data } = await api.get(`/reviews/${productId}`);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const submitReview = async (productId, rating, comment) => {
  try {
    const { data } = await api.post(`/reviews/${productId}`, { rating, comment });
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteReview = async (productId) => {
  try {
    const { data } = await api.delete(`/reviews/${productId}`);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
