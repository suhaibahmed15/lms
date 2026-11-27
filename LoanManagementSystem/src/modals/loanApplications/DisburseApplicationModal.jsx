import { useEffect, useState } from "react";
import { Modal, Button, Input, Form } from "../../components/common";

export default function DisburseApplicationModal({
    isOpen,
    application,
    onClose,
    onSubmit,
    loading,
    error
}) {
    const [interestRate, setInterestRate] = useState("");

    useEffect(() => {
        if (isOpen && application) {
            setInterestRate(application.interestRate ?? "");
        }
    }, [isOpen, application]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const rate = Number(interestRate);
        if (isNaN(rate) || rate < 0) return;

        await onSubmit({
            interestRate: rate
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Disburse Loan"
            subtitle={`Disburse approved Application #${application?.applicationNumber || ""}`}
            maxWidth="md"
        >
            <Form onSubmit={handleSubmit} error={error}>
                <div className="p-4 rounded-xl border border-pink-200 bg-blue-500/10 text-sm text-blue-300 space-y-1">
                    <p className="font-semibold text-zinc-900">Disbursement Summary</p>
                    <p>Borrower: {application?.applicantName}</p>
                    <p>Amount: PKR {Number(application?.requestedAmount || 0).toLocaleString()}</p>
                    <p>Term: {application?.requestedTermMonths} months</p>
                </div>

                <Input
                    label="Annual Interest Rate (%)"
                    type="number"
                    name="interestRate"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    step="0.01"
                    min="0"
                    placeholder="e.g. 12.5"
                    required
                    helperText="This rate will calculate the amortization schedule and monthly installments."
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-pink-100">
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
                        variant="success"
                        loading={loading}
                        loadingText="Disbursing..."
                    >
                        Confirm Disbursement
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
