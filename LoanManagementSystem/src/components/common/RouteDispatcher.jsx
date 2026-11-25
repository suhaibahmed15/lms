import { useLocation, Navigate } from "react-router-dom";
import Dashboard from "../../pages/Dashboard";
import Roles from "../../pages/Roles";
import Menus from "../../pages/Menus";
import Users from "../../pages/Users";
import UserMenus from "../../pages/UserMenus";
import UserPermissions from "../../pages/UserPermissions";
import Permissions from "../../pages/Permissions";
import RoleMenus from "../../pages/RoleMenus";
import RolePermissions from "../../pages/RolePermissions";
import LoanTypes from "../../pages/LoanTypes";
import LoanApplications from "../../pages/LoanApplications";
import LoanDocuments from "../../pages/LoanDocuments";
import LoanGuarantors from "../../pages/LoanGuarantors";
import Loans from "../../pages/Loans";
import Repayments from "../../pages/Repayments";
import AuditLogs from "../../pages/AuditLogs";
import Reports from "../../pages/Reports";
import Statuses from "../../pages/Statuses";

export default function RouteDispatcher() {
    const location = useLocation();
    const path = (location.pathname || "").toLowerCase().replace(/^\/+|\/+$/g, "");

    // Match by keywords in the route
    if (path === "dashboard" || path === "") {
        return <Dashboard />;
    }

    // Role Menus & Permissions
    if (path.includes("role-menu") || path.includes("rolemenu") || path.includes("role_menu")) {
        return <RoleMenus />;
    }
    if (path.includes("role-perm") || path.includes("roleperm") || path.includes("role_perm")) {
        return <RolePermissions />;
    }
    if (path.includes("user-menu") || path.includes("usermenu") || path.includes("user_menu")) {
        return <UserMenus />;
    }
    if (path.includes("user-perm") || path.includes("userperm") || path.includes("user_perm")) {
        return <UserPermissions />;
    }

    // Loan Sub-modules
    if (path.includes("app") || path.includes("appl")) {
        return <LoanApplications />;
    }
    if (path.includes("doc")) {
        return <LoanDocuments />;
    }
    if (path.includes("guarant")) {
        return <LoanGuarantors />;
    }
    if (path.includes("type")) {
        return <LoanTypes />;
    }
    if (path.includes("repay") || path.includes("payment") || path.includes("sched")) {
        return <Repayments />;
    }

    // Audit Logs
    if (path.includes("audit") || path.includes("log")) {
        return <AuditLogs />;
    }

    // Reports
    if (path.includes("report")) {
        return <Reports />;
    }

    // Loans Portfolio
    if (path.includes("loan")) {
        return <Loans />;
    }

    // Core Security & Admin
    if (path.includes("role")) {
        return <Roles />;
    }
    if (path.includes("user")) {
        return <Users />;
    }
    if (path.includes("perm")) {
        return <Permissions />;
    }
    if (path.includes("menu")) {
        return <Menus />;
    }
    if (path.includes("status")) {
        return <Statuses />;
    }
    if (path.includes("setting") || path.includes("admin")) {
        return <Users />;
    }

    // Fallback to Dashboard
    return <Navigate to="/dashboard" replace />;
}
