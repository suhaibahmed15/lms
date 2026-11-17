
import api from "./api";

// User Login
export const loginUser = async (loginData) => {
    const response = await api.post("/auth/login", loginData);

    return response.data;
};

// Customer Registration
export const registerUser = async (registerData) => {
    const response = await api.post("/auth/register", registerData);

    return response.data;
};
