import {
    Plus,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { Button } from "../../components/common";

const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const getRepaymentStatusBadge = (statusKey) => {
    switch (statusKey) {
        case "REPAYMENT_VERIFIED":
            return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
        case "REPAYMENT_REJECTED":
            return "bg-red-500/10 text-red-400 border border-red-500/20";
        case "REPAYMENT_PENDING":
        default:
            return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    }
};

export default function RepaymentTable({
    payments = [],
    pendingPayments = [],
    activeTab = "all", // "all" | "pending"
    onTabChange,
    loading,
    error,
    success,
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
    onSubmitPayment,
    onVerifyPayment,
    onRejectPayment,
    canSubmit,
    canVerify
}) {
    const isPendingTab = activeTab === "pending";
    const currentList = isPendingTab ? pendingPayments : payments;

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Loan Repayments</h1>
                    <p className="mt-1 text-sm text-zinc-400">
                        Track borrower payments, verify transaction receipts, and view payment allocations.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {canSubmit && (
                        <Button onClick={onSubmitPayment} icon={Plus}>
                            Submit Payment
                        </Button>
                    )}
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
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                    {success}
                </div>
            )}

            {/* Navigation Tabs */}
            {canVerify && (
                <div className="flex gap-2 border-b border-white/10 pb-3">
                    <button
                        type="button"
                        onClick={() => onTabChange("all")}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                            activeTab === "all"
                                ? "bg-orange-500 text-white"
                                : "text-zinc-400 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                        All Repayments
                    </button>
                    <button
                        type="button"
                        onClick={() => onTabChange("pending")}
                        className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition ${
                            activeTab === "pending"
                                ? "bg-orange-500 text-white"
                                : "text-zinc-400 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                        Pending Verification
                        {pendingPayments.length > 0 && (
                            <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white font-bold">
                                {pendingPayments.length}
                            </span>
                        )}
                    </button>
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
                {!isPendingTab && (
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
                                    placeholder="Search by ref # or borrower..."
                                    className="w-full rounded-xl border border-white/10 bg-[#181818] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-orange-500/70"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => onStatusFilterChange(e.target.value)}
                                className="rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-sm text-white outline-none"
                            >
                                <option value="">All Statuses</option>
                                <option value="REPAYMENT_PENDING">Pending</option>
                                <option value="REPAYMENT_VERIFIED">Verified</option>
                                <option value="REPAYMENT_REJECTED">Rejected</option>
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
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                <th className="px-5 py-4">Reference #</th>
                                <th className="px-5 py-4">Borrower</th>
                                <th className="px-5 py-4">Amount (PKR)</th>
                                <th className="px-5 py-4">Method</th>
                                <th className="px-5 py-4">Payment Date</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Allocation</th>
                                {canVerify && <th className="px-5 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-zinc-500">
                                        Loading repayments...
                                    </td>
                                </tr>
                            ) : currentList.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-zinc-500">
                                        {isPendingTab ? "No pending payments awaiting verification." : "No repayments found."}
                                    </td>
                                </tr>
                            ) : (
                                currentList.map((payment) => {
                                    const isPending = (payment.statusKey || payment.status) === "REPAYMENT_PENDING";

                                    return (
                                        <tr
                                            key={payment.id}
                                            className="transition hover:bg-white/[0.025]"
                                        >
                                            <td className="px-5 py-4 font-mono font-medium text-white">
                                                {payment.paymentReference}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-zinc-300 font-medium">
                                                {payment.borrowerName || "—"}
                                            </td>

                                            <td className="px-5 py-4 text-sm font-bold text-emerald-400">
                                                {formatAmount(payment.amount)}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-zinc-300">
                                                {payment.paymentMethod || "Bank Transfer"}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-zinc-400">
                                                {payment.paidAt || payment.paymentDate
                                                    ? new Date(payment.paidAt || payment.paymentDate).toLocaleDateString()
                                                    : "—"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getRepaymentStatusBadge(payment.statusKey || payment.status)}`}>
                                                    {payment.statusName || payment.statusKey || payment.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-xs text-zinc-400">
                                                {payment.principalAmount != null || payment.interestAmount != null ? (
                                                    <span>
                                                        Int: {formatAmount(payment.interestAmount || 0)} | Prin: {formatAmount(payment.principalAmount || 0)}
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>

                                            {canVerify && (
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {isPending && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="primary"
                                                                    icon={CheckCircle2}
                                                                    onClick={() => onVerifyPayment(payment)}
                                                                    title="Verify Payment"
                                                                >
                                                                    Verify
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="danger"
                                                                    icon={XCircle}
                                                                    onClick={() => onRejectPayment(payment)}
                                                                    title="Reject Payment"
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!isPendingTab && (
                    <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-zinc-500">
                            Total repayments:{" "}
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
                )}
            </div>
        </div>
    );
}
