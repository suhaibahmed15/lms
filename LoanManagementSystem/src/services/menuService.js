
import api from "./api";

// Get All Menus
export const getAllMenus = async () => {
    const response = await api.get("/Menus");
    return response.data;
};

// Get Menu By ID
export const getMenuById = async (id) => {
    const response = await api.get(`/Menus/${id}`);
    return response.data;
};

// Create Menu
export const createMenu = async (menuData) => {
    const response = await api.post("/Menus", menuData);
    return response.data;
};

// Update Menu
export const updateMenu = async (id, menuData) => {
    const response = await api.post(`/Menus/${id}`, menuData);
    return response.data;
};

// Soft Delete Menu
export const deleteMenu = async (id) => {
    const response = await api.delete(`/Menus/${id}`);
    return response.data;
};

// Get All Role Menu Assignments
export const getAllRoleMenus = async () => {
    const response = await api.get("/RoleMenus");
    return response.data;
};

// Get Menus Assigned To A Specific Role
export const getMenusByRole = async (roleId) => {
    const response = await api.get(`/RoleMenus/role/${roleId}`);
    return response.data;
};

// Get All Menus Available To A User (Role + Individual)
export const getMenusByUser = async (userId) => {
    const response = await api.get(`/Menus/user/${userId}`);
    return response.data;
};

// Get All Individual User Menu Assignments
export const getAllUserMenuAssignments = async () => {
    const response = await api.get("/UserMenus");
    return response.data;
};

// Get Individual Menus Assigned To A User
export const getUserMenuAssignments = async (userId) => {
    const response = await api.get(`/UserMenus/user/${userId}`);
    return response.data;
};

// Assign Menu To User
export const assignUserMenu = async (menuData) => {
    const response = await api.post("/UserMenus", menuData);
    return response.data;
};

// Remove Menu From User
export const removeUserMenu = async (id) => {
    const response = await api.delete(`/UserMenus/${id}`);
    return response.data;
};
