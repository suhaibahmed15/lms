import api from "./api";

// Get all statuses with optional category filter
export const getAllStatuses = async (params = {}) => {
    const response = await api.get("/Statuses", { params });
    return response.data;
};

// Get single status by ID
export const getStatusById = async (id) => {
    const response = await api.get(`/Statuses/${id}`);
    return response.data;
};

// Create a new master status
export const createStatus = async (data) => {
    const response = await api.post("/Statuses", data);
    return response.data;
};

// Update an existing status
export const updateStatus = async (id, data) => {
    const response = await api.post(`/Statuses/${id}`, data);
    return response.data;
};

// Change active/inactive flag of a status
export const changeStatusActive = async (id, data) => {
    const response = await api.post(`/Statuses/${id}/status`, data);
    return response.data;
};

// Delete status
export const deleteStatus = async (id) => {
    const response = await api.delete(`/Statuses/${id}`);
    return response.data;
};

export default {
    getAllStatuses,
    getStatusById,
    createStatus,
    updateStatus,
    changeStatusActive,
    deleteStatus
};
