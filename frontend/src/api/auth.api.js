import api from "./axios";

export const loginUser = async(payload) => {
    const res = await api.post("/auth/login", payload);
    return res.data;
};
// auth api placeholder
export const login = async(creds) => ({ token: null });

export const getMyProfile = async() => {
    const res = await api.get('/auth/me');
    return res.data;
};

export const updateMyProfile = async(data) => {
    const res = await api.put('/auth/profile', data);
    return res.data;
};