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
            return <ArrowUpDown size={14} className="text-zinc-400" />;
        }
        return sortDirection === "asc" ? (
            <ArrowUp size={14} className="text-pink-600" />
        ) : (
            <ArrowDown size={14} className="text-pink-600" />
        );
    };

    const controlClass =
        "rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15";

    const startRecord = totalRecords === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    const endRecord = Math.min(pageNumber * pageSize, totalRecords);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        User Permissions
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
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
                <div className="rounded-xl border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                    {success}
                </div>
            )}

            {/* Metric Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-pink-200/80 bg-white p-5 shadow-lg shadow-pink-500/5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                Total Assignments
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-pink-200 bg-pink-50 text-pink-600">
                                <KeyRound size={18} />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-black text-zinc-900 font-mono">
                            {summary.total}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-pink-200/80 bg-white p-5 shadow-lg shadow-pink-500/5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                Active Permissions
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-black text-emerald-600 font-mono">
                            {summary.active}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-pink-200/80 bg-white p-5 shadow-lg shadow-pink-500/5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                Revoked Permissions
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-black text-red-600 font-mono">
                            {summary.revoked}
                        </div>
                    </div>
                </div>
            )}

            {/* Table Card */}
            <div className="overflow-hidden rounded-3xl border border-pink-200/80 bg-white shadow-xl shadow-pink-500/5">
                {/* Search & Filters */}
                <div className="flex flex-col gap-3 border-b border-pink-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-bold text-zinc-900">
                            Permission Assignments
                        </h2>
                        <p className="text-xs text-zinc-500">
                            View, filter and revoke user permission assignments.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative min-w-[200px] flex-1 sm:flex-none">
                            <Search
                                size={16}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                            />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Search user or permission..."
                                className={`${controlClass} w-full pl-10`}
                            />
                        </div>

                        {users.length > 0 && (
                            <select
                                value={filterUserId}
                                onChange={(e) => onFilterUserIdChange(e.target.value)}
                                className={controlClass}
                            >
                                <option value="">All Users</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.fullName || u.email}
                                    </option>
                                ))}
                            </select>
                        )}

                        {permissions.length > 0 && (
                            <select
                                value={filterPermissionId}
                                onChange={(e) => onFilterPermissionIdChange(e.target.value)}
                                className={controlClass}
                            >
                                <option value="">All Permissions</option>
                                {permissions.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
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
                            <option value="active">Active</option>
                            <option value="revoked">Revoked</option>
                        </select>

                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className={controlClass}
                            aria-label="Items per page"
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
                        <thead className="border-b border-pink-100 bg-pink-50/70 text-xs uppercase tracking-wider text-pink-900 font-bold">
                            <tr>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("userName")}
                                        className="inline-flex items-center gap-1.5 font-bold uppercase hover:text-pink-600"
                                    >
                                        User {renderSortIcon("userName")}
                                    </button>
                                </th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("permissionName")}
                                        className="inline-flex items-center gap-1.5 font-bold uppercase hover:text-pink-600"
                                    >
                                        Permission {renderSortIcon("permissionName")}
                                    </button>
                                </th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("assignedAt")}
                                        className="inline-flex items-center gap-1.5 font-bold uppercase hover:text-pink-600"
                                    >
                                        Assigned At {renderSortIcon("assignedAt")}
                                    </button>
                                </th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("isRevoked")}
                                        className="inline-flex items-center gap-1.5 font-bold uppercase hover:text-pink-600"
                                    >
                                        Status {renderSortIcon("isRevoked")}
                                    </button>
                                </th>
                                {canManage && (
                                    <th className="px-5 py-4 text-center font-bold">Actions</th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-pink-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={canManage ? 5 : 4} className="px-5 py-10 text-center text-zinc-400">
                                        Loading permission assignments...
                                    </td>
                                </tr>
                            ) : assignments.length === 0 ? (
                                <tr>
                                    <td colSpan={canManage ? 5 : 4} className="px-5 py-10 text-center text-zinc-500">
                                        No permission assignments found.
                                    </td>
                                </tr>
                            ) : (
                                assignments.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition hover:bg-pink-50/50"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-zinc-900">
                                                {item.userName || `User #${item.userId}`}
                                            </div>
                                            <div className="mt-0.5 text-xs text-zinc-500">
                                                User ID: {item.userId}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-zinc-900">
                                                {item.permissionName || `Permission #${item.permissionId}`}
                                            </div>
                                            <div className="mt-0.5 font-mono text-xs text-pink-600">
                                                {item.permissionKey}
                                            </div>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-zinc-500">
                                            {item.assignedAt
                                                ? new Date(item.assignedAt).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                                    !item.isRevoked
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : "border-red-200 bg-red-50 text-red-600"
                                                }`}
                                            >
                                                {!item.isRevoked ? "Active" : "Revoked"}
                                            </span>
                                        </td>

                                        {canManage && (
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center">
                                                    {!item.isRevoked && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onRevoke(item)}
                                                            title="Revoke Permission"
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                                                        >
                                                            <XCircle size={14} />
                                                            <span>Revoke</span>
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
                <div className="flex flex-col items-center justify-between gap-3 border-t border-pink-100 px-5 py-4 sm:flex-row">
                    <p className="text-xs text-zinc-500 font-medium">
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

                        <span className="px-2 text-xs font-semibold text-zinc-700">
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
