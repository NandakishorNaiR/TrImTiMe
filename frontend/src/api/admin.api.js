import api from "./axios";

export const getSettlements = async() => {
    const res = await api.get("/admin/settlements");
    return res.data;
};

export const markSettlementPaid = async(id) => {
    const res = await api.post(`/admin/settlements/${id}/mark-paid`);
    return res.data;
};

export const getClosures = async() => {
    const res = await api.get('/admin/closures');
    return res.data;
};

export const approveClosure = async(id) => {
    const res = await api.post(`/admin/closures/${id}/approve`);
    return res.data;
};

export const rejectClosure = async(id) => {
    const res = await api.post(`/admin/closures/${id}/reject`);
    return res.data;
};

export const getAuditLogs = async() => {
    const res = await api.get('/admin/audit-logs');
    return res.data;
};

export const getDashboardStats = async() => {
    const res = await api.get('/admin/dashboard');
    return res.data;
};

export const getPlatformRevenue = async() => {
    const res = await api.get('/admin/platform/revenue');
    return res.data;
};

export const getPlatformRevenueSeries = async(days = 30) => {
    const res = await api.get('/admin/platform/revenue/series', { params: { days } });
    return res.data;
};
// Platform revenue APIs removed — frontend no longer requests these endpoints

export const getAllBookings = async(params = {}) => {
    const res = await api.get('/admin/bookings', { params });
    return res.data;
};

export const deleteUser = async(id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
};

export const deleteShop = async(id) => {
    const res = await api.delete(`/admin/shops/${id}`);
    return res.data;
};

export const cancelBooking = async(id) => {
    const res = await api.post(`/admin/bookings/${id}/cancel`);
    return res.data;
};

export const refundBooking = async(id) => {
    const res = await api.patch(`/admin/bookings/${id}/refund`);
    return res.data;
};

export const flagBooking = async(id) => {
    const res = await api.patch(`/admin/bookings/${id}/flag`);
    return res.data;
};

export const getShopStats = async() => {
    const res = await api.get('/admin/shops/stats');
    return res.data;
};

export const getAllShops = async() => {
    const res = await api.get('/admin/shops');
    return res.data;
};

export const toggleShopAcceptCOD = async(shopId, accept) => {
    const res = await api.patch(`/admin/shops/${shopId}/accept-cod`, { accept });
    return res.data;
};

export const setUserCODRestriction = async(userId, until) => {
    const res = await api.patch(`/admin/users/${userId}/cod-restrict`, { until });
    return res.data;
};