
import api from "./api";

// ==========================================
// PERMISSIONS
// ==========================================

// Get All Permissions (supports pagination, search, sorting, filtering)
export const getAllPermissions = async (params = {}) => {
    const response = await api.get("/Permissions", { params });
    return response.data;
};

// Get Permission By ID
export const getPermissionById = async (id) => {
    const response = await api.get(`/Permissions/${id}`);
    return response.data;
};

// Create Permission
export const createPermission = async (permissionData) => {
    const response = await api.post("/Permissions", permissionData);
    return response.data;
};

// Update Permission
export const updatePermission = async (id, permissionData) => {
    const response = await api.post(`/Permissions/${id}`, permissionData);
    return response.data;
};

// Get Effective Active Permissions For A User (Role + Direct User Permissions, excluding revoked)
export const getEffectivePermissionsByUser = async (userId) => {
    const response = await api.get(`/Permissions/user/${userId}`);
    return response.data;
};

// Delete Permission
export const deletePermission = async (id) => {
    const response = await api.delete(`/Permissions/${id}`);
    return response.data;
};


// ==========================================
// ROLE PERMISSIONS
// ==========================================

// Get All Role Permissions
export const getAllRolePermissions = async (params = {}) => {
    const response = await api.get("/RolePermissions", { params });
    return response.data;
};

// Get Permissions By Role ID
export const getRolePermissions = async (roleId) => {
    const response = await api.get(`/RolePermissions/role/${roleId}`);
    return response.data;
};

// Assign Permission To Role
export const assignPermissionToRole = async (assignmentData) => {
    const response = await api.post("/RolePermissions", assignmentData);
    return response.data;
};

// Remove Permission From Role
export const removeRolePermission = async (id) => {
    const response = await api.delete(`/RolePermissions/${id}`);
    return response.data;
};


// ==========================================
// USER PERMISSIONS
// ==========================================

// Get All User Permissions (supports pagination, search, sorting, filtering)
export const getAllUserPermissions = async (params = {}) => {
    const response = await api.get("/UserPermissions", { params });
    return response.data;
};

// Get Permissions By User ID
export const getUserPermissions = async (userId, params = {}) => {
    const response = await api.get(`/UserPermissions/user/${userId}`, { params });
    return response.data;
};

// Assign Permission To User
export const assignPermissionToUser = async (assignmentData) => {
    const response = await api.post("/UserPermissions", assignmentData);
    return response.data;
};

// Revoke User Permission
export const revokeUserPermission = async (id, revokedByUserId) => {
    const response = await api.post(
        `/UserPermissions/${id}/revoke`,
        null,
        {
            params: {
                revokedByUserId
            }
        }
    );

    return response.data;
};
