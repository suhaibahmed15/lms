import {
    UserRound,
    Search,
    Trash2,
    ShieldCheck,
    CheckCircle,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import { Button } from "../../components/common";

export default function UserMenuTable({
    selectedUser,
    roleMenus,
    userMenus,
    loading,
    refreshing,
    canManage,
    removingId,
    assignedSearchInput,
    onAssignedSearchChange,
    assignedPageSize,
    onAssignedPageSizeChange,
    assignedSortBy,
    assignedSortDirection,
    onAssignedSort,
    assignedPageNumber,
    assignedTotalPages,
    assignedTotalRecords,
    onAssignedPageChange,
    onRemove
}) {
    const renderSortIcon = (column) => {
        if (assignedSortBy !== column) {
            return <ArrowUpDown size={14} className="text-zinc-500" />;
        }
        return assignedSortDirection === "asc" ? (
            <ArrowUp size={14} className="text-orange-400" />
        ) : (
            <ArrowDown size={14} className="text-orange-400" />
        );
    };

    const controlClass =
        "rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500/70 focus:bg-white/[0.10] focus:ring-4 focus:ring-orange-500/10";

    const startRecord =
        assignedTotalRecords === 0
            ? 0
            : (assignedPageNumber - 1) * assignedPageSize + 1;
    const endRecord = Math.min(
        assignedPageNumber * assignedPageSize,
        assignedTotalRecords
    );

    return (
        <div className="space-y-6">
            {/* Role Menus */}
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={20} className="text-orange-400" />
                            <h2 className="font-semibold text-white">
                                Inherited Role Menus
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">
                            Menus available automatically through user's role:{" "}
                            <span className="font-medium text-orange-400">
                                {selectedUser.roleName || selectedUser.roleKey}
                            </span>
                        </p>
                    </div>
                    <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                        {roleMenus.length} Menus
                    </span>
                </div>

                {roleMenus.length === 0 ? (
                    <p className="py-4 text-center text-sm text-zinc-500">
                        No inherited role menus found.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {roleMenus.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 p-3"
                            >
                                <CheckCircle
                                    size={17}
                                    className="shrink-0 text-orange-400"
                                />
                                <span className="text-sm font-medium text-zinc-200">
                                    {item.menuName}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Individual Menu Assignments Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-xl shadow-black/40">
                <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <UserRound size={20} className="text-orange-400" />
                            <h2 className="font-semibold text-white">
                                Individual Menu Assignments
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">
                            Additional menus assigned directly to this user.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-56">
                            <Search
                                size={16}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                            />
                            <input
                                type="text"
                                value={assignedSearchInput}
                                onChange={(e) => onAssignedSearchChange(e.target.value)}
                                placeholder="Search assigned..."
                                className={`${controlClass} w-full py-2 pl-10`}
                            />
                        </div>

                        <select
                            value={assignedPageSize}
                            onChange={(e) => onAssignedPageSizeChange(Number(e.target.value))}
                            className={`${controlClass} py-2`}
                        >
                            <option value={5}>5 / page</option>
                            <option value={10}>10 / page</option>
                            <option value={20}>20 / page</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-zinc-400">
                            <tr>
                                <th className="px-5 py-3.5">
                                    <button
                                        type="button"
                                        onClick={() => onAssignedSort("menuName")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                    >
                                        Menu Name {renderSortIcon("menuName")}
                                    </button>
                                </th>
                                <th className="px-5 py-3.5">
                                    <button
                                        type="button"
                                        onClick={() => onAssignedSort("menuKey")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                    >
                                        Menu Key {renderSortIcon("menuKey")}
                                    </button>
                                </th>
                                <th className="px-5 py-3.5">
                                    <button
                                        type="button"
                                        onClick={() => onAssignedSort("route")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                    >
                                        Route {renderSortIcon("route")}
                                    </button>
                                </th>
                                <th className="px-5 py-3.5 text-center font-semibold">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/[0.07]">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-5 py-8 text-center text-zinc-400">
                                        Loading user menus...
                                    </td>
                                </tr>
                            ) : userMenus.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-5 py-8 text-center text-zinc-500">
                                        No individual menu assignments for this user.
                                    </td>
                                </tr>
                            ) : (
                                userMenus.map((item) => (
                                    <tr key={item.id} className="transition hover:bg-white/[0.04]">
                                        <td className="px-5 py-3.5 font-medium text-white">
                                            {item.menuName}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-orange-300">
                                                {item.menuKey}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-zinc-400">
                                            {item.route}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            {canManage && (
                                                <button
                                                    type="button"
                                                    onClick={() => onRemove(item.id)}
                                                    disabled={removingId === item.id}
                                                    title="Remove menu"
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                                                >
                                                    <Trash2 size={14} />
                                                    {removingId === item.id ? "Removing..." : "Remove"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-5 py-3.5 sm:flex-row">
                    <p className="text-xs text-zinc-400">
                        Showing {startRecord}–{endRecord} of {assignedTotalRecords} assignments
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onAssignedPageChange(Math.max(1, assignedPageNumber - 1))}
                            disabled={assignedPageNumber <= 1 || refreshing}
                            icon={ChevronLeft}
                        >
                            Previous
                        </Button>

                        <span className="px-2 text-xs font-medium text-zinc-300">
                            Page {assignedTotalPages === 0 ? 0 : assignedPageNumber} of {assignedTotalPages}
                        </span>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onAssignedPageChange(Math.min(assignedTotalPages, assignedPageNumber + 1))}
                            disabled={assignedPageNumber >= assignedTotalPages || refreshing}
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
