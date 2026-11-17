
import api from "./api";

// ==========================================
// PERMISSIONS
// ==========================================

// Get All Permissions
export const getAllPermissions = async () => {
    const response = await api.get("/Permissions");
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

// Delete Permission
export const deletePermission = async (id) => {
    const response = await api.delete(`/Permissions/${id}`);
    return response.data;
};


// ==========================================
// ROLE PERMISSIONS
// ==========================================

// Get All Role Permissions
export const getAllRolePermissions = async () => {
    const response = await api.get("/RolePermissions");
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

// Get All User Permissions
export const getAllUserPermissions = async () => {
    const response = await api.get("/UserPermissions");
    return response.data;
};

// Get Permissions By User ID
export const getUserPermissions = async (userId) => {
    const response = await api.get(`/UserPermissions/user/${userId}`);
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
