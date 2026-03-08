// src/api/axiosInstance.js
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api/v7';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 12000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (err) => Promise.reject(err)
);

// Optional: Auto-refresh token on 401
api.interceptors.response.use(    (res) => res,
    async (error) => {
        const originalReq = error.config;
        if (error.response?.status === 401 && !originalReq._retry) {
            originalReq._retry = true;
            const refresh = localStorage.getItem('refresh_token');
            if (refresh) {
                try {
                    const { data } = await axios.post(`${API_BASE}/token/refresh/`, { refresh });
                    localStorage.setItem('access_token', data.access);
                    originalReq.headers.Authorization = `Bearer ${data.access}`;
                    return api(originalReq);
                } catch  {
                    localStorage.clear();
                    window.location.href = '/';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;