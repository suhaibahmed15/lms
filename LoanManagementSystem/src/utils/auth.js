
export const AUTH_CHANGED_EVENT = "lms-auth-changed";
export const MENUS_UPDATED_EVENT = "lms-menus-updated";

export const notifyAuthChanged = () => {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const notifyMenusUpdated = () => {
    window.dispatchEvent(new Event(MENUS_UPDATED_EVENT));
};

// Get JWT Token
export const getToken = () => {
    return localStorage.getItem("token");
};

// Save Authenticated Session (without RoleName in localStorage)
export const setAuthSession = (authData) => {
    localStorage.setItem("token", authData.token);

    const userData = {
        userId: authData.userId,
        fullName: authData.fullName,
        email: authData.email,
        roleId: authData.roleId
    };

    localStorage.setItem("user", JSON.stringify(userData));
    notifyAuthChanged();
};

// Get Logged-in User
export const getCurrentUser = () => {
    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {
        console.error("Invalid user data:", error);
        return null;
    }
};

// Get Current User ID
export const getUserId = () => {
    const user = getCurrentUser();

    return user?.userId || user?.id || null;
};

// Get Current Role ID
export const getRoleId = () => {
    const user = getCurrentUser();

    return user?.roleId || null;
};

// Check Login Status
export const isAuthenticated = () => {
    const token = getToken();
    return typeof token === "string" && token.trim().length > 0;
};

// Logout User
export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    notifyAuthChanged();
};
    