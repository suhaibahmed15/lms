
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate
} from "react-router-dom";

import { useState } from "react";

// Authentication Components
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

// Common Components
import ProtectedRoute from "./components/common/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Roles from "./pages/Roles";
import Menus from "./pages/Menus";
import Users from "./pages/Users";
import UserMenus from "./pages/UserMenus";
import UserPermissions from "./pages/UserPermissions";

// Utilities
import { isAuthenticated } from "./utils/auth";

// Read role name from JWT
const getRoleNameFromToken = (token) => {
    try {
        const payload = token.split(".")[1];

        const base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const decoded = JSON.parse(
            atob(base64)
        );

        const roleKey = Object.keys(decoded).find(
            key =>
                key === "role" ||
                key.endsWith("/claims/role")
        );

        return roleKey ? decoded[roleKey] : null;

    } catch (error) {
        console.error("Unable to read JWT role:", error);
        return null;
    }
};

function AuthPage() {
    const [showLogin, setShowLogin] = useState(true);

    const navigate = useNavigate();

    const handleLoginSuccess = (authData) => {
        localStorage.setItem("token", authData.token);

        const roleName =
            authData.roleName ||
            authData.role ||
            getRoleNameFromToken(authData.token);

        const userData = {
            userId: authData.userId,
            fullName: authData.fullName,
            email: authData.email,
            roleId: authData.roleId,
            // roleName: roleName
        };

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        navigate("/dashboard", { replace: true });
    };

    return (
        <>
            {showLogin ? (
                <Login
                    onLoginSuccess={handleLoginSuccess}
                    onSwitch={() => setShowLogin(false)}
                />
            ) : (
                <Signup
                    onLoginSuccess={handleLoginSuccess}
                    onSwitch={() => setShowLogin(true)}
                />
            )}
        </>
    );
}

function AppRoutes() {
    const authenticated = isAuthenticated();

    return (
        <Routes>

            <Route
                path="/login"
                element={
                    authenticated
                        ? <Navigate to="/dashboard" replace />
                        : <AuthPage />
                }
            />

            <Route element={<ProtectedRoute />}>

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/roles"
                    element={<Roles />}
                />

                <Route
                    path="/menus"
                    element={<Menus />}
                />

                <Route
                    path="/users"
                    element={<Users />}
                />

                <Route
                    path="/user-menus"
                    element={<UserMenus />}
                />

                <Route
                    path="/user-permissions"
                    element={<UserPermissions />}
                />

            </Route>

            <Route
                path="/"
                element={
                    <Navigate
                        to={authenticated ? "/dashboard" : "/login"}
                        replace
                    />
                }
            />

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />

        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;
