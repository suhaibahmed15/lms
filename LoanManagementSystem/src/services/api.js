import axios from "axios";
import { logoutUser } from "../utils/auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || "";
        const isAuthEndpoint =
            url.includes("/auth/login") || url.includes("/auth/register");

        if (status === 401 && !isAuthEndpoint) {
            logoutUser();
        }

        return Promise.reject(error);
    }
);

export default api;