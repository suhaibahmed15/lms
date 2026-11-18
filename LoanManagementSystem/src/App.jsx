
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate
} from "react-router-dom";

import { useEffect, useState } from "react";

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
import Permissions from "./pages/Permissions";
import RoleMenus from "./pages/RoleMenus";
import RolePermissions from "./pages/RolePermissions";

// Utilities
import {
    AUTH_CHANGED_EVENT,
    isAuthenticated,
    setAuthSession
} from "./utils/auth";

function AuthPage({ onAuthChange }) {
    const [showLogin, setShowLogin] = useState(true);

    const navigate = useNavigate();

    const handleLoginSuccess = (authData) => {
        setAuthSession(authData);

        if (onAuthChange) {
            onAuthChange(true);
        }

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
    const [authenticated, setAuthenticated] = useState(() => isAuthenticated());

    useEffect(() => {
        const syncAuthState = () => {
            setAuthenticated(isAuthenticated());
        };

        window.addEventListener(AUTH_CHANGED_EVENT, syncAuthState);
        window.addEventListener("storage", syncAuthState);

        return () => {
            window.removeEventListener(AUTH_CHANGED_EVENT, syncAuthState);
            window.removeEventListener("storage", syncAuthState);
        };
    }, []);

    return (
        <Routes>

            <Route
                path="/login"
                element={
                    authenticated
                        ? <Navigate to="/dashboard" replace />
                        : <AuthPage onAuthChange={setAuthenticated} />
                }
            />

            <Route element={<ProtectedRoute authenticated={authenticated} />}>

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

                <Route
                    path="/permissions"
                    element={<Permissions />}
                />

                <Route
                    path="/role-menus"
                    element={<RoleMenus />}
                />

                <Route
                    path="/role-permissions"
                    element={<RolePermissions />}
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
                element={<Navigate to={authenticated ? "/dashboard" : "/login"} replace />}
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
