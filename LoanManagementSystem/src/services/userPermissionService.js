
import api from "./api";

// Get all user permission assignments
export const getAllUserPermissions = async (params = {}) => {
    const response = await api.get("/UserPermissions", { params });
    return response.data;
};

// Get permissions assigned to a specific user
export const getUserPermissionsByUserId = async (userId, params = {}) => {
    const response = await api.get(`/UserPermissions/user/${userId}`, { params });
    return response.data;
};

// Assign permission to a user
export const assignUserPermission = async (permissionData) => {
    const response = await api.post("/UserPermissions", permissionData);
    return response.data;
};

// Revoke user permission
export const revokeUserPermission = async (id, revokedByUserId) => {
    const response = await api.post(
        `/UserPermissions/${id}/revoke?revokedByUserId=${revokedByUserId}`
    );

    return response.data;
};
