
// Get JWT Token
export const getToken = () => {
    return localStorage.getItem("token");
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
    return !!getToken();
};

// Logout User
export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
    