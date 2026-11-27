
import {
    Plus,
    Search,
    Trash2,
    RefreshCw,
    Pencil,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    Banknote,
    Power
} from "lucide-react";

import { Button } from "../../components/common";

export default function LoanTypeTable({
    loanTypes,
    loading,
    error,
    success,
    canManage,
    searchInput,
    onSearchChange,
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
    onStatusChange
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
        "rounded-xl border border-pink-100 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-pink-500/70 focus:bg-pink-100/60 focus:ring-4 focus:ring-pink-500/10";

    const startRecord =
        totalRecords === 0 ? 0 : (pageNumber - 1) * pageSize + 1;

    const endRecord = Math.min(pageNumber * pageSize, totalRecords);

    const formatAmount = (amount) =>
        Number(amount || 0).toLocaleString("en-PK", {
            maximumFractionDigits: 2
        });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Loan Type Management
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Create and manage available loan products.
                    </p>
                </div>

                {canManage && (
                    <Button onClick={onAdd} icon={Plus}>
                        Add New Loan Type
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

            {/* Loan Types Table */}
            <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-xl shadow-pink-500/5">
                {/* Table Controls */}
                <div className="flex flex-col gap-3 border-b border-pink-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="font-semibold text-zinc-900">
                            All Loan Types
                        </h2>
                        <p className="mt-1 text-xs text-zinc-500">
                            Manage loan amounts, terms and interest rates.
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
                                placeholder="Search loan types..."
                                className={`${controlClass} w-full pl-10`}
                            />
                        </div>

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
                            <RefreshCw
                                size={17}
                                className={loading ? "animate-spin" : ""}
                            />
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-pink-100 bg-pink-50/50 text-xs uppercase tracking-wider text-zinc-500">
                            <tr>
                                <th className="px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("name")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-pink-400"
                                    >
                                        Loan Type {renderSortIcon("name")}
                                    </button>
                                </th>

                                <th className="px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("code")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-pink-400"
                                    >
                                        Code {renderSortIcon("code")}
                                    </button>
                                </th>

                                <th className="px-6 py-4 font-semibold">
                                    Amount Range
                                </th>

                                <th className="px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("interestRate")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-pink-400"
                                    >
                                        Interest {renderSortIcon("interestRate")}
                                    </button>
                                </th>

                                <th className="px-6 py-4 font-semibold">
                                    Term
                                </th>

                                <th className="px-6 py-4 font-semibold">
                                    Guarantor
                                </th>

                                <th className="px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={() => onSort("isActive")}
                                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-pink-400"
                                    >
                                        Status {renderSortIcon("isActive")}
                                    </button>
                                </th>

                                <th className="px-6 py-4 text-right font-semibold">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-pink-50">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="px-6 py-12 text-center text-zinc-500"
                                    >
                                        Loading loan types...
                                    </td>
                                </tr>
                            ) : loanTypes.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="px-6 py-12 text-center text-zinc-500"
                                    >
                                        No loan types found.
                                    </td>
                                </tr>
                            ) : (
                                loanTypes.map((loanType) => (
                                    <tr
                                        key={loanType.id}
                                        className="transition hover:bg-pink-50/50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-pink-500/25 bg-pink-500/15 text-pink-400">
                                                    <Banknote size={19} />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-zinc-900">
                                                        {loanType.name}
                                                    </p>
                                                    <p className="mt-1 max-w-xs truncate text-xs text-zinc-500">
                                                        {loanType.description || "No description"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="rounded-lg border border-pink-100 bg-pink-50/60 px-3 py-1 text-xs font-semibold text-pink-300">
                                                {loanType.code}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-zinc-700">
                                            <div>
                                                <span className="text-xs text-zinc-500">Min:</span>{" "}
                                                {formatAmount(loanType.minAmount)}
                                            </div>
                                            <div className="mt-1">
                                                <span className="text-xs text-zinc-500">Max:</span>{" "}
                                                {formatAmount(loanType.maxAmount)}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-zinc-900">
                                            {Number(loanType.interestRate).toLocaleString()}%
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-zinc-700">
                                            {loanType.minTermMonths}–{loanType.maxTermMonths} months
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={
                                                loanType.requiresGuarantor
                                                    ? "text-pink-400"
                                                    : "text-zinc-500"
                                            }>
                                                {loanType.requiresGuarantor ? "Required" : "Not required"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                                    loanType.isActive
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : "border-red-200 bg-red-50 text-red-600"
                                                }`}
                                            >
                                                {loanType.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {canManage && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => onEdit(loanType)}
                                                            className="rounded-lg p-2 text-pink-400 transition hover:bg-pink-500/15 hover:text-pink-300"
                                                            title="Edit loan type"
                                                        >
                                                            <Pencil size={17} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => onStatusChange(loanType)}
                                                            className={`rounded-lg p-2 transition ${
                                                                loanType.isActive
                                                                    ? "text-pink-400 hover:bg-pink-500/15"
                                                                    : "text-emerald-400 hover:bg-emerald-500/15"
                                                            }`}
                                                            title={loanType.isActive ? "Deactivate" : "Activate"}
                                                        >
                                                            <Power size={17} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => onDelete(loanType)}
                                                            className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/15 hover:text-red-300"
                                                            title="Delete loan type"
                                                        >
                                                            <Trash2 size={17} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col items-center justify-between gap-3 border-t border-pink-100 px-6 py-4 sm:flex-row">
                    <p className="text-xs text-zinc-500">
                        Showing {startRecord}–{endRecord} of {totalRecords} loan types
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
        </div>
    );
}
