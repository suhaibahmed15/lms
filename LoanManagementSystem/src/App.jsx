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
import RouteDispatcher from "./components/common/RouteDispatcher";

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
import LoanTypes from "./pages/LoanTypes";
import LoanApplications from "./pages/LoanApplications";
import LoanDocuments from "./pages/LoanDocuments";
import LoanGuarantors from "./pages/LoanGuarantors";
import Loans from "./pages/Loans";
import Repayments from "./pages/Repayments";
import AuditLogs from "./pages/AuditLogs";
import Reports from "./pages/Reports";
import Statuses from "./pages/Statuses";

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
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/menus" element={<Menus />} />
                <Route path="/users" element={<Users />} />
                <Route path="/user-menus" element={<UserMenus />} />
                <Route path="/user-permissions" element={<UserPermissions />} />
                <Route path="/permissions" element={<Permissions />} />
                <Route path="/role-menus" element={<RoleMenus />} />
                <Route path="/role-permissions" element={<RolePermissions />} />
                <Route path="/loan-types" element={<LoanTypes />} />

                {/* Loans & Workflow */}
                <Route path="/loans" element={<Loans />} />
                <Route path="/loans/all" element={<Loans />} />
                <Route path="/loans/list" element={<Loans />} />
                <Route path="/my-loans" element={<Loans />} />
                <Route path="/loans/my-loans" element={<Loans />} />

                {/* Applications */}
                <Route path="/loans/applications" element={<LoanApplications />} />
                <Route path="/loan-applications" element={<LoanApplications />} />
                <Route path="/applications" element={<LoanApplications />} />
                <Route path="/apply" element={<LoanApplications />} />

                {/* Documents */}
                <Route path="/loan-documents" element={<LoanDocuments />} />
                <Route path="/loans/documents" element={<LoanDocuments />} />
                <Route path="/documents" element={<LoanDocuments />} />

                {/* Guarantors */}
                <Route path="/loan-guarantors" element={<LoanGuarantors />} />
                <Route path="/loans/guarantors" element={<LoanGuarantors />} />
                <Route path="/guarantors" element={<LoanGuarantors />} />

                {/* Repayments */}
                <Route path="/repayments" element={<Repayments />} />
                <Route path="/loans/repayments" element={<Repayments />} />
                <Route path="/payments" element={<Repayments />} />
                <Route path="/loans/payments" element={<Repayments />} />
                <Route path="/repayment-schedules" element={<Repayments />} />
                <Route path="/schedules" element={<Repayments />} />

                {/* Audit & Reports */}
                <Route path="/audit-logs" element={<AuditLogs />} />
                <Route path="/auditlogs" element={<AuditLogs />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/loans" element={<Reports />} />
                <Route path="/reports/repayments" element={<Reports />} />

                {/* Statuses */}
                <Route path="/statuses" element={<Statuses />} />
                <Route path="/status" element={<Statuses />} />
                <Route path="/workflow-statuses" element={<Statuses />} />

                {/* Smart catch-all dispatcher for any database menu route */}
                <Route path="*" element={<RouteDispatcher />} />
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
