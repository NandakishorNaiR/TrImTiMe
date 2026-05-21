import api from './axios';

export const getNotifications = async() => {
    const res = await api.get('/notifications');
    return res.data;
};

export const markNotificationRead = async(id) => {
    const res = await api.post(`/notifications/${id}/read`);
    return res.data;
};