
import api from "./api";

// Get All Users
export const getAllUsers = async () => {
    const response = await api.get("/Users");

    return response.data;
};

// Get User By ID
export const getUserById = async (id) => {
    const response = await api.get(`/Users/${id}`);

    return response.data;
};

// Create User
export const createUser = async (userData) => {
    const response = await api.post("/Users", userData);

    return response.data;
};

// Update User
export const updateUser = async (id, userData) => {
    const response = await api.post(`/Users/${id}`, userData);

    return response.data;
};

// Delete User
export const deleteUser = async (id) => {
    const response = await api.delete(`/Users/${id}`);

    return response.data;
};
