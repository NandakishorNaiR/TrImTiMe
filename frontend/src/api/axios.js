import axios from "axios";
import { getToken } from "../utils/storage";

// Use /api directly. During dev, Vite proxy forwards to backend.
// In production, /api is served by the same host (backend or CDN).
const base =
    import.meta.env.VITE_API_BASE || '/api';

const api = axios.create({ baseURL: base });

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;