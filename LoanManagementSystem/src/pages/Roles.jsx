import { useCallback, useEffect, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    ShieldCheck,
    RefreshCw,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import RoleModal from "../modals/roles/RoleModal";

import {
    getAllRoles,
    getMyRole,
    createRole,
    updateRole,
    deleteRole
} from "../services/roleService";

import { getEffectivePermissionsByUser } from "../services/permissionService";
import { getCurrentUser } from "../utils/auth";

function Roles() {
    const user = getCurrentUser();

    const [roles, setRoles] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [summary, setSummary] = useState({ total: 0, active: 0 });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const [canManage, setCanManage] = useState(false);
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

                const isAdmin = roleResp?.data?.key?.toUpperCase() === "ADMIN";
                const permList = Array.isArray(permsResp) ? permsResp : permsResp?.data || [];
                const permKeys = new Set(permList.map((p) => p.key?.toUpperCase()));

                setCanManage(isAdmin || permKeys.has("ROLE_MANAGE"));
                setCanDelete(isAdmin || permKeys.has("ROLE_DELETE"));
            } catch {
                setCanManage(false);
                setCanDelete(false);
            }
        };

        fetchCurrentUserAccess();
    }, [user?.userId, user?.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPageNumber(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const fetchRoles = useCallback(async () => {
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
            if (statusFilter !== "") params.isActive = statusFilter === "true";

            const response = await getAllRoles(params);
            const roleData = Array.isArray(response)
                ? response
                : response.data || [];

            setRoles(roleData);
            setTotalRecords(response.totalRecords ?? roleData.length);
            setTotalPages(response.totalPages ?? (roleData.length > 0 ? 1 : 0));

            const activeCount = response.activeCount ?? roleData.filter((r) => r.isActive).length;
            const inactiveCount = response.inactiveCount ?? roleData.filter((r) => !r.isActive).length;
            setSummary({
                total: activeCount + inactiveCount,
                active: activeCount
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load roles."
            );
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, search, statusFilter, sortBy, sortDirection]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

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

    const handleAddRole = () => {
        setSelectedRole(null);
        setIsModalOpen(true);
        setSuccess("");
    };

    const handleEditRole = (role) => {
        setSelectedRole(role);
        setIsModalOpen(true);
        setSuccess("");
    };

    const handleSubmit = async (roleData) => {
        if (selectedRole) {
            await updateRole(selectedRole.id, roleData);
            setSuccess("Role updated successfully.");
        } else {
            await createRole(roleData);
            setSuccess("Role created successfully.");
        }

        setIsModalOpen(false);
        setSelectedRole(null);

        await fetchRoles();
    };

    const handleDeleteRole = async (role) => {
        if (role.key === "ADMIN") {
            alert("The Admin role cannot be deleted.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${role.name}?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await deleteRole(role.id);

            setSuccess("Role deleted successfully.");

            await fetchRoles();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete role."
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
                            Role Management
                        </h1>

                        <p className="mt-1 text-sm text-zinc-400">
                            Create and manage system roles.
                        </p>
                    </div>

                    {canManage && (
                        <button
                            type="button"
                            onClick={handleAddRole}
                            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-500 hover:to-orange-400"
                        >
                            <Plus size={18} />
                            Add New Role
                        </button>
                    )}
                </div>

                {/* Messages */}
                {error && (
                    <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                        {success}
                    </div>
                )}

                {/* Role Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">Total Roles</p>
                                <h2 className="mt-2 text-3xl font-bold text-white">
                                    {summary.total}
                                </h2>
                            </div>

                            <div className="rounded-xl border border-orange-500/25 bg-orange-500/15 p-3 text-orange-400">
                                <ShieldCheck size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-400">Active Roles</p>
                                <h2 className="mt-2 text-3xl font-bold text-emerald-400">
                                    {summary.active}
                                </h2>
                            </div>

                            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/15 p-3 text-emerald-400">
                                <ShieldCheck size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Roles Table */}
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-xl shadow-black/40">
                    {/* Table Header Controls */}
                    <div className="flex flex-col gap-3 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="font-semibold text-white">All Roles</h2>
                            <p className="mt-1 text-xs text-zinc-400">
                                Manage roles and their information.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="relative w-full sm:w-60">
                                <Search
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                                />

                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search roles..."
                                    className={`${controlClass} w-full pl-10`}
                                />
                            </div>

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
                                onClick={fetchRoles}
                                className="rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-zinc-300 transition hover:bg-white/[0.10] hover:text-white"
                                title="Refresh"
                            >
                                <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-zinc-400">
                                <tr>
                                    <th className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSort("name")}
                                            className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                        >
                                            Role {renderSortIcon("name")}
                                        </button>
                                    </th>

                                    <th className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSort("key")}
                                            className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                        >
                                            Role Key {renderSortIcon("key")}
                                        </button>
                                    </th>

                                    <th className="px-6 py-4 font-semibold">
                                        Description
                                    </th>

                                    <th className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSort("isActive")}
                                            className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                        >
                                            Status {renderSortIcon("isActive")}
                                        </button>
                                    </th>

                                    <th className="px-6 py-4 text-right font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-white/[0.07]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-zinc-400">
                                            Loading roles...
                                        </td>
                                    </tr>
                                ) : roles.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
                                            No roles found.
                                        </td>
                                    </tr>
                                ) : (
                                    roles.map((role) => (
                                        <tr
                                            key={role.id}
                                            className="transition hover:bg-white/[0.04]"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/15 text-orange-400">
                                                        <ShieldCheck size={19} />
                                                    </div>

                                                    <span className="font-semibold text-white">
                                                        {role.name}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-orange-300">
                                                    {role.key}
                                                </span>
                                            </td>

                                            <td className="max-w-xs px-6 py-4 text-zinc-400">
                                                {role.description || "No description"}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                                        role.isActive
                                                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                                                            : "border-red-500/25 bg-red-500/10 text-red-400"
                                                    }`}
                                                >
                                                    {role.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {canManage && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditRole(role)}
                                                            className="rounded-lg p-2 text-orange-400 transition hover:bg-orange-500/15 hover:text-orange-300"
                                                            title="Edit role"
                                                        >
                                                            <Pencil size={17} />
                                                        </button>
                                                    )}

                                                    {canDelete && role.key !== "ADMIN" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteRole(role)}
                                                            className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/15 hover:text-red-300"
                                                            title="Delete role"
                                                        >
                                                            <Trash2 size={17} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-6 py-4 sm:flex-row">
                        <p className="text-xs text-zinc-400">
                            Showing {startRecord}–{endRecord} of {totalRecords} roles
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

                {/* Role Modal */}
                <RoleModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedRole(null);
                    }}
                    onSubmit={handleSubmit}
                    selectedRole={selectedRole}
                />
            </div>
        </MainLayout>
    );
}

export default Roles;
