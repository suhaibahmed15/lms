import {
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    Menu as MenuIcon,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    CornerDownRight,
    Folder
} from "lucide-react";

import MenuModal from "./MenuModal";
import { Button } from "../../components/common";

function MenuTable({
    menus,
    parentMenuOptions,
    summary,
    loading,
    error,
    canManage,
    searchInput,
    onSearchChange,
    parentFilter,
    onParentFilterChange,
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
    onDelete,
    isModalOpen,
    onCloseModal,
    onSubmitModal,
    selectedMenu
}) {
    const renderSortIcon = (column) => {
        if (sortBy !== column) {
            return <ArrowUpDown size={14} className="text-zinc-500" />;
        }
        return sortDirection === "asc"
            ? <ArrowUp size={14} className="text-orange-400" />
            : <ArrowDown size={14} className="text-orange-400" />;
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
                        Menu Management
                    </h1>

                    <p className="mt-1 text-sm text-zinc-400">
                        Manage system menus and navigation items.
                    </p>
                </div>

                {canManage && (
                    <Button onClick={onAdd} icon={Plus}>
                        Add Menu
                    </Button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-400">Total Menus</p>
                            <h2 className="mt-2 text-2xl font-bold text-white">
                                {summary.total}
                            </h2>
                        </div>

                        <div className="rounded-xl border border-orange-500/25 bg-orange-500/15 p-3 text-orange-400">
                            <MenuIcon size={22} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                    <p className="text-sm text-zinc-400">Active Menus</p>
                    <h2 className="mt-2 text-2xl font-bold text-emerald-400">
                        {summary.active}
                    </h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                    <p className="text-sm text-zinc-400">Inactive Menus</p>
                    <h2 className="mt-2 text-2xl font-bold text-red-400">
                        {summary.inactive}
                    </h2>
                </div>
            </div>

            {/* Menu Table */}
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
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Search menus, keys, routes..."
                                className={`${controlClass} w-full pl-10`}
                            />
                        </div>

                        <select
                            value={parentFilter}
                            onChange={(e) => onParentFilterChange(e.target.value)}
                            className={controlClass}
                        >
                            <option value="">All Menu Levels</option>
                            <option value="0">Parent / Root Menus Only</option>
                            {parentMenuOptions.map((parent) => (
                                <option key={parent.id} value={parent.id}>
                                    Children of: {parent.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange(e.target.value)}
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
                                        onClick={() => onSort("name")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                    >
                                        Menu {renderSortIcon("name")}
                                    </button>
                                </th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("key")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                    >
                                        Key {renderSortIcon("key")}
                                    </button>
                                </th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("route")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                    >
                                        Route {renderSortIcon("route")}
                                    </button>
                                </th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("parentMenu")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                    >
                                        Parent Menu {renderSortIcon("parentMenu")}
                                    </button>
                                </th>
                                <th className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("displayOrder")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                    >
                                        Order {renderSortIcon("displayOrder")}
                                    </button>
                                </th>
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
                                <th className="px-5 py-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/[0.07]">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-5 py-10 text-center text-zinc-400">
                                        Loading menus...
                                    </td>
                                </tr>
                            ) : menus.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-5 py-10 text-center text-zinc-500">
                                        No menus found.
                                    </td>
                                </tr>
                            ) : (
                                menus.map((menu, index) => {
                                    const isParent = menu.parentMenuId == null;
                                    const rowClass = isParent
                                        ? index > 0
                                            ? "transition hover:bg-white/[0.05] bg-white/[0.03] border-t-2 border-white/15"
                                            : "transition hover:bg-white/[0.05] bg-white/[0.03]"
                                        : "transition hover:bg-white/[0.05]";

                                    return (
                                        <tr key={menu.id} className={rowClass}>
                                            <td className="px-5 py-4">
                                                {isParent ? (
                                                    <div className="flex items-start gap-2.5">
                                                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/15 text-orange-400">
                                                            <Folder size={13} />
                                                        </span>

                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-white">
                                                                    {menu.name}
                                                                </span>

                                                                <span className="rounded-md border border-orange-500/25 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-300">
                                                                    Parent
                                                                </span>
                                                            </div>

                                                            <div className="mt-0.5 text-xs text-zinc-500">
                                                                {menu.icon || "No icon"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start gap-2.5 pl-6">
                                                        <CornerDownRight
                                                            size={15}
                                                            className="mt-0.5 shrink-0 text-orange-400/70"
                                                        />

                                                        <div>
                                                            <div className="font-medium text-zinc-200">
                                                                {menu.name}
                                                            </div>

                                                            <div className="mt-0.5 text-xs text-zinc-500">
                                                                {menu.icon || "No icon"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-orange-300">
                                                    {menu.key}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-zinc-300">
                                                {menu.route || "-"}
                                            </td>

                                            <td className="px-5 py-4">
                                                {isParent ? (
                                                    <span className="text-xs font-medium text-zinc-500">
                                                        Main Menu
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-300">
                                                        {menu.parentMenuName || "-"}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-zinc-300">
                                                {menu.displayOrder}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                                                        menu.isActive
                                                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                                                            : "border-red-500/25 bg-red-500/10 text-red-400"
                                                    }`}
                                                >
                                                    {menu.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-zinc-400">
                                                {menu.createdAt
                                                    ? new Date(menu.createdAt).toLocaleDateString()
                                                    : "-"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {canManage && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onEdit(menu)}
                                                            title="Edit Menu"
                                                            className="rounded-lg p-2 text-orange-400 transition hover:bg-orange-500/15 hover:text-orange-300"
                                                        >
                                                            <Pencil size={17} />
                                                        </button>
                                                    )}

                                                    {canManage && menu.isActive && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onDelete(menu.id)}
                                                            title="Deactivate Menu"
                                                            className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/15 hover:text-red-300"
                                                        >
                                                            <Trash2 size={17} />
                                                        </button>
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
                        Showing {startRecord}–{endRecord} of {totalRecords} menus
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

            {/* Menu Modal */}
            <MenuModal
                isOpen={isModalOpen}
                onClose={onCloseModal}
                onSubmit={onSubmitModal}
                selectedMenu={selectedMenu}
                menus={parentMenuOptions}
            />
        </div>
    );
}

export default MenuTable;

