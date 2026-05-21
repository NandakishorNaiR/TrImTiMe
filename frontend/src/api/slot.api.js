import api from "./axios";

export const getAvailableSlots = async({ shopId, date, services }) => {
    const res = await api.post(`/shops/${shopId}/slots`, { date, services });
    return res.data;
};