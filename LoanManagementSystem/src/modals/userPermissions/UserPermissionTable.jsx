import {
    Plus,
    Search,
    RefreshCw,
    XCircle,
    KeyRound,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import { Button } from "../../components/common";

export default function UserPermissionTable({
    assignments,
    users,
    permissions,
    loading,
    error,
    success,
    canManage,
    summary,
    searchInput,
    onSearchChange,
    filterUserId,
    onFilterUserIdChange,
    filterPermissionId,
    onFilterPermissionIdChange,
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
    onRevoke
}) {
    const renderSortIcon = (column) => {
        if (sortBy !== column) {
            return <ArrowUpDown size={14} className="text-zinc-500" />;
        }
        return sortDirection === "asc" ? (
            <ArrowUp size={14} className="text-pink-400" />
        ) : (
            <ArrowDown size={14} className="text-pink-400" />
        );
    };

    const controlClass =
        "rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-pink-500/70 focus:bg-white/[0.10] focus:ring-4 focus:ring-pink-500/10";

    const startRecord = totalRecords === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    const endRecord = Math.min(pageNumber * pageSize, totalRecords);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        User Permissions
                    </h1>
                    <p className="mt-1 text-sm text-zinc-400">
                        Assign, view and revoke individual user permissions.
                    </p>
                </div>

                {canManage && (
                    <Button onClick={onAdd} icon={Plus}>
                        Assign Permission to User
                    </Button>
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

            {/* Metric Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-zinc-400">Total Assignments</p>
                            <KeyRound size={20} className="text-pink-400" />
                        </div>
                        <p className="mt-3 text-2xl font-bold text-white">
                            {summary.total}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-zinc-400">Active Permissions</p>
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-emerald-400">
                            {summary.active}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-zinc-400">Revoked Permissions</p>
                            <span className="h-2.5 w-2.5 rounded-full bg-red-400"></span>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-red-400">
                            {summary.revoked}
                        </p>
                    </div>
                </div>
            )}

            {/* Table Card */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-xl shadow-black/40">
                {/* Search & Filters */}
                <div className="space-y-3 border-b border-white/10 p-5">
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
                                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                className={controlClass}
                                aria-label="Rows per page"
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

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                            />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Search user or permission..."
                                className={`${controlClass} w-full pl-10`}
                            />
                        </div>

                        <select
                            value={filterUserId}
                            onChange={(e) => onFilterUserIdChange(e.target.value)}
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
                            onChange={(e) => onFilterPermissionIdChange(e.target.value)}
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
                            onChange={(e) => onStatusFilterChange(e.target.value)}
                            className={controlClass}
                        >
                            <option value="">All Statuses</option>
                            <option value="true">Active Only</option>
                            <option value="false">Revoked Only</option>
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
                                        onClick={() => onSort("userName")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-pink-400"
                                    >
                                        User {renderSortIcon("userName")}
                                    </button>
                                </th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("permissionName")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-pink-400"
                                    >
                                        Permission {renderSortIcon("permissionName")}
                                    </button>
                                </th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("assignedAt")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-pink-400"
                                    >
                                        Assigned At {renderSortIcon("assignedAt")}
                                    </button>
                                </th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("isActive")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-pink-400"
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
                                                <div className="mt-1 text-xs text-pink-300/80">
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
                                                            onClick={() => onRevoke(item.id)}
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
