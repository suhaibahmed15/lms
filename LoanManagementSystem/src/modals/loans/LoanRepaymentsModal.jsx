import { useEffect, useState } from "react";
import { Modal, Button } from "../../components/common";
import { getLoanRepayments } from "../../services/loanService";

const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const getRepaymentBadge = (statusKey) => {
    switch (statusKey) {
        case "REPAYMENT_VERIFIED":
            return "bg-emerald-50 text-emerald-700 border border-emerald-200";
        case "REPAYMENT_REJECTED":
            return "bg-red-50 text-red-600 border border-red-200";
        case "REPAYMENT_PENDING":
        default:
            return "bg-amber-50 text-amber-700 border border-amber-200";
    }
};

export default function LoanRepaymentsModal({
    isOpen,
    loan,
    onClose
}) {
    const [repayments, setRepayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen && loan) {
            const loadRepayments = async () => {
                try {
                    setLoading(true);
                    setError("");
                    const res = await getLoanRepayments(loan.id);
                    const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
                    setRepayments(list);
                } catch (err) {
                    setError(err.response?.data?.message || "Unable to load repayment history.");
                } finally {
                    setLoading(false);
                }
            };
            loadRepayments();
        } else {
            setRepayments([]);
        }
    }, [isOpen, loan]);

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Payment History — Loan #${loan?.loanNumber || ""}`}
            subtitle="All customer payment submissions and verification status for this loan."
            maxWidth="3xl"
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
                                <th className="px-4 py-3">Reference #</th>
                                <th className="px-4 py-3">Amount (PKR)</th>
                                <th className="px-4 py-3">Method</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-pink-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                                        Loading repayments...
                                    </td>
                                </tr>
                            ) : repayments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                                        No repayments submitted for this loan yet.
                                    </td>
                                </tr>
                            ) : (
                                repayments.map((item) => (
                                    <tr key={item.id} className="transition hover:bg-pink-50/30">
                                        <td className="px-4 py-3 font-mono font-medium text-zinc-900">
                                            {item.paymentReference || "—"}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-emerald-400">
                                            {formatAmount(item.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-700">
                                            {item.paymentMethod || "Bank Transfer"}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-500 text-xs">
                                            {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getRepaymentBadge(item.statusKey)}`}>
                                                {item.statusName || item.statusKey}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-500 text-xs">
                                            {item.remarks || "—"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end pt-4 border-t border-pink-100">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
