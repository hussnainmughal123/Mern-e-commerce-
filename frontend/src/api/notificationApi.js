import api from './api';

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';

export const getMyNotifications = async () => {
  try {
    const { data } = await api.get('/notifications');
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const { data } = await api.put('/notifications/read-all');
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
