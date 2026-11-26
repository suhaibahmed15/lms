import { useEffect, useState, useCallback } from "react";
import { Modal, Button, Input, Select, Textarea, Form } from "../../components/common";
import { getLoanSchedule } from "../../services/loanService";
import { generateRepaymentSchedule } from "../../services/repaymentService";
import { AlertCircle, RefreshCw, CheckCircle2, Wallet, Calendar, ArrowRight } from "lucide-react";

const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

export default function SubmitPaymentModal({
    isOpen,
    loans = [],
    onClose,
    onSubmit,
    loading,
    error
}) {
    const [loanId, setLoanId] = useState("");
    const [schedules, setSchedules] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [generatingSchedule, setGeneratingSchedule] = useState(false);
    const [repaymentScheduleId, setRepaymentScheduleId] = useState("");
    const [amount, setAmount] = useState("");
    const [paymentReference, setPaymentReference] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
    const [remarks, setRemarks] = useState("");
    const [fetchError, setFetchError] = useState("");

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setFetchError("");
            setSchedules([]);
            setRepaymentScheduleId("");
            setAmount("");
            setPaymentReference("");
            setPaymentMethod("Bank Transfer");
            setRemarks("");

            if (loans && loans.length > 0) {
                setLoanId(String(loans[0].id));
            } else {
                setLoanId("");
            }
        }
    }, [isOpen, loans]);

    // Normalize schedule items to guarantee valid numbers and keys
    const normalizeSchedule = (rawList) => {
        return (rawList || []).map((s, idx) => {
            const id = s.id ?? s.Id ?? idx + 1;
            const installmentNumber = s.installmentNumber ?? s.InstallmentNumber ?? (idx + 1);
            const dueDate = s.dueDate ?? s.DueDate ?? null;
            const totalDue = Number(s.totalDue ?? s.TotalDue ?? s.totalAmount ?? s.TotalAmount ?? 0);
            const paidAmount = Number(s.paidAmount ?? s.PaidAmount ?? 0);
            const statusKey = (s.statusKey ?? s.StatusKey ?? s.statusName ?? s.StatusName ?? "").toUpperCase();
            const statusName = s.statusName ?? s.StatusName ?? (statusKey.includes("PAID") ? "Paid" : "Pending");
            const remaining = Math.max(0, totalDue - paidAmount);

            return {
                id,
                installmentNumber,
                dueDate,
                totalDue,
                paidAmount,
                remaining,
                statusKey,
                statusName,
                isSettled: (statusKey.includes("PAID") && !statusKey.includes("PARTIAL")) || (totalDue > 0 && remaining <= 0)
            };
        });
    };

    const fetchScheduleForLoan = useCallback(async (selectedId) => {
        if (!selectedId) {
            setSchedules([]);
            setRepaymentScheduleId("");
            return;
        }

        try {
            setScheduleLoading(true);
            setFetchError("");
            const res = await getLoanSchedule(selectedId);
            const rawList = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res)
                    ? res
                    : Array.isArray(res?.data?.data)
                        ? res.data.data
                        : [];
            const normalized = normalizeSchedule(rawList);

            // Filter for pending/payable installments
            const payable = normalized.filter((s) => !s.isSettled);
            const activeList = payable.length > 0 ? payable : normalized;
            setSchedules(activeList);

            if (activeList.length > 0) {
                // Select the first unpaid installment
                const firstPending = payable.length > 0 ? payable[0] : activeList[0];
                setRepaymentScheduleId(String(firstPending.id));
                setAmount(String(firstPending.remaining > 0 ? firstPending.remaining : firstPending.totalDue));
            } else {
                setRepaymentScheduleId("");
                setAmount("");
            }
        } catch (err) {
            console.error("Failed to fetch repayment schedule:", err);
            setSchedules([]);
            setRepaymentScheduleId("");
            setFetchError("Unable to fetch repayment schedule from the server.");
        } finally {
            setScheduleLoading(false);
        }
    }, []);

    useEffect(() => {
        if (loanId) {
            fetchScheduleForLoan(loanId);
        }
    }, [loanId, fetchScheduleForLoan]);

    const handleInitializeSchedule = async () => {
        if (!loanId) return;
        try {
            setGeneratingSchedule(true);
            setFetchError("");
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            await generateRepaymentSchedule(Number(loanId), {
                firstDueDate: nextMonth.toISOString()
            });
            await fetchScheduleForLoan(loanId);
        } catch (err) {
            setFetchError(err.response?.data?.message || "Failed to initialize amortization schedule.");
        } finally {
            setGeneratingSchedule(false);
        }
    };

    const handleScheduleChange = (e) => {
        const schedId = e.target.value;
        setRepaymentScheduleId(schedId);
        const selected = schedules.find((s) => String(s.id) === schedId);
        if (selected) {
            const dueAmt = selected.remaining > 0 ? selected.remaining : selected.totalDue;
            setAmount(String(dueAmt));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const amt = Number(amount);
        if (!repaymentScheduleId || amt <= 0 || !paymentReference.trim()) return;

        await onSubmit({
            repaymentScheduleId: Number(repaymentScheduleId),
            amount: amt,
            paymentReference: paymentReference.trim(),
            paymentMethod,
            remarks: remarks.trim() || null
        });
    };

    const selectedLoan = loans.find((l) => String(l.id) === String(loanId));

    const loanOptions = loans.map((l) => ({
        value: String(l.id),
        label: `Loan #${l.loanNumber} — ${l.borrowerName || "Me"} (Bal: PKR ${formatAmount(l.outstandingBalance)})`
    }));

    const scheduleOptions = schedules.map((s) => {
        const remainingText = s.remaining > 0 ? `Due: PKR ${formatAmount(s.remaining)}` : "Settled";
        const dateStr = s.dueDate ? new Date(s.dueDate).toLocaleDateString() : "—";
        return {
            value: String(s.id),
            label: `Installment #${s.installmentNumber} — Due: ${dateStr} (${remainingText})`
        };
    });

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Submit Loan Repayment"
            subtitle="Record an installment payment for official bank verification."
            maxWidth="2xl"
        >
            <Form onSubmit={handleSubmit} error={error || fetchError}>
                {/* Active Loan Selection */}
                <Select
                    label="Select Active Loan"
                    name="loanId"
                    value={loanId}
                    onChange={(e) => setLoanId(e.target.value)}
                    options={loanOptions}
                    placeholder="Choose an active loan"
                    required
                />

                {/* Selected Loan Particulars Card */}
                {selectedLoan && (
                    <div className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4 text-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-300">
                            <span className="font-semibold text-white flex items-center gap-1.5">
                                <Wallet size={14} className="text-pink-400" />
                                Account: {selectedLoan.loanNumber}
                            </span>
                            <span className="text-emerald-400 font-medium">
                                Active Facility
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-slate-400">
                            <div>
                                <span>Borrower:</span>
                                <strong className="block text-slate-200">{selectedLoan.borrowerName || "Me"}</strong>
                            </div>
                            <div>
                                <span>Outstanding Balance:</span>
                                <strong className="block text-pink-400">PKR {formatAmount(selectedLoan.outstandingBalance)}</strong>
                            </div>
                            <div>
                                <span>Sanctioned Principal:</span>
                                <strong className="block text-slate-200">PKR {formatAmount(selectedLoan.principalAmount)}</strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* Schedule Status & Installment Selector */}
                {loanId && !scheduleLoading && schedules.length === 0 ? (
                    <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 space-y-3">
                        <div className="flex items-start gap-3 text-pink-300">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <p className="font-semibold text-sm">Amortization Schedule Not Initiated</p>
                                <p className="text-xs text-pink-200/80 leading-relaxed">
                                    This active loan has not yet had its installment schedule initialized. Initialize the schedule to generate the monthly installments and proceed with recording payments.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end pt-1">
                            <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                icon={RefreshCw}
                                loading={generatingSchedule}
                                loadingText="Generating..."
                                onClick={handleInitializeSchedule}
                                className="bg-pink-600 hover:bg-pink-500 text-white"
                            >
                                Initialize Installment Schedule
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Select
                        label="Select Installment Due"
                        name="repaymentScheduleId"
                        value={repaymentScheduleId}
                        onChange={handleScheduleChange}
                        options={scheduleOptions}
                        placeholder={
                            !loanId
                                ? "Select an active loan first"
                                : scheduleLoading
                                ? "Loading installments..."
                                : "Choose an installment"
                        }
                        required
                        disabled={!loanId || scheduleLoading || schedules.length === 0}
                        helperText={
                            schedules.length > 0 && repaymentScheduleId
                                ? "Installment amount auto-calculated based on unpaid balance."
                                : undefined
                        }
                    />
                )}

                {/* Payment Amount & Method */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Payment Amount (PKR)"
                        type="number"
                        name="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="0.01"
                        min="1"
                        placeholder="0.00"
                        required
                        helperText={selectedLoan ? `Max payable: PKR ${formatAmount(selectedLoan.outstandingBalance)}` : undefined}
                    />

                    <Select
                        label="Payment Method"
                        name="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        options={[
                            { value: "Bank Transfer", label: "Bank Transfer / IBFT" },
                            { value: "Cash Deposit", label: "Cash Deposit at Branch" },
                            { value: "Online Payment", label: "Online Card / Mobile Wallet" },
                            { value: "Cheque", label: "Cheque Clearing" }
                        ]}
                        required
                    />
                </div>

                {/* Reference ID */}
                <Input
                    label="Payment Reference / Transaction ID"
                    name="paymentReference"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g. TRX-20261125-8940 or Bank Slip #"
                    maxLength={100}
                    required
                    helperText="Enter the unique receipt reference or online transaction ID"
                />

                {/* Remarks */}
                <Textarea
                    label="Notes / Remarks (Optional)"
                    name="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={2}
                    placeholder="e.g. Transferred via HBL Raast / Account deposit slip attached..."
                />

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/80">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={loading}
                        loadingText="Submitting..."
                        disabled={!repaymentScheduleId || schedules.length === 0}
                        className="bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/20"
                    >
                        Submit Payment for Verification
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
