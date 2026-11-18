import { useCallback, useEffect, useState } from "react";
import {
    Search,
    RefreshCw,
    UserPlus,
    Shield,
    XCircle,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";

import {
    getAllPermissions,
    getAllUserPermissions,
    getEffectivePermissionsByUser,
    assignPermissionToUser,
    revokeUserPermission
} from "../services/permissionService";

import { getAllUsers } from "../services/userService";
import { getMyRole } from "../services/roleService";
import { getCurrentUser, notifyMenusUpdated } from "../utils/auth";

function UserPermissions() {
    const user = getCurrentUser();

    const [users, setUsers] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [assignments, setAssignments] = useState([]);

    // Form state (Assign)
    const [assignUserId, setAssignUserId] = useState("");
    const [selectedPermissionId, setSelectedPermissionId] = useState("");

    // Table query state
    const [filterUserId, setFilterUserId] = useState("");
    const [filterPermissionId, setFilterPermissionId] = useState("");
    const [statusFilter, setStatusFilter] = useState("true"); // Default to active non-revoked permissions
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("id");
    const [sortDirection, setSortDirection] = useState("desc");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [summary, setSummary] = useState({ total: 0, active: 0, revoked: 0 });

    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [canManage, setCanManage] = useState(false);

    useEffect(() => {
        const fetchCurrentUserAccess = async () => {
            const currentUserId = user?.userId ?? user?.id;
            if (!currentUserId) return;
            try {
                const [roleResp, permsResp] = await Promise.all([
                    getMyRole().catch(() => null),
                    getEffectivePermissionsByUser(currentUserId).catch(() => [])
                ]);
                const isAdmin = roleResp?.data?.key?.toUpperCase() === "ADMIN";
                const permList = Array.isArray(permsResp) ? permsResp : permsResp?.data || [];
                const permKeys = new Set(permList.map((p) => p.key?.toUpperCase()));
                setCanManage(isAdmin || permKeys.has("PERMISSION_MANAGE"));
            } catch {
                setCanManage(false);
            }
        };
        fetchCurrentUserAccess();
    }, [user?.userId, user?.id]);

    const extractData = (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPageNumber(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // Fetch dropdown options (users and active permissions)
    const fetchLookups = useCallback(async () => {
        try {
            const [usersResponse, permissionsResponse] = await Promise.all([
                getAllUsers({ pageNumber: 1, pageSize: 100 }),
                getAllPermissions({ pageNumber: 1, pageSize: 100, isActive: true })
            ]);

            setUsers(extractData(usersResponse));
            setPermissions(
                extractData(permissionsResponse).filter(
                    (p) => !p.key?.toUpperCase().startsWith("AUDIT_LOG")
                )
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load users and permissions."
            );
        }
    }, []);

    // Fetch paged assignments from backend
    const fetchAssignments = useCallback(async () => {
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
            if (filterUserId) params.userId = Number(filterUserId);
            if (filterPermissionId) params.permissionId = Number(filterPermissionId);
            if (statusFilter !== "") params.isActive = statusFilter === "true";

            const response = await getAllUserPermissions(params);
            const data = extractData(response).filter(
                (a) => !a.permissionKey?.toUpperCase().startsWith("AUDIT_LOG")
            );

            setAssignments(data);
            setTotalRecords(response.totalRecords ?? data.length);
            setTotalPages(response.totalPages ?? (data.length > 0 ? 1 : 0));

            const activeCount = response.activeCount ?? data.filter((a) => a.isActive).length;
            const revokedCount = response.revokedCount ?? data.filter((a) => !a.isActive).length;
            setSummary({
                total: activeCount + revokedCount,
                active: activeCount,
                revoked: revokedCount
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load user permissions."
            );
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, search, filterUserId, filterPermissionId, statusFilter, sortBy, sortDirection]);

    useEffect(() => {
        fetchLookups();
    }, [fetchLookups]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

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

    // Assign Permission
    const handleAssign = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!assignUserId || !selectedPermissionId) {
            setError("Please select a user and permission.");
            return;
        }

        const assignedByUserId = user?.userId ?? user?.id;

        try {
            setAssigning(true);

            await assignPermissionToUser({
                userId: Number(assignUserId),
                permissionId: Number(selectedPermissionId),
                assignedByUserId: assignedByUserId ? Number(assignedByUserId) : null
            });

            setSuccess("Permission assigned successfully.");
            setSelectedPermissionId("");

            await fetchAssignments();
            notifyMenusUpdated();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to assign permission."
            );
        } finally {
            setAssigning(false);
        }
    };

    // Revoke Permission
    const handleRevoke = async (assignmentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to revoke this permission?"
        );

        if (!confirmed) return;

        const revokedByUserId = user?.userId ?? user?.id;

        try {
            setError("");
            setSuccess("");

            await revokeUserPermission(assignmentId, revokedByUserId);

            setSuccess("Permission revoked successfully.");

            await fetchAssignments();
            notifyMenusUpdated();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to revoke permission."
            );
        }
    };

    const controlClass =
        "rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500/70 focus:bg-white/[0.10] focus:ring-4 focus:ring-orange-500/10";

    const startRecord = totalRecords === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    const endRecord = Math.min(pageNumber * pageSize, totalRecords);

    return (
        <MainLayout user={user}>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        User Permissions
                    </h1>

                    <p className="mt-1 text-sm text-zinc-400">
                        Assign, view and revoke individual user permissions.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">Total Assignments</p>
                                <h2 className="mt-2 text-2xl font-bold text-white">
                                    {summary.total}
                                </h2>
                            </div>

                            <div className="rounded-xl border border-orange-500/25 bg-orange-500/15 p-3 text-orange-400">
                                <Shield size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                        <p className="text-sm text-zinc-400">Active Permissions</p>
                        <h2 className="mt-2 text-2xl font-bold text-emerald-400">
                            {summary.active}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                        <p className="text-sm text-zinc-400">Revoked Permissions</p>
                        <h2 className="mt-2 text-2xl font-bold text-red-400">
                            {summary.revoked}
                        </h2>
                    </div>
                </div>

                {/* Assign Permission Form */}
                {canManage && (
                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-xl border border-orange-500/25 bg-orange-500/15 p-3 text-orange-400">
                            <UserPlus size={22} />
                        </div>

                        <div>
                            <h2 className="font-semibold text-white">
                                Assign Permission
                            </h2>

                            <p className="text-sm text-zinc-400">
                                Grant or re-grant an active permission to a user.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleAssign}>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* User Dropdown */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-300">
                                    Select User
                                </label>

                                <select
                                    value={assignUserId}
                                    onChange={(e) => setAssignUserId(e.target.value)}
                                    className={`${controlClass} w-full`}
                                    required
                                >
                                    <option value="">Choose a user</option>

                                    {users
                                        .filter((item) => item.isActive && !item.isDeleted)
                                        .map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.fullName} ({item.email})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Permission Dropdown */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-zinc-300">
                                    Select Permission
                                </label>

                                <select
                                    value={selectedPermissionId}
                                    onChange={(e) => setSelectedPermissionId(e.target.value)}
                                    className={`${controlClass} w-full`}
                                    required
                                >
                                    <option value="">Choose a permission</option>

                                    {permissions
                                        .filter((item) => item.isActive && !item.isDeleted)
                                        .map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} ({item.key})
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end">
                            <button
                                type="submit"
                                disabled={assigning}
                                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-500 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <UserPlus size={17} />
                                {assigning ? "Assigning..." : "Assign Permission"}
                            </button>
                        </div>
                    </form>
                </div>
                )}

                {/* Notifications */}
                {error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5 text-sm text-red-400">
                        <XCircle size={18} className="shrink-0" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-sm text-emerald-400">
                        {success}
                    </div>
                )}

                {/* Assigned Permissions Table */}
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-xl shadow-black/40">
                    {/* Search, Filters & Refresh */}
                    <div className="space-y-3 border-b border-white/10 p-4">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="font-semibold text-white">
                                    Permission Assignments
                                </h2>

                                <p className="mt-1 text-xs text-zinc-400">
                                    View, filter and revoke user permission assignments.
                                </p>
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
                                    onClick={fetchAssignments}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.10] hover:text-white"
                                >
                                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="relative">
                                <Search
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                                />

                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search user or permission..."
                                    className={`${controlClass} w-full pl-10`}
                                />
                            </div>

                            <select
                                value={filterUserId}
                                onChange={(e) => {
                                    setFilterUserId(e.target.value);
                                    setPageNumber(1);
                                }}
                                className={controlClass}
                            >
                                <option value="">All Users</option>
                                {users.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.fullName}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filterPermissionId}
                                onChange={(e) => {
                                    setFilterPermissionId(e.target.value);
                                    setPageNumber(1);
                                }}
                                className={controlClass}
                            >
                                <option value="">All Permissions</option>
                                {permissions.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPageNumber(1);
                                }}
                                className={controlClass}
                            >
                                <option value="true">Active Only</option>
                                <option value="false">Revoked Only</option>
                                <option value="">All Statuses</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-zinc-400">
                                <tr>
                                    <th className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSort("userName")}
                                            className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                        >
                                            User {renderSortIcon("userName")}
                                        </button>
                                    </th>
                                    <th className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSort("permissionName")}
                                            className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                        >
                                            Permission {renderSortIcon("permissionName")}
                                        </button>
                                    </th>
                                    <th className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSort("assignedAt")}
                                            className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                        >
                                            Assigned At {renderSortIcon("assignedAt")}
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
                                    <th className="px-5 py-4 text-center font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-white/[0.07]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-10 text-center text-zinc-400">
                                            Loading assignments...
                                        </td>
                                    </tr>
                                ) : assignments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-10 text-center text-zinc-500">
                                            No permission assignments found.
                                        </td>
                                    </tr>
                                ) : (
                                    assignments.map((item) => {
                                        const isRowActive = item.isActive && !item.revokedAt;

                                        return (
                                            <tr
                                                key={item.id}
                                                className="transition hover:bg-white/[0.04]"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-white">
                                                        {item.fullName || `User ${item.userId}`}
                                                    </div>

                                                    <div className="mt-1 text-xs text-zinc-500">
                                                        User ID: {item.userId}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-white">
                                                        {item.permissionName || `Permission ${item.permissionId}`}
                                                    </div>

                                                    <div className="mt-1 text-xs text-orange-300/80">
                                                        {item.permissionKey || `ID: ${item.permissionId}`}
                                                    </div>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-zinc-400">
                                                    {item.assignedAt
                                                        ? new Date(item.assignedAt).toLocaleDateString()
                                                        : "-"}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                                                            isRowActive
                                                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                                                                : "border-red-500/25 bg-red-500/10 text-red-400"
                                                        }`}
                                                    >
                                                        {isRowActive ? "Active" : "Revoked"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-center">
                                                        {canManage && isRowActive ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRevoke(item.id)}
                                                                title="Revoke Permission"
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                                                            >
                                                                <XCircle size={15} />
                                                                Revoke
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-zinc-500">
                                                                {isRowActive ? "View Only" : "Revoked"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:flex-row">
                        <p className="text-xs text-zinc-400">
                            Showing {startRecord}–{endRecord} of {totalRecords} assignments
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
            </div>
        </MainLayout>
    );
}

export default UserPermissions;
