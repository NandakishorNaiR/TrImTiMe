import api from "./axios";

export const createBooking = async(payload) => {
    const res = await api.post("/bookings", payload);
    return res.data;
};

export const getMyBookings = async() => {
    const res = await api.get("/bookings/my");
    return res.data;
};

export const cancelBooking = async(bookingId) => {
    const res = await api.post(`/bookings/${bookingId}/cancel`);
    return res.data;
};

export const getAvailableSlots = async(shopId, date, duration) => {
    // Use shop slots endpoint which accepts { date, services }
    const services = [{ duration }];
    const res = await api.post(`/shops/${shopId}/slots`, { date, services });
    return res.data;
};

export const markCustomerArrived = async(bookingId) => {
    const res = await api.post(`/bookings/${bookingId}/checkin`);
    return res.data;
};

export const markBookingCompleted = async(bookingId) => {
    const res = await api.post(`/bookings/${bookingId}/complete`);
    return res.data;
};

export const markCodReceived = async(bookingId) => {
    const res = await api.post(`/bookings/${bookingId}/cod-received`);
    return res.data;
};

export const markPaymentAsPaid = async(bookingId, paymentMethod) => {
    const res = await api.post(`/bookings/${bookingId}/mark-paid`, { paymentMethod });
    return res.data;
};