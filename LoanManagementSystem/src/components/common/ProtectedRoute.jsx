
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";

function ProtectedRoute({ authenticated }) {
    const authed = authenticated ?? isAuthenticated();

    if (!authed || !isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
