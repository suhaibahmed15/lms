import {
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Eye,
    CalendarDays,
    History,
    FileText
} from "lucide-react";
import { Button } from "../../components/common";

const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const getLoanStatusBadge = (statusKey) => {
    switch (statusKey) {
        case "LOAN_ACTIVE":
            return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
        case "LOAN_CLOSED":
            return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
        case "LOAN_DEFAULTED":
            return "bg-red-500/10 text-red-400 border border-red-500/20";
        default:
            return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
    }
};

export default function LoanTable({
    loans = [],
    loading,
    error,
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    onPageChange,
    onPageSizeChange,
    onRefresh,
    onViewDetails,
    onViewSchedule,
    onViewRepayments,
    onDownloadAgreement
}) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Disbursed Loans</h1>
                    <p className="mt-1 text-sm text-zinc-400">
                        Monitor active loan portfolios, repayment schedules, and outstanding balances.
                    </p>
                </div>

                <Button
                    variant="secondary"
                    size="sm"
                    icon={RefreshCw}
                    onClick={onRefresh}
                    loading={loading}
                >
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
                <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col sm:flex-row gap-3">
                        <div className="relative w-full sm:max-w-sm">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Search by loan # or borrower..."
                                className="w-full rounded-xl border border-white/10 bg-[#181818] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-orange-500/70"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange(e.target.value)}
                            className="rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-sm text-white outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="LOAN_ACTIVE">Active</option>
                            <option value="LOAN_CLOSED">Closed</option>
                            <option value="LOAN_DEFAULTED">Defaulted</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-sm text-white outline-none"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                <th className="px-5 py-4">Loan #</th>
                                <th className="px-5 py-4">Borrower</th>
                                <th className="px-5 py-4">Principal (PKR)</th>
                                <th className="px-5 py-4">Interest Rate</th>
                                <th className="px-5 py-4">Term</th>
                                <th className="px-5 py-4">Outstanding (PKR)</th>
                                <th className="px-5 py-4">Monthly Installment</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-zinc-500">
                                        Loading loans...
                                    </td>
                                </tr>
                            ) : loans.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-zinc-500">
                                        No loans found.
                                    </td>
                                </tr>
                            ) : (
                                loans.map((loan) => (
                                    <tr
                                        key={loan.id}
                                        className="transition hover:bg-white/[0.025]"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-white font-mono">
                                                {loan.loanNumber}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                {loan.disbursedAt
                                                    ? new Date(loan.disbursedAt).toLocaleDateString()
                                                    : "—"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-zinc-300 font-medium">
                                            {loan.borrowerName || "—"}
                                        </td>

                                        <td className="px-5 py-4 text-sm font-semibold text-white">
                                            {formatAmount(loan.principalAmount)}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-zinc-300">
                                            {loan.interestRate}%
                                        </td>

                                        <td className="px-5 py-4 text-sm text-zinc-300">
                                            {loan.termMonths} mos
                                        </td>

                                        <td className="px-5 py-4 text-sm font-bold text-orange-400">
                                            {formatAmount(loan.outstandingBalance)}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-zinc-300">
                                            {formatAmount(loan.monthlyInstallment)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getLoanStatusBadge(loan.statusKey)}`}>
                                                {loan.statusName || loan.statusKey}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    icon={Eye}
                                                    onClick={() => onViewDetails(loan)}
                                                    title="View Details"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    icon={CalendarDays}
                                                    onClick={() => onViewSchedule(loan)}
                                                    title="Repayment Schedule"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    icon={FileText}
                                                    onClick={() => onDownloadAgreement ? onDownloadAgreement(loan) : onViewSchedule(loan)}
                                                    title="View & Download Loan Agreement"
                                                    className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    icon={History}
                                                    onClick={() => onViewRepayments(loan)}
                                                    title="Repayment History"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-zinc-500">
                        Total loans:{" "}
                        <span className="font-semibold text-white">
                            {totalRecords}
                        </span>
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={ChevronLeft}
                            disabled={pageNumber <= 1 || loading}
                            onClick={() => onPageChange(pageNumber - 1)}
                        >
                            Prev
                        </Button>

                        <span className="px-2 text-sm text-zinc-400">
                            Page {pageNumber} of {totalPages || 1}
                        </span>

                        <Button
                            variant="secondary"
                            size="sm"
                            iconRight={ChevronRight}
                            disabled={pageNumber >= totalPages || loading}
                            onClick={() => onPageChange(pageNumber + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
