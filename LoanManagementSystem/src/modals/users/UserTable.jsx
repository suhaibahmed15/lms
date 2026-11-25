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

import { Button } from "../../components/common";

export default function UserTable({
    users,
    roles,
    loading,
    error,
    canCreate,
    canDelete,
    summary,
    searchInput,
    onSearchChange,
    roleFilter,
    onRoleFilterChange,
    statusFilter,
    onStatusFilterChange,
    sortBy,
    sortDirection,
    onSort,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    onPageChange,
    onPageSizeChange,
    onRefresh,
    onAdd,
    onDelete
}) {
    const getRoleName = (item) => {
        if (item.roleName) return item.roleName;
        const role = roles.find((r) => r.id === item.roleId);
        return role ? role.name : "-";
    };

    const renderSortIcon = (column) => {
        if (sortBy !== column) {
            return <ArrowUpDown size={14} className="text-zinc-500" />;
        }
        return sortDirection === "asc" ? (
            <ArrowUp size={14} className="text-orange-400" />
        ) : (
            <ArrowDown size={14} className="text-orange-400" />
        );
    };

    const controlClass =
        "rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500/70 focus:bg-white/[0.10] focus:ring-4 focus:ring-orange-500/10";

    const startRecord = totalRecords === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    const endRecord = Math.min(pageNumber * pageSize, totalRecords);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        User Management
                    </h1>
                    <p className="mt-1 text-sm text-zinc-400">
                        Create, search, filter and manage system users.
                    </p>
                </div>

                {canCreate && (
                    <Button onClick={onAdd} icon={Plus}>
                        Add New User
                    </Button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Metric Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-zinc-400">Total Users</p>
                            <UsersIcon size={20} className="text-orange-400" />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-white">
                            {summary.total}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-zinc-400">Active Users</p>
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-emerald-400">
                            {summary.active}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-zinc-400">Inactive Users</p>
                            <span className="h-2.5 w-2.5 rounded-full bg-red-400"></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-red-400">
                            {summary.inactive}
                        </p>
                    </div>
                </div>
            )}

            {/* Users Table Card */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-xl shadow-black/40">
                {/* Search & Filters */}
                <div className="flex flex-col gap-3 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="font-semibold text-white">All Users</h2>
                        <p className="mt-1 text-xs text-zinc-400">
                            Search and filter system user accounts.
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
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Search by name, email..."
                                className={`${controlClass} w-full pl-10`}
                            />
                        </div>

                        {roles.length > 0 && (
                            <select
                                value={roleFilter}
                                onChange={(e) => onRoleFilterChange(e.target.value)}
                                className={controlClass}
                            >
                                <option value="">All Roles</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange(e.target.value)}
                            className={controlClass}
                        >
                            <option value="">All Statuses</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>

                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className={controlClass}
                            aria-label="Users per page"
                        >
                            <option value={5}>5 / page</option>
                            <option value={10}>10 / page</option>
                            <option value={20}>20 / page</option>
                            <option value={50}>50 / page</option>
                        </select>

                        <Button
                            variant="secondary"
                            onClick={onRefresh}
                            className="p-2.5"
                            title="Refresh"
                        >
                            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
                        </Button>
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
                                        onClick={() => onSort("fullName")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                    >
                                        Name / Email {renderSortIcon("fullName")}
                                    </button>
                                </th>
                                <th className="px-5 py-4 font-semibold">Phone</th>
                                <th className="px-5 py-4 font-semibold">Role</th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("isActive")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                    >
                                        Status {renderSortIcon("isActive")}
                                    </button>
                                </th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("createdAt")}
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
                                                            onClick={() => onDelete(item.id)}
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
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
                            disabled={pageNumber <= 1 || loading}
                            icon={ChevronLeft}
                        >
                            Previous
                        </Button>

                        <span className="px-2 text-xs font-medium text-zinc-300">
                            Page {totalPages === 0 ? 0 : pageNumber} of {totalPages}
                        </span>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onPageChange(Math.min(totalPages, pageNumber + 1))}
                            disabled={pageNumber >= totalPages || loading}
                            iconRight={ChevronRight}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
