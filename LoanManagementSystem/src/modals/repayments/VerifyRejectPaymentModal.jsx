import { useEffect, useState } from "react";
import { Modal, Button, Textarea, Form } from "../../components/common";

const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

export default function VerifyRejectPaymentModal({
    isOpen,
    type = "verify", // "verify" | "reject"
    payment,
    onClose,
    onSubmit,
    loading,
    error
}) {
    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        if (isOpen) {
            setRemarks("");
        }
    }, [isOpen]);

    if (!isOpen || !payment) return null;

    const isVerify = type === "verify";

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit({
            remarks: remarks.trim() || null
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isVerify ? "Verify Repayment" : "Reject Repayment"}
            subtitle={`Reference #${payment.paymentReference} — PKR ${formatAmount(payment.amount)}`}
            maxWidth="lg"
        >
            <Form onSubmit={handleSubmit} error={error}>
                <div className={`p-4 rounded-xl border text-sm space-y-1 ${
                    isVerify
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border-red-500/20 bg-red-500/10 text-red-300"
                }`}>
                    <p className="font-semibold text-white">
                        {isVerify
                            ? "Confirm payment verification and ledger update?"
                            : "Are you sure you want to reject this payment submission?"}
                    </p>
                    <p>Borrower: {payment.borrowerName || "Customer"}</p>
                    <p>Method: {payment.paymentMethod || "Bank Transfer"}</p>
                    <p className="text-xs opacity-80 pt-1">
                        {isVerify
                            ? "Verification will immediately allocate to interest and principal, update outstanding balance, and advance the installment schedule."
                            : "The customer will be notified of the rejection reason."}
                    </p>
                </div>

                <Textarea
                    label={isVerify ? "Verification Remarks (Optional)" : "Rejection Reason *"}
                    name="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    placeholder={isVerify ? "Confirmed with bank statement..." : "Enter reason for rejecting this payment..."}
                    required={!isVerify}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
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
                        variant={isVerify ? "primary" : "danger"}
                        loading={loading}
                        loadingText={isVerify ? "Verifying..." : "Rejecting..."}
                    >
                        {isVerify ? "Confirm Verification" : "Confirm Rejection"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
