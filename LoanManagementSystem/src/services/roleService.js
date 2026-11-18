
import api from "./api";

// Get all roles (supports pagination, search, sorting, filtering)
export const getAllRoles = async (params = {}) => {
    const response = await api.get("/Roles", { params });
    return response.data;
};

// Get role by ID.
// This endpoint requires ROLE_MANAGE permission.
export const getRoleById = async (id) => {
    const response = await api.get(`/Roles/${id}`);
    return response.data;
};

// Get currently logged-in user's role.
export const getMyRole = async () => {
    const response = await api.get("/Roles/my-role");
    return response.data;
};

// Create role.
export const createRole = async (roleData) => {
    const response = await api.post("/Roles", roleData);
    return response.data;
};

// Update role.
export const updateRole = async (id, roleData) => {
    const response = await api.put(`/Roles/${id}`, roleData);
    return response.data;
};

// Delete role.
export const deleteRole = async (id) => {
    const response = await api.delete(`/Roles/${id}`);
    return response.data;
};
