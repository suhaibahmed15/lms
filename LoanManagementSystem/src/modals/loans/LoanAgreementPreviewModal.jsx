import { useEffect, useState } from "react";
import { Modal, Button } from "../../components/common";
import { getLoanSchedule } from "../../services/loanService";
import { generateLoanAgreementPdf } from "../../utils/pdfGenerator";
import { Download, Printer, CheckCircle, ShieldCheck, Building2, Calendar, FileText, User } from "lucide-react";

const formatCurrency = (amt) =>
    Number(amt || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

export default function LoanAgreementPreviewModal({
    isOpen,
    loan,
    onClose
}) {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (!isOpen || !loan) {
            setSchedule([]);
            return;
        }

        const fetchSched = async () => {
            try {
                setLoading(true);
                const res = await getLoanSchedule(loan.id);
                const list = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res)
                        ? res
                        : Array.isArray(res?.data?.data)
                            ? res.data.data
                            : [];
                setSchedule(list);
            } catch {
                setSchedule([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSched();
    }, [isOpen, loan]);

    if (!isOpen || !loan) return null;

    const sanctionDate = loan.disbursedAt
        ? new Date(loan.disbursedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : new Date(loan.createdAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const handleDownload = () => {
        try {
            setDownloading(true);
            generateLoanAgreementPdf(loan, schedule, {
                officerName: "Muhammad Ovais"
            });
        } finally {
            setTimeout(() => setDownloading(false), 500);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const monthlyInstallment = loan.termMonths > 0
        ? Number(loan.totalPayableAmount || 0) / Number(loan.termMonths)
        : 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Loan Sanction Letter & Legal Facility Agreement"
            subtitle={`Facility Agreement #${loan.loanNumber} — Official Bank Copy`}
            maxWidth="5xl"
        >
            <div className="space-y-6">
                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pink-200 bg-pink-50/60 p-3.5 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-xs text-zinc-700">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-pink-500 shadow-sm shadow-pink-500"></span>
                        <span className="font-semibold">Sanctioned Legal Document Ready for Review & Execution</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={Printer}
                            onClick={handlePrint}
                        >
                            Print Document
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            icon={Download}
                            loading={downloading}
                            loadingText="Generating..."
                            onClick={handleDownload}
                        >
                            Download Official PDF
                        </Button>
                    </div>
                </div>

                {/* Printable / Previewable Document Body */}
                <div className="printable-document rounded-3xl border border-pink-200 bg-white p-6 sm:p-8 text-zinc-900 shadow-xl space-y-6">
                    {/* Bank Letterhead */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-pink-100 pb-6">
                        <div className="flex items-center gap-3.5">
                            <img
                                src="/logo.png"
                                alt="LMS Bank"
                                className="h-12 w-auto object-contain rounded-xl p-1 bg-pink-50 border border-pink-200"
                            />
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                                    LMS CAPITAL BANKING CORP
                                    <ShieldCheck size={18} className="text-pink-600" />
                                </h2>
                                <p className="text-xs text-zinc-500">
                                    Division of Consumer Credit, Underwriting & Risk Management
                                </p>
                            </div>
                        </div>

                        <div className="text-left sm:text-right text-xs space-y-1">
                            <p className="font-mono text-pink-600 font-bold tracking-wide">
                                DOC REF: SANCTION-{loan.loanNumber}
                            </p>
                            <p className="text-zinc-500">
                                Issue Date: <span className="text-zinc-800 font-semibold">{sanctionDate}</span>
                            </p>
                            <p className="text-zinc-500">
                                Classification: <span className="text-pink-600 font-bold">Legally Binding & Executed</span>
                            </p>
                        </div>
                    </div>

                    {/* Sanction Title Banner */}
                    <div className="text-center py-2.5 border-b border-pink-100">
                        <h3 className="text-base sm:text-lg font-extrabold tracking-wider uppercase bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                            Formal Loan Sanction & Repayment Facility Agreement
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">
                            Executed under the State Consumer Credit & Banking Regulations
                        </p>
                    </div>

                    {/* Section 1: Facility & Borrower Summary Cards */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-3 flex items-center gap-1.5">
                            <User size={14} /> 1. Borrower & Loan Account Particulars
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                            <div className="rounded-2xl border border-pink-200/80 bg-pink-50/40 p-4">
                                <span className="text-[11px] text-zinc-500 block font-medium">Borrower Full Name</span>
                                <span className="text-sm font-bold text-zinc-900 mt-1 block truncate">{loan.borrowerName || "Me"}</span>
                                <span className="text-xs text-zinc-500 block truncate mt-0.5">{loan.borrowerEmail || "—"}</span>
                            </div>

                            <div className="rounded-2xl border border-pink-200/80 bg-pink-50/40 p-4">
                                <span className="text-[11px] text-zinc-500 block font-medium">Loan Scheme / Product</span>
                                <span className="text-sm font-bold text-zinc-900 mt-1 block truncate">{loan.loanTypeName || "Consumer Credit"}</span>
                                <span className="text-xs text-pink-600 font-semibold block mt-0.5">Active & Sanctioned</span>
                            </div>

                            <div className="rounded-2xl border border-pink-200/80 bg-pink-50/40 p-4">
                                <span className="text-[11px] text-zinc-500 block font-medium">Sanctioned Principal</span>
                                <span className="text-sm font-bold text-pink-600 mt-1 block tabular-nums">PKR {formatCurrency(loan.principalAmount)}</span>
                                <span className="text-xs text-zinc-500 block mt-0.5">APR: {loan.interestRate}% Fixed</span>
                            </div>

                            <div className="rounded-2xl border border-pink-200/80 bg-pink-50/40 p-4">
                                <span className="text-[11px] text-zinc-500 block font-medium">Total Repayment Obligation</span>
                                <span className="text-sm font-bold text-zinc-900 mt-1 block tabular-nums">PKR {formatCurrency(loan.totalPayableAmount)}</span>
                                <span className="text-xs text-zinc-500 block mt-0.5">{loan.termMonths} Months (~PKR {formatCurrency(monthlyInstallment)}/mo)</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Statutory Terms, Grace Period & Penalty Clause */}
                    <div className="rounded-2xl border border-pink-200 bg-pink-50/60 p-5 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-pink-700 flex items-center gap-1.5">
                            <Building2 size={14} /> 2. Statutory Repayment Terms & Overdue Surcharge Clause
                        </h4>
                        <div className="text-xs leading-relaxed text-zinc-700 space-y-2.5">
                            <p>
                                <strong className="text-zinc-900">A. Amortization & Installment Due Dates:</strong> The Borrower agrees to repay the total sanctioned obligation in consecutive monthly installments as outlined in the Amortization Schedule below. Each installment must be remitted on or before the due date specified.
                            </p>
                            <p>
                                <strong className="text-zinc-900">B. Grace Period & Late Penalty Surcharge:</strong> A mandatory grace period of seven (7) calendar days is granted from the installment due date. Any installment remaining unpaid past this 7-day grace period will automatically attract an overdue surcharge fee of <span className="text-pink-600 font-bold">2.0% per month</span> calculated on the outstanding installment balance until settled in full.
                            </p>
                            <p>
                                <strong className="text-zinc-900">C. Acceleration & Default Recourse:</strong> Failure to service installments for two (2) consecutive billing cycles shall constitute an Event of Default, empowering LMS Capital Banking Corp to accelerate the full loan liability and proceed with recovery enforcement against the Borrower and any registered Guarantor(s).
                            </p>
                        </div>
                    </div>

                    {/* Section 3: Complete Amortization Schedule Table */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-600 flex items-center gap-1.5">
                                <Calendar size={14} /> 3. Amortization & Repayment Schedule Table
                            </h4>
                            <span className="text-xs font-medium text-zinc-500">
                                {schedule.length} Installment Cycle(s)
                            </span>
                        </div>

                        {/* Contained, Scrollable Table with Sticky Header */}
                        <div className="max-h-[380px] overflow-y-auto overflow-x-auto rounded-2xl border border-pink-200 bg-white custom-scrollbar shadow-sm">
                            <table className="w-full min-w-[640px] text-left text-xs">
                                <thead className="sticky top-0 bg-pink-100/70 z-10 border-b border-pink-200 text-[11px] uppercase tracking-wider text-pink-900 shadow-sm font-bold">
                                    <tr>
                                        <th className="px-4 py-3 font-bold min-w-[70px]">Inst #</th>
                                        <th className="px-4 py-3 font-bold min-w-[110px]">Due Date</th>
                                        <th className="px-4 py-3 font-bold text-right min-w-[120px]">Principal</th>
                                        <th className="px-4 py-3 font-bold text-right min-w-[110px]">Interest</th>
                                        <th className="px-4 py-3 font-bold text-right min-w-[130px]">Total Due (PKR)</th>
                                        <th className="px-4 py-3 font-bold text-right min-w-[110px]">Paid</th>
                                        <th className="px-4 py-3 font-bold text-center min-w-[100px]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-pink-100 text-zinc-700 tabular-nums font-sans">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-zinc-400 font-sans">
                                                Loading amortization schedule...
                                            </td>
                                        </tr>
                                    ) : schedule.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-6 text-center text-zinc-400 font-sans">
                                                Schedule not yet initiated.
                                            </td>
                                        </tr>
                                    ) : (
                                        schedule.map((item, idx) => {
                                            const instNum = item.installmentNumber ?? item.InstallmentNumber ?? (idx + 1);
                                            const due = item.dueDate ?? item.DueDate;
                                            const prin = item.principalDue ?? item.PrincipalDue ?? 0;
                                            const intD = item.interestDue ?? item.InterestDue ?? 0;
                                            const tot = item.totalDue ?? item.TotalDue ?? item.totalAmount ?? 0;
                                            const paid = item.paidAmount ?? item.PaidAmount ?? 0;
                                            const sk = (item.statusKey ?? item.StatusKey ?? item.statusName ?? "").toUpperCase();
                                            const isPaid = sk.includes("PAID") && !sk.includes("PARTIAL");

                                            return (
                                                <tr key={item.id ?? idx} className="hover:bg-pink-50/50 transition-colors">
                                                    <td className="px-4 py-2.5 font-bold text-zinc-900">#{instNum}</td>
                                                    <td className="px-4 py-2.5 text-zinc-600">
                                                        {due ? new Date(due).toLocaleDateString() : "—"}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right text-zinc-700 font-medium">{formatCurrency(prin)}</td>
                                                    <td className="px-4 py-2.5 text-right text-zinc-500">{formatCurrency(intD)}</td>
                                                    <td className="px-4 py-2.5 text-right font-bold text-zinc-900">{formatCurrency(tot)}</td>
                                                    <td className="px-4 py-2.5 text-right text-pink-600 font-bold">{formatCurrency(paid)}</td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                            isPaid
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                : "bg-pink-50 text-pink-700 border border-pink-200"
                                                        }`}>
                                                            {isPaid ? "Settled" : "Scheduled"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 4: Authorized Signatures & Seal */}
                    <div className="pt-6 border-t border-pink-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                            {/* Bank Officer Signatory */}
                            <div className="space-y-2">
                                <span className="text-[11px] uppercase tracking-wider text-zinc-500 block font-bold">
                                    Authorized Bank Sanctioning Authority:
                                </span>
                                <div className="border border-pink-200 rounded-2xl bg-pink-50/40 p-4 space-y-2">
                                    {/* Stylized Signature */}
                                    <div className="font-serif italic text-2xl text-pink-600 tracking-wider">
                                        Muhammad Ovais
                                    </div>
                                    <div className="border-t border-pink-100 pt-2 text-xs">
                                        <p className="font-bold text-zinc-900">Muhammad Ovais</p>
                                        <p className="text-[11px] text-zinc-500">Senior Credit Underwriting & Risk Officer</p>
                                        <p className="text-[10px] text-pink-600 flex items-center gap-1 mt-1 font-semibold">
                                            <CheckCircle size={12} /> Digitally Signed & Authenticated
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Borrower Acceptance */}
                            <div className="space-y-2">
                                <span className="text-[11px] uppercase tracking-wider text-zinc-500 block font-bold">
                                    Borrower Acknowledgement & Acceptance:
                                </span>
                                <div className="border border-pink-200 rounded-2xl bg-pink-50/40 p-4 space-y-2">
                                    <div className="font-serif italic text-2xl text-zinc-700 tracking-wider">
                                        {loan.borrowerName || "Borrower"}
                                    </div>
                                    <div className="border-t border-pink-100 pt-2 text-xs">
                                        <p className="font-bold text-zinc-900">{loan.borrowerName || "Customer"}</p>
                                        <p className="text-[11px] text-zinc-500">Accepted Terms & Penalty Conditions</p>
                                        <p className="text-[10px] text-zinc-400 mt-1">
                                            Execution Timestamp: {sanctionDate}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={onClose}>
                        Close Preview
                    </Button>
                    <Button variant="primary" icon={Download} loading={downloading} onClick={handleDownload}>
                        Download Official PDF Agreement
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
