import {
    Plus,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    UserCheck,
    CheckCircle2,
    XCircle,
    Banknote,
    ArrowUpRight
} from "lucide-react";

import { Button } from "../../components/common";

const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const getStatusStyle = (statusKey) => {
    switch (statusKey) {
        case "APPLICATION_APPROVED":
            return "bg-emerald-50 text-emerald-700 border border-emerald-200";
        case "APPLICATION_REJECTED":
            return "bg-red-50 text-red-600 border border-red-200";
        case "APPLICATION_SUBMITTED":
            return "bg-pink-100/60 text-zinc-900 border border-pink-200";
        case "APPLICATION_UNDER_REVIEW":
            return "bg-pink-100/70 text-pink-700 border border-pink-500/20";
        case "APPLICATION_DOCUMENTS_REQUIRED":
            return "bg-pink-100/70 text-pink-700 border border-pink-500/30";
        case "APPLICATION_DISBURSED":
            return "bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 border border-pink-500/30";
        default:
            return "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20";
    }
};

export default function LoanApplicationTable({
    applications = [],
    loading,
    error,
    success,
    search,
    onSearchChange,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    onPageChange,
    onPageSizeChange,
    onRefresh,
    onAdd,
    onReview,
    onAssign,
    onApprove,
    onReject,
    onDisburse,
    canCreate,
    canReview,
    canAssign,
    canApprove,
    canReject,
    canDisburse,
    onAddGuarantor,
    onViewLoan
}) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">
                        Loan Applications
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        View, review, assign, and manage loan applications across the lifecycle.
                    </p>
                </div>

                {canCreate && (
                    <Button onClick={onAdd} icon={Plus}>
                        New Application
                    </Button>
                )}
            </div>

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

            <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white">
                <div className="flex flex-col gap-3 border-b border-pink-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search by number or applicant..."
                            className="w-full rounded-xl border border-pink-100 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-pink-500/70 focus:ring-2 focus:ring-pink-500/20"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="rounded-xl border border-pink-100 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                        </select>

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

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-pink-100 bg-pink-50/30 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                <th className="px-5 py-4">Application #</th>
                                <th className="px-5 py-4">Applicant</th>
                                <th className="px-5 py-4">Loan Type</th>
                                <th className="px-5 py-4">Amount (PKR)</th>
                                <th className="px-5 py-4">Term</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Guarantor</th>
                                <th className="px-5 py-4">Assigned Officer</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-pink-50 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-zinc-500">
                                        Loading applications...
                                    </td>
                                </tr>
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-zinc-500">
                                        No loan applications found.
                                    </td>
                                </tr>
                            ) : (
                                applications.map((application) => {
                                    const canReviewThis =
                                        canReview &&
                                        [
                                            "APPLICATION_SUBMITTED",
                                            "APPLICATION_UNDER_REVIEW",
                                            "APPLICATION_DOCUMENTS_REQUIRED"
                                        ].includes(application.statusKey);

                                    const canAssignThis =
                                        canAssign &&
                                        [
                                            "APPLICATION_SUBMITTED",
                                            "APPLICATION_UNDER_REVIEW",
                                            "APPLICATION_DOCUMENTS_REQUIRED"
                                        ].includes(application.statusKey);

                                    const canApproveOrRejectThis =
                                        (canApprove || canReject) &&
                                        [
                                            "APPLICATION_SUBMITTED",
                                            "APPLICATION_UNDER_REVIEW"
                                        ].includes(application.statusKey);

                                    const canDisburseThis =
                                        canDisburse &&
                                        application.statusKey === "APPLICATION_APPROVED";

                                    return (
                                        <tr
                                            key={application.id}
                                            className="transition hover:bg-pink-50/30"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-zinc-900">
                                                    {application.applicationNumber}
                                                </p>
                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {application.submittedAt
                                                        ? new Date(application.submittedAt).toLocaleDateString()
                                                        : "—"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-zinc-700 font-medium">
                                                {application.applicantName || "—"}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-zinc-700">
                                                {application.loanTypeName || "—"}
                                            </td>

                                            <td className="px-5 py-4 text-sm font-semibold text-zinc-900">
                                                {formatAmount(application.requestedAmount)}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-zinc-700">
                                                {application.requestedTermMonths} mos
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(application.statusKey)}`}>
                                                    {application.statusName || application.statusKey}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                {application.requiresGuarantor ? (
                                                    application.hasVerifiedGuarantor ? (
                                                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            Verified
                                                        </span>
                                                    ) : (application.guarantorCount || 0) > 0 ? (
                                                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-pink-100/70 text-pink-700 border border-pink-500/20">
                                                            Pending Verification
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-red-50 text-red-600 border border-red-200">
                                                                Required
                                                            </span>
                                                            {onAddGuarantor && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onAddGuarantor(application)}
                                                                    className="text-xs font-medium text-pink-400 hover:text-pink-300 underline cursor-pointer"
                                                                    title="Submit Guarantor for this application"
                                                                >
                                                                    + Add
                                                                </button>
                                                            )}
                                                        </div>
                                                    )
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-slate-800 text-zinc-500">
                                                        Not Required
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-zinc-500">
                                                {application.assignedToUserName || "Unassigned"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                    {canAssignThis && onAssign && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            icon={UserCheck}
                                                            onClick={() => onAssign(application)}
                                                            title="Assign to Officer"
                                                        >
                                                            Assign
                                                        </Button>
                                                    )}

                                                    {canReviewThis && onReview && (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            icon={ClipboardCheck}
                                                            onClick={() => onReview(application)}
                                                            title="Review Application"
                                                        >
                                                            Review
                                                        </Button>
                                                    )}

                                                    {canApproveOrRejectThis && canApprove && onApprove && (
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            icon={CheckCircle2}
                                                            onClick={() => onApprove(application)}
                                                            title="Approve Application"
                                                        >
                                                            Approve
                                                        </Button>
                                                    )}

                                                    {canApproveOrRejectThis && canReject && onReject && (
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            icon={XCircle}
                                                            onClick={() => onReject(application)}
                                                            title="Reject Application"
                                                        >
                                                            Reject
                                                        </Button>
                                                    )}

                                                    {canDisburseThis && onDisburse && (
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            icon={Banknote}
                                                            onClick={() => onDisburse(application)}
                                                            title="Disburse as Active Loan"
                                                        >
                                                            Disburse
                                                        </Button>
                                                    )}

                                                    {(application.statusKey === "APPLICATION_APPROVED" || application.statusKey === "APPLICATION_DISBURSED") && onViewLoan && (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            icon={ArrowUpRight}
                                                            onClick={() => onViewLoan(application)}
                                                            title="View Sanctioned Facility in Active Loans"
                                                        >
                                                            Active Loan
                                                        </Button>
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

                <div className="flex flex-col gap-3 border-t border-pink-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-zinc-500">
                        Total applications:{" "}
                        <span className="font-semibold text-zinc-900">
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

                        <span className="px-2 text-sm text-zinc-500">
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
