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
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/80 bg-slate-900/80 p-3.5 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
                        <span className="font-medium">Sanctioned Legal Document Ready for Review & Execution</span>
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
                <div className="printable-document rounded-2xl border border-slate-700/80 bg-gradient-to-b from-[#0b1329] via-[#0f172a] to-[#0b1329] p-6 sm:p-8 text-slate-100 shadow-2xl space-y-6">
                    {/* Bank Letterhead */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl tracking-tight">
                                LMS
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                    LMS CAPITAL BANKING CORP
                                    <ShieldCheck size={18} className="text-emerald-400" />
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Division of Consumer Credit, Underwriting & Risk Management
                                </p>
                            </div>
                        </div>

                        <div className="text-left sm:text-right text-xs space-y-1">
                            <p className="font-mono text-amber-400 font-semibold tracking-wide">
                                DOC REF: SANCTION-{loan.loanNumber}
                            </p>
                            <p className="text-slate-400">
                                Issue Date: <span className="text-slate-200 font-medium">{sanctionDate}</span>
                            </p>
                            <p className="text-slate-400">
                                Classification: <span className="text-emerald-400 font-semibold">Legally Binding & Executed</span>
                            </p>
                        </div>
                    </div>

                    {/* Sanction Title Banner */}
                    <div className="text-center py-2.5 border-b border-slate-800/80">
                        <h3 className="text-base sm:text-lg font-bold tracking-wider uppercase text-amber-300">
                            Formal Loan Sanction & Repayment Facility Agreement
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            Executed under the State Consumer Credit & Banking Regulations
                        </p>
                    </div>

                    {/* Section 1: Facility & Borrower Summary Cards */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-3 flex items-center gap-1.5">
                            <User size={14} /> 1. Borrower & Loan Account Particulars
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                                <span className="text-[11px] text-slate-400 block font-medium">Borrower Full Name</span>
                                <span className="text-sm font-semibold text-white mt-1 block truncate">{loan.borrowerName || "Me"}</span>
                                <span className="text-xs text-slate-500 block truncate mt-0.5">{loan.borrowerEmail || "—"}</span>
                            </div>

                            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                                <span className="text-[11px] text-slate-400 block font-medium">Loan Scheme / Product</span>
                                <span className="text-sm font-semibold text-white mt-1 block truncate">{loan.loanTypeName || "Consumer Credit"}</span>
                                <span className="text-xs text-emerald-400 font-medium block mt-0.5">Active & Sanctioned</span>
                            </div>

                            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                                <span className="text-[11px] text-slate-400 block font-medium">Sanctioned Principal</span>
                                <span className="text-sm font-bold text-amber-400 mt-1 block tabular-nums">PKR {formatCurrency(loan.principalAmount)}</span>
                                <span className="text-xs text-slate-400 block mt-0.5">APR: {loan.interestRate}% Fixed</span>
                            </div>

                            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                                <span className="text-[11px] text-slate-400 block font-medium">Total Repayment Obligation</span>
                                <span className="text-sm font-bold text-white mt-1 block tabular-nums">PKR {formatCurrency(loan.totalPayableAmount)}</span>
                                <span className="text-xs text-slate-400 block mt-0.5">{loan.termMonths} Months (~PKR {formatCurrency(monthlyInstallment)}/mo)</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Statutory Terms, Grace Period & Penalty Clause */}
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-5 space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                            <Building2 size={14} /> 2. Statutory Repayment Terms & Overdue Surcharge Clause
                        </h4>
                        <div className="text-xs leading-relaxed text-slate-300 space-y-2.5">
                            <p>
                                <strong className="text-white">A. Amortization & Installment Due Dates:</strong> The Borrower agrees to repay the total sanctioned obligation in consecutive monthly installments as outlined in the Amortization Schedule below. Each installment must be remitted on or before the due date specified.
                            </p>
                            <p>
                                <strong className="text-white">B. Grace Period & Late Penalty Surcharge:</strong> A mandatory grace period of seven (7) calendar days is granted from the installment due date. Any installment remaining unpaid past this 7-day grace period will automatically attract an overdue surcharge fee of <span className="text-amber-300 font-bold">2.0% per month</span> calculated on the outstanding installment balance until settled in full.
                            </p>
                            <p>
                                <strong className="text-white">C. Acceleration & Default Recourse:</strong> Failure to service installments for two (2) consecutive billing cycles shall constitute an Event of Default, empowering LMS Capital Banking Corp to accelerate the full loan liability and proceed with recovery enforcement against the Borrower and any registered Guarantor(s).
                            </p>
                        </div>
                    </div>

                    {/* Section 3: Complete Amortization Schedule Table */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                                <Calendar size={14} /> 3. Amortization & Repayment Schedule Table
                            </h4>
                            <span className="text-xs font-medium text-slate-400">
                                {schedule.length} Installment Cycle(s)
                            </span>
                        </div>

                        {/* Contained, Scrollable Table with Sticky Header */}
                        <div className="max-h-[380px] overflow-y-auto overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 custom-scrollbar">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-[#0f172a] z-10 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold min-w-[70px]">Inst #</th>
                                        <th className="px-4 py-3 font-semibold min-w-[110px]">Due Date</th>
                                        <th className="px-4 py-3 font-semibold text-right min-w-[120px]">Principal</th>
                                        <th className="px-4 py-3 font-semibold text-right min-w-[110px]">Interest</th>
                                        <th className="px-4 py-3 font-semibold text-right min-w-[130px]">Total Due (PKR)</th>
                                        <th className="px-4 py-3 font-semibold text-right min-w-[110px]">Paid</th>
                                        <th className="px-4 py-3 font-semibold text-center min-w-[100px]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 text-slate-200 tabular-nums font-sans">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                                                Loading amortization schedule...
                                            </td>
                                        </tr>
                                    ) : schedule.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-6 text-center text-slate-400 font-sans">
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
                                                <tr key={item.id ?? idx} className="hover:bg-slate-900/60 transition-colors">
                                                    <td className="px-4 py-2.5 font-semibold text-white">#{instNum}</td>
                                                    <td className="px-4 py-2.5 text-slate-300">
                                                        {due ? new Date(due).toLocaleDateString() : "—"}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right text-slate-300">{formatCurrency(prin)}</td>
                                                    <td className="px-4 py-2.5 text-right text-slate-400">{formatCurrency(intD)}</td>
                                                    <td className="px-4 py-2.5 text-right font-bold text-white">{formatCurrency(tot)}</td>
                                                    <td className="px-4 py-2.5 text-right text-emerald-400 font-medium">{formatCurrency(paid)}</td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                                            isPaid
                                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
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
                    <div className="pt-6 border-t border-slate-800">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                            {/* Bank Officer Signatory */}
                            <div className="space-y-2">
                                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                                    Authorized Bank Sanctioning Authority:
                                </span>
                                <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-4 space-y-2">
                                    {/* Stylized Signature */}
                                    <div className="font-serif italic text-2xl text-amber-400 tracking-wider">
                                        Muhammad Ovais
                                    </div>
                                    <div className="border-t border-slate-800 pt-2 text-xs">
                                        <p className="font-semibold text-white">Muhammad Ovais</p>
                                        <p className="text-[11px] text-slate-400">Senior Credit Underwriting & Risk Officer</p>
                                        <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                                            <CheckCircle size={12} /> Digitally Signed & Authenticated
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Borrower Acceptance */}
                            <div className="space-y-2">
                                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                                    Borrower Acknowledgement & Acceptance:
                                </span>
                                <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-4 space-y-2">
                                    <div className="font-serif italic text-2xl text-slate-300 tracking-wider">
                                        {loan.borrowerName || "Borrower"}
                                    </div>
                                    <div className="border-t border-slate-800 pt-2 text-xs">
                                        <p className="font-semibold text-white">{loan.borrowerName || "Customer"}</p>
                                        <p className="text-[11px] text-slate-400">Accepted Terms & Penalty Conditions</p>
                                        <p className="text-[10px] text-slate-500 mt-1">
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
