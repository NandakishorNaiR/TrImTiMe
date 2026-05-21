import api from "./axios";

export const getTodayBookings = async() => {
    const res = await api.get("/bookings/shop/today");
    return res.data;
};

export const getUpcomingBookings = async() => {
    const res = await api.get("/bookings/shop/upcoming");
    return res.data;
};

export const completeBooking = async(bookingId) => {
    const res = await api.post(`/bookings/${bookingId}/complete`);
    return res.data;
};

export const getBarberDashboard = async() => {
    const res = await api.get('/bookings/shop/dashboard');
    return res.data;
};

export const getMyShop = async() => {
    const res = await api.get('/barber/shop');
    return res.data;
};

export const updateMyShop = async(data) => {
    const res = await api.put('/barber/shop', data);
    return res.data;
};

export const createMyShop = async(data) => {
    const res = await api.post('/barber/shop', data);
    return res.data;
};

export const getClosures = async() => {
    const res = await api.get('/barber/closures');
    return res.data;
};

export const getMyShopStats = async() => {
    const res = await api.get('/barber/shop/stats');
    return res.data;
};

export const addClosure = async(payload) => {
    const res = await api.post('/barber/closures', payload);
    return res.data;
};

export const addService = async(data) => {
    const res = await api.post('/barber/services', data);
    return res.data;
};

export const updateService = async(index, data) => {
    const res = await api.put(`/barber/services/${index}`, data);
    return res.data;
};

export const deleteService = async(index) => {
    const res = await api.delete(`/barber/services/${index}`);
    return res.data;
};

export const closeShopForDay = async(data) => {
    const res = await api.post('/barber/close-day', data);
    return res.data;
};

export const getClosureImpact = async(date) => {
    const res = await api.get('/barber/closure-impact', { params: { date } });
    return res.data;
};