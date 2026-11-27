import { useState } from "react";
import { Modal, Button } from "../../components/common";
import LoanAgreementPreviewModal from "./LoanAgreementPreviewModal";
import { FileText } from "lucide-react";

const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

export default function LoanDetailsModal({
    isOpen,
    loan,
    onClose
}) {
    const [isAgreementOpen, setIsAgreementOpen] = useState(false);

    if (!isOpen || !loan) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Loan #${loan.loanNumber}`}
            subtitle={`Borrower: ${loan.borrowerName || "Customer"}`}
            maxWidth="2xl"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-700/80 bg-slate-900/60 p-4 text-sm">
                    <div>
                        <span className="text-xs text-zinc-500">Loan Status</span>
                        <p className="font-semibold text-zinc-900">{loan.statusName || loan.statusKey}</p>
                    </div>
                    <div>
                        <span className="text-xs text-zinc-500">Disbursed Date</span>
                        <p className="font-semibold text-zinc-900">
                            {loan.disbursedAt ? new Date(loan.disbursedAt).toLocaleDateString() : "—"}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-zinc-500">Principal Amount</span>
                        <p className="font-bold text-lg text-zinc-900">PKR {formatAmount(loan.principalAmount)}</p>
                    </div>
                    <div>
                        <span className="text-xs text-zinc-500">Outstanding Balance</span>
                        <p className="font-bold text-lg text-pink-400">PKR {formatAmount(loan.outstandingBalance)}</p>
                    </div>
                    <div>
                        <span className="text-xs text-zinc-500">Interest Rate</span>
                        <p className="font-semibold text-zinc-900">{loan.interestRate}% Annual</p>
                    </div>
                    <div>
                        <span className="text-xs text-zinc-500">Loan Term</span>
                        <p className="font-semibold text-zinc-900">{loan.termMonths} Months</p>
                    </div>
                    <div>
                        <span className="text-xs text-zinc-500">Total Payable</span>
                        <p className="font-semibold text-zinc-900">PKR {formatAmount(loan.totalPayableAmount)}</p>
                    </div>
                    <div>
                        <span className="text-xs text-zinc-500">Loan Scheme</span>
                        <p className="font-semibold text-zinc-900">{loan.loanTypeName || "Consumer Credit"}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-700/80">
                    <Button
                        type="button"
                        variant="primary"
                        icon={FileText}
                        onClick={() => setIsAgreementOpen(true)}
                        className="bg-pink-600 hover:bg-pink-500 text-zinc-900"
                    >
                        View & Download Agreement
                    </Button>
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>

                <LoanAgreementPreviewModal
                    isOpen={isAgreementOpen}
                    loan={loan}
                    onClose={() => setIsAgreementOpen(false)}
                />
            </div>
        </Modal>
    );
}
