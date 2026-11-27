import {
    Plus,Search,Trash2,RefreshCw,ListChecks,ShieldCheck,
    ArrowUpDown,ArrowUp,ArrowDown,ChevronLeft,ChevronRight  

} from "lucide-react";

import RoleMenuModal from "./RoleMenuModal";
import { Button } from "../../components/common";

function RoleMenuTable({
    isModalOpen,onCloseModal,onSubmitModal,
    roleMenus,roles,menus,loading,error,success,canManage,
    searchInput,onSearchChange,roleFilter,onRoleFilterChange,
    sortBy,sortDirection,onSort,pageNumber,pageSize,totalRecords,
    totalPages,onPageChange,onPageSizeChange,onRefresh,onAdd,onDelete,
    
}) {
    const getRoleName = (roleId) => {
        const role = roles.find((r) => Number(r.id) === Number(roleId));
        return role ? role.name : `Role #${roleId}`;
    };

    const renderSortIcon = (column) => {
        if (sortBy !== column) {
            return <ArrowUpDown size={14} className="text-zinc-500" />;
        }
        return sortDirection === "asc"
            ? <ArrowUp size={14} className="text-pink-400" />
            : <ArrowDown size={14} className="text-pink-400" />;
    };

    const controlClass =
        "rounded-xl border border-pink-100 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-pink-500/70 focus:bg-pink-100/60 focus:ring-4 focus:ring-pink-500/10";

    const startRecord = totalRecords === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    const endRecord = Math.min(pageNumber * pageSize, totalRecords);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Role Menu Assignments
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Manage which menus are assigned to each role.
                    </p>
                </div>

                {canManage && (
                    <Button onClick={onAdd} icon={Plus}>
                        Assign Menu to Role
                    </Button>
                )}
            </div>

            {/* Messages */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                    {success}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-xl shadow-pink-500/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500">Total Assignments</p>
                            <h2 className="mt-2 text-2xl font-bold text-zinc-900">
                                {totalRecords}
                            </h2>
                        </div>

                        <div className="rounded-xl border border-pink-500/25 bg-pink-500/15 p-3 text-pink-400">
                            <ListChecks size={22} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-xl shadow-pink-500/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500">Available Roles</p>
                            <h2 className="mt-2 text-2xl font-bold text-emerald-400">
                                {roles.length}
                            </h2>
                        </div>

                        <div className="rounded-xl border border-emerald-200 bg-emerald-500/15 p-3 text-emerald-400">
                            <ShieldCheck size={22} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-xl shadow-pink-500/5">
                {/* Search, Filter & Refresh */}
                <div className="flex flex-col gap-3 border-b border-pink-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                        <div className="relative w-full sm:max-w-xs">
                            <Search
                                size={17}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                            />

                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Search menu name, key, route..."
                                className={`${controlClass} w-full pl-10`}
                            />
                        </div>

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

                        <button
                            type="button"
                            onClick={onRefresh}
                            className="flex items-center justify-center gap-2 rounded-xl border border-pink-100 bg-pink-50/50 px-4 py-2 text-sm text-zinc-700 transition hover:bg-pink-100/60 hover:text-zinc-900"
                        >
                            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-pink-100 bg-pink-50/50 text-xs uppercase tracking-wider text-zinc-500">
                            <tr>
                                <th className="px-5 py-4 font-semibold">Role</th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("menuName")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-pink-400"
                                    >
                                        Menu {renderSortIcon("menuName")}
                                    </button>
                                </th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("menuKey")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-pink-400"
                                    >
                                        Key {renderSortIcon("menuKey")}
                                    </button>
                                </th>
                                <th className="px-5 py-4 font-semibold">Route</th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("displayOrder")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-pink-400"
                                    >
                                        Order {renderSortIcon("displayOrder")}
                                    </button>
                                </th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("createdAt")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-pink-400"
                                    >
                                        Assigned At {renderSortIcon("createdAt")}
                                    </button>
                                </th>
                                {canManage && (
                                    <th className="px-5 py-4 text-center font-semibold">
                                        Action
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-pink-50">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={canManage ? 7 : 6}
                                        className="px-5 py-10 text-center text-zinc-500"
                                    >
                                        Loading role menus...
                                    </td>
                                </tr>
                            ) : roleMenus.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={canManage ? 7 : 6}
                                        className="px-5 py-10 text-center text-zinc-500"
                                    >
                                        No role menu assignments found.
                                    </td>
                                </tr>
                            ) : (
                                roleMenus.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition hover:bg-pink-50/50"
                                    >
                                        <td className="px-5 py-4">
                                            <span className="rounded-full border border-pink-500/25 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-300">
                                                {getRoleName(item.roleId)}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 font-medium text-zinc-900">
                                            {item.menuName}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="rounded-lg border border-pink-100 bg-pink-50/60 px-2.5 py-1 text-xs font-medium text-pink-300">
                                                {item.menuKey}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-zinc-500">
                                            {item.route || "-"}
                                        </td>

                                        <td className="px-5 py-4 text-zinc-700">
                                            {item.displayOrder}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-zinc-500">
                                            {item.createdAt
                                                ? new Date(item.createdAt).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        {canManage && (
                                            <td className="px-5 py-4">
                                                <div className="flex justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete(item.id)}
                                                        title="Remove Menu Assignment"
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                                                    >
                                                        <Trash2 size={14} />
                                                        Remove
                                                    </button>
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
                    <p className="text-xs text-zinc-500">
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

                        <span className="px-2 text-xs font-medium text-zinc-700">
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

            {/* Assign Role Menu Modal */}
            <RoleMenuModal
                isOpen={isModalOpen}
                onClose={onCloseModal}
                onSubmit={onSubmitModal}
                roles={roles}
                menus={menus}
                defaultRoleId={roleFilter}
            />
        </div>
    );
}

export default RoleMenuTable;