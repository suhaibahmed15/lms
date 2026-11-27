import {
    Plus,
    Search,
    Trash2,
    Pencil,
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
    canUpdate,
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
    onEdit,
    onDelete
}) {
    const getRoleName = (item) => {
        if (item.roleName) return item.roleName;
        const role = roles.find((r) => r.id === item.roleId);
        return role ? role.name : "-";
    };

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
                        User Management
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
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
                <div className="rounded-xl border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Metric Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-pink-200/80 bg-white p-5 shadow-lg shadow-pink-500/5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                Total Users
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-pink-200 bg-pink-50 text-pink-600">
                                <UsersIcon size={18} />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-black text-zinc-900 font-mono">
                            {summary.total}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-pink-200/80 bg-white p-5 shadow-lg shadow-pink-500/5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                Active Users
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
                                Inactive Users
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-black text-red-600 font-mono">
                            {summary.inactive}
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
                            All Users
                        </h2>
                        <p className="text-xs text-zinc-500">
                            Search and filter system user accounts.
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
                        <thead className="border-b border-pink-100 bg-pink-50/70 text-xs uppercase tracking-wider text-pink-900 font-bold">
                            <tr>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("fullName")}
                                        className="inline-flex items-center gap-1.5 font-bold uppercase hover:text-pink-600"
                                    >
                                        Name / Email {renderSortIcon("fullName")}
                                    </button>
                                </th>
                                <th className="px-5 py-4 font-bold">Phone</th>
                                <th className="px-5 py-4 font-bold">Role</th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("isActive")}
                                        className="inline-flex items-center gap-1.5 font-bold uppercase hover:text-pink-600"
                                    >
                                        Status {renderSortIcon("isActive")}
                                    </button>
                                </th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("createdAt")}
                                        className="inline-flex items-center gap-1.5 font-bold uppercase hover:text-pink-600"
                                    >
                                        Created At {renderSortIcon("createdAt")}
                                    </button>
                                </th>
                                {(canUpdate || canDelete) && (
                                    <th className="px-5 py-4 text-center font-bold">Actions</th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-pink-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={(canUpdate || canDelete) ? 6 : 5} className="px-5 py-10 text-center text-zinc-400">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={(canUpdate || canDelete) ? 6 : 5} className="px-5 py-10 text-center text-zinc-500">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                users.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition hover:bg-pink-50/50"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-zinc-900">
                                                {item.fullName}
                                            </div>
                                            <div className="mt-0.5 text-xs text-zinc-500">
                                                {item.email}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-zinc-700">
                                            {item.phoneNumber || "-"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="rounded-full border border-pink-200 bg-pink-100/70 px-3 py-1 text-xs font-semibold text-pink-700">
                                                {getRoleName(item)}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                                    item.isActive
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : "border-red-200 bg-red-50 text-red-600"
                                                }`}
                                            >
                                                {item.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-zinc-500">
                                            {item.createdAt
                                                ? new Date(item.createdAt).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        {(canUpdate || canDelete) && (
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {canUpdate && item.isActive && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onEdit(item)}
                                                            title="Edit User"
                                                            className="rounded-lg p-2 text-pink-600 transition hover:bg-pink-100/60"
                                                        >
                                                            <Pencil size={17} />
                                                        </button>
                                                    )}
                                                    {canDelete && item.isActive && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onDelete(item.id)}
                                                            title="Deactivate User"
                                                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
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
                <div className="flex flex-col items-center justify-between gap-3 border-t border-pink-100 px-5 py-4 sm:flex-row">
                    <p className="text-xs text-zinc-500 font-medium">
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
