import { useCallback, useEffect, useState } from "react";
import {
    Plus,
    Search,
    Trash2,
    RefreshCw,
    Users as UsersIcon,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import UserModal from "../modals/users/UserModal";

import {
    getAllUsers,
    createUser,
    deleteUser
} from "../services/userService";

import { getAllRoles, getMyRole } from "../services/roleService";
import { getEffectivePermissionsByUser } from "../services/permissionService";
import { getCurrentUser } from "../utils/auth";

function Users() {
    const user = getCurrentUser();

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);

    // Query state
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Pagination & Summary metadata from backend
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0 });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Current user's permission flags
    const [canCreate, setCanCreate] = useState(false);
    const [canDelete, setCanDelete] = useState(false);

    useEffect(() => {
        const fetchCurrentUserAccess = async () => {
            const currentUserId = user?.userId ?? user?.id;
            if (!currentUserId) return;

            try {
                const [roleResp, permsResp] = await Promise.all([
                    getMyRole().catch(() => null),
                    getEffectivePermissionsByUser(currentUserId).catch(() => [])
                ]);

                const roleKey = roleResp?.data?.key?.toUpperCase();
                const isAdmin = roleKey === "ADMIN";

                const permList = Array.isArray(permsResp)
                    ? permsResp
                    : permsResp?.data || [];
                const permKeys = new Set(
                    permList.map((p) => p.key?.toUpperCase())
                );

                setCanCreate(isAdmin || permKeys.has("USER_CREATE"));
                setCanDelete(isAdmin || permKeys.has("USER_DELETE"));
            } catch {
                setCanCreate(false);
                setCanDelete(false);
            }
        };

        fetchCurrentUserAccess();
    }, [user?.userId, user?.id]);

    // Debounce search and reset pagination
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPageNumber(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // Fetch roles for filter & modal dropdown (gracefully ignore 403 if user only has USER_VIEW)
    const fetchRoles = useCallback(async () => {
        try {
            const rolesResponse = await getAllRoles({ pageNumber: 1, pageSize: 100 });
            const roleData = Array.isArray(rolesResponse)
                ? rolesResponse
                : rolesResponse.data || [];
            setRoles(roleData);
        } catch {
            setRoles([]);
        }
    }, []);

    // Fetch paged users from backend
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                pageNumber,
                pageSize,
                sortBy,
                sortDirection
            };

            if (search) params.search = search;
            if (roleFilter) params.roleId = Number(roleFilter);
            if (statusFilter !== "") params.isActive = statusFilter === "true";

            const response = await getAllUsers(params);

            const userData = Array.isArray(response)
                ? response
                : response.data || [];

            setUsers(userData);
            setTotalRecords(response.totalRecords ?? userData.length);
            setTotalPages(response.totalPages ?? (userData.length > 0 ? 1 : 0));

            const activeCount = response.activeCount ?? userData.filter((u) => u.isActive).length;
            const inactiveCount = response.inactiveCount ?? userData.filter((u) => !u.isActive).length;
            setSummary({
                total: activeCount + inactiveCount,
                active: activeCount,
                inactive: inactiveCount
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load users."
            );
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, search, roleFilter, statusFilter, sortBy, sortDirection]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const getRoleName = (item) => {
        if (item.roleName) return item.roleName;
        const role = roles.find((r) => r.id === item.roleId);
        return role?.name || `Role ${item.roleId}`;
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
        setPageNumber(1);
    };

    const renderSortIcon = (column) => {
        if (sortBy !== column) {
            return <ArrowUpDown size={14} className="text-zinc-500" />;
        }
        return sortDirection === "asc"
            ? <ArrowUp size={14} className="text-orange-400" />
            : <ArrowDown size={14} className="text-orange-400" />;
    };

    const handleCreateUser = async (userData) => {
        await createUser(userData);
        await fetchUsers();
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to deactivate this user?"
        );

        if (!confirmed) return;

        try {
            await deleteUser(id);
            await fetchUsers();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to deactivate user."
            );
        }
    };

    const controlClass =
        "rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500/70 focus:bg-white/[0.10] focus:ring-4 focus:ring-orange-500/10";

    const startRecord = totalRecords === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    const endRecord = Math.min(pageNumber * pageSize, totalRecords);

    return (
        <MainLayout user={user}>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            User Management
                        </h1>

                        <p className="mt-1 text-sm text-zinc-400">
                            Manage system users and their roles.
                        </p>
                    </div>

                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-500 hover:to-orange-400"
                        >
                            <Plus size={18} />
                            Add User
                        </button>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">Total Users</p>
                                <h2 className="mt-2 text-2xl font-bold text-white">
                                    {summary.total}
                                </h2>
                            </div>

                            <div className="rounded-xl border border-orange-500/25 bg-orange-500/15 p-3 text-orange-400">
                                <UsersIcon size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                        <p className="text-sm text-zinc-400">Active Users</p>
                        <h2 className="mt-2 text-2xl font-bold text-emerald-400">
                            {summary.active}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                        <p className="text-sm text-zinc-400">Inactive Users</p>
                        <h2 className="mt-2 text-2xl font-bold text-red-400">
                            {summary.inactive}
                        </h2>
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-xl shadow-black/40">
                    {/* Search, Filters & Refresh */}
                    <div className="flex flex-col gap-3 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            <div className="relative w-full sm:max-w-xs">
                                <Search
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                                />

                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search name, email, phone..."
                                    className={`${controlClass} w-full pl-10`}
                                />
                            </div>

                            {roles.length > 0 && (
                                <select
                                    value={roleFilter}
                                    onChange={(e) => {
                                        setRoleFilter(e.target.value);
                                        setPageNumber(1);
                                    }}
                                    className={controlClass}
                                >
                                    <option value="">All Roles</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPageNumber(1);
                                }}
                                className={controlClass}
                            >
                                <option value="">All Statuses</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPageNumber(1);
                                }}
                                className={controlClass}
                                aria-label="Rows per page"
                            >
                                <option value={5}>5 / page</option>
                                <option value={10}>10 / page</option>
                                <option value={20}>20 / page</option>
                                <option value={50}>50 / page</option>
                            </select>

                            <button
                                type="button"
                                onClick={fetchUsers}
                                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.10] hover:text-white"
                            >
                                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="m-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-zinc-400">
                                <tr>
                                    <th className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSort("fullName")}
                                            className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                        >
                                            User {renderSortIcon("fullName")}
                                        </button>
                                    </th>
                                    <th className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSort("phoneNumber")}
                                            className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                        >
                                            Phone {renderSortIcon("phoneNumber")}
                                        </button>
                                    </th>
                                    <th className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSort("role")}
                                            className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                        >
                                            Role {renderSortIcon("role")}
                                        </button>
                                    </th>
                                    <th className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSort("isActive")}
                                            className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                        >
                                            Status {renderSortIcon("isActive")}
                                        </button>
                                    </th>
                                    <th className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSort("createdAt")}
                                            className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                        >
                                            Created At {renderSortIcon("createdAt")}
                                        </button>
                                    </th>
                                    {canDelete && (
                                        <th className="px-5 py-4 text-center">Actions</th>
                                    )}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-white/[0.07]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={canDelete ? 6 : 5} className="px-5 py-10 text-center text-zinc-400">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={canDelete ? 6 : 5} className="px-5 py-10 text-center text-zinc-500">
                                            No users found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="transition hover:bg-white/[0.04]"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-white">
                                                    {item.fullName}
                                                </div>

                                                <div className="mt-1 text-xs text-zinc-400">
                                                    {item.email}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-zinc-300">
                                                {item.phoneNumber || "-"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300">
                                                    {getRoleName(item)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                                                        item.isActive
                                                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                                                            : "border-red-500/25 bg-red-500/10 text-red-400"
                                                    }`}
                                                >
                                                    {item.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-zinc-400">
                                                {item.createdAt
                                                    ? new Date(item.createdAt).toLocaleDateString()
                                                    : "-"}
                                            </td>

                                            {canDelete && (
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center">
                                                        {item.isActive && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(item.id)}
                                                                title="Deactivate User"
                                                                className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/15 hover:text-red-300"
                                                            >
                                                                <Trash2 size={17} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:flex-row">
                        <p className="text-xs text-zinc-400">
                            Showing {startRecord}–{endRecord} of {totalRecords} users
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                                disabled={pageNumber <= 1 || loading}
                                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={15} />
                                Previous
                            </button>

                            <span className="px-2 text-xs font-medium text-zinc-300">
                                Page {totalPages === 0 ? 0 : pageNumber} of {totalPages}
                            </span>

                            <button
                                type="button"
                                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                                disabled={pageNumber >= totalPages || loading}
                                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add User Modal */}
                <UserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateUser}
                    roles={roles}
                />
            </div>
        </MainLayout>
    );
}

export default Users;
