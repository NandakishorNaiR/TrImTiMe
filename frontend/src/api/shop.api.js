import api from "./axios";

export const getShops = async() => {
    const res = await api.get("/shops");
    return res.data;
};

export const getShopById = async(id) => {
    const res = await api.get(`/shops/${id}`);
    return res.data;
};
// shop api placeholder
export const listShops = async() => ([]);