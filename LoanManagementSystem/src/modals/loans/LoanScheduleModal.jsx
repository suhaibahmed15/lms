import { useEffect, useState } from "react";
import { Modal, Button } from "../../components/common";
import { getLoanSchedule } from "../../services/loanService";
import { generateRepaymentSchedule } from "../../services/repaymentService";
import LoanAgreementPreviewModal from "./LoanAgreementPreviewModal";
import { FileDown, Eye } from "lucide-react";

const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const getScheduleStatusBadge = (statusKey) => {
    const key = (statusKey || "").toUpperCase();
    if (key.includes("PAID") && !key.includes("PARTIAL")) {
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }
    if (key.includes("PARTIAL")) {
        return "bg-amber-50 text-amber-700 border border-amber-200";
    }
    if (key.includes("OVERDUE") || key.includes("DEFAULT")) {
        return "bg-red-50 text-red-600 border border-red-200";
    }
    return "bg-pink-50 text-pink-700 border border-pink-200";
};

export default function LoanScheduleModal({
    isOpen,
    loan,
    onClose
}) {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");
    const [showPreview, setShowPreview] = useState(false);

    const loadSchedule = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await getLoanSchedule(loan.id);
            const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
            setSchedule(list);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load repayment schedule.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && loan) {
            loadSchedule();
        } else {
            setSchedule([]);
        }
    }, [isOpen, loan]);

    const handleGenerate = async () => {
        if (!loan?.id) return;
        try {
            setGenerating(true);
            setError("");
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            await generateRepaymentSchedule(loan.id, {
                firstDueDate: nextMonth.toISOString()
            });
            await loadSchedule();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate schedule.");
        } finally {
            setGenerating(false);
        }
    };

    const handleDownloadAgreement = () => {
        if (!loan) return;
        generateLoanAgreementPdf(loan, schedule, {
            officerName: "Muhammad Ovais"
        });
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Amortization Schedule — Loan #${loan?.loanNumber || ""}`}
            subtitle={`Total Term: ${loan?.termMonths || 0} Months | Monthly Due: PKR ${formatAmount(loan?.monthlyInstallment)}`}
            maxWidth="4xl"
        >
            <div className="space-y-4">
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-500/10 p-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div className="max-h-[60vh] overflow-y-auto overflow-x-auto rounded-xl border border-pink-100">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-white text-xs uppercase tracking-wider text-zinc-500 border-b border-pink-100">
                            <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Due Date</th>
                                <th className="px-4 py-3">Principal (PKR)</th>
                                <th className="px-4 py-3">Interest (PKR)</th>
                                <th className="px-4 py-3">Total Due (PKR)</th>
                                <th className="px-4 py-3">Paid (PKR)</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pink-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-zinc-500">
                                        Loading amortization schedule...
                                    </td>
                                </tr>
                            ) : schedule.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-zinc-500">
                                        <p className="mb-3 text-zinc-500">No schedule installments found for this loan.</p>
                                        <Button
                                            size="sm"
                                            onClick={handleGenerate}
                                            loading={generating}
                                            loadingText="Generating..."
                                        >
                                            Generate Amortization Schedule
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                schedule.map((item) => {
                                    const principal = item.principalDue ?? item.principalAmount ?? 0;
                                    const interest = item.interestDue ?? item.interestAmount ?? 0;
                                    const total = item.totalDue ?? item.totalAmount ?? (principal + interest);

                                    return (
                                        <tr key={item.id} className="transition hover:bg-pink-50/30">
                                            <td className="px-4 py-3 font-medium text-zinc-900">
                                                {item.installmentNumber}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-700">
                                                {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-700">
                                                {formatAmount(principal)}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-700">
                                                {formatAmount(interest)}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-zinc-900">
                                                {formatAmount(total)}
                                            </td>
                                            <td className="px-4 py-3 text-emerald-400 font-medium">
                                                {formatAmount(item.paidAmount || 0)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getScheduleStatusBadge(item.statusKey || item.statusName)}`}>
                                                    {item.statusName || item.statusKey || "Pending"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-pink-100">
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => setShowPreview(true)}
                        className="bg-pink-600 hover:bg-pink-500 text-zinc-900 flex items-center gap-2"
                    >
                        <Eye size={16} />
                        View & Download Loan Agreement
                    </Button>
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>

                <LoanAgreementPreviewModal
                    isOpen={showPreview}
                    loan={loan}
                    onClose={() => setShowPreview(false)}
                />
            </div>
        </Modal>
    );
}
