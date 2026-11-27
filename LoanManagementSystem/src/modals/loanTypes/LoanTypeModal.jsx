import { useEffect, useState } from "react";
import { Modal, Button, Input, Textarea, Form } from "../../components/common";

const initialFormData = {
    name: "",
    code: "",
    description: "",
    minAmount: "",
    maxAmount: "",
    interestRate: "",
    minTermMonths: "",
    maxTermMonths: "",
    requiresGuarantor: false,
    isActive: true
};

export default function LoanTypeModal({
    isOpen,
    onClose,
    onSubmit,
    selectedLoanType
}) {
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (selectedLoanType) {
            setFormData({
                name: selectedLoanType.name || "",
                code: selectedLoanType.code || "",
                description: selectedLoanType.description || "",
                minAmount: selectedLoanType.minAmount ?? "",
                maxAmount: selectedLoanType.maxAmount ?? "",
                interestRate: selectedLoanType.interestRate ?? "",
                minTermMonths: selectedLoanType.minTermMonths ?? "",
                maxTermMonths: selectedLoanType.maxTermMonths ?? "",
                requiresGuarantor: selectedLoanType.requiresGuarantor ?? false,
                isActive: selectedLoanType.isActive ?? true
            });
        } else {
            setFormData(initialFormData);
        }
        setError("");
    }, [selectedLoanType, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const minAmount = Number(formData.minAmount);
        const maxAmount = Number(formData.maxAmount);
        const interestRate = Number(formData.interestRate);
        const minTermMonths = Number(formData.minTermMonths);
        const maxTermMonths = Number(formData.maxTermMonths);

        if (!formData.name.trim() || !formData.code.trim()) {
            setError("Loan type name and code are required.");
            return;
        }

        if (
            formData.minAmount === "" ||
            formData.maxAmount === "" ||
            formData.interestRate === "" ||
            formData.minTermMonths === "" ||
            formData.maxTermMonths === ""
        ) {
            setError("Please fill in all required numeric fields.");
            return;
        }

        if (minAmount < 0 || maxAmount < 0 || maxAmount > 100000000 || minAmount > 100000000) {
            setError("Amounts must be between 0 and 100,000,000.");
            return;
        }

        if (minAmount > maxAmount) {
            setError("Minimum amount cannot exceed maximum amount.");
            return;
        }

        if (interestRate < 0 || interestRate > 100) {
            setError("Interest rate must be between 0 and 100.");
            return;
        }

        if (minTermMonths < 1 || maxTermMonths > 360 || minTermMonths > 360 || maxTermMonths < 1) {
            setError("Loan terms must be between 1 and 360 months.");
            return;
        }

        if (minTermMonths > maxTermMonths) {
            setError("Minimum term cannot exceed maximum term.");
            return;
        }

        const loanTypeData = {
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase(),
            description: formData.description.trim() || null,
            minAmount,
            maxAmount,
            interestRate,
            minTermMonths,
            maxTermMonths,
            requiresGuarantor: formData.requiresGuarantor,
            isActive: formData.isActive
        };

        try {
            setLoading(true);
            await onSubmit(loanTypeData);
            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save loan type. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={selectedLoanType ? "Edit Loan Type" : "Add New Loan Type"}
            subtitle={
                selectedLoanType
                    ? "Update loan type parameters and interest rules."
                    : "Configure a new loan product with limits and interest."
            }
            maxWidth="2xl"
        >
            <Form onSubmit={handleSubmit} error={error}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Loan Type Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Personal Loan"
                        maxLength={150}
                        required
                    />

                    <Input
                        label="Loan Type Code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="e.g. PERSONAL_LOAN"
                        maxLength={50}
                        required
                    />
                </div>

                <Textarea
                    label="Description (Optional)"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter loan type description..."
                    rows={3}
                    maxLength={1000}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Minimum Amount (PKR)"
                        type="number"
                        name="minAmount"
                        value={formData.minAmount}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                    />

                    <Input
                        label="Maximum Amount (PKR)"
                        type="number"
                        name="maxAmount"
                        value={formData.maxAmount}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        placeholder="100000.00"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Input
                        label="Interest Rate (%)"
                        type="number"
                        name="interestRate"
                        value={formData.interestRate}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="12.5"
                        required
                    />

                    <Input
                        label="Min Term (Months)"
                        type="number"
                        name="minTermMonths"
                        value={formData.minTermMonths}
                        onChange={handleChange}
                        min="1"
                        max="360"
                        placeholder="6"
                        required
                    />

                    <Input
                        label="Max Term (Months)"
                        type="number"
                        name="maxTermMonths"
                        value={formData.maxTermMonths}
                        onChange={handleChange}
                        min="1"
                        max="360"
                        placeholder="36"
                        required
                    />
                </div>

                <div className="flex flex-col gap-3 rounded-xl border border-pink-100 bg-pink-50/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="requiresGuarantor"
                            checked={formData.requiresGuarantor}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-zinc-700 bg-pink-50/50 text-pink-500 focus:ring-pink-500/20"
                        />
                        <div>
                            <span className="text-sm font-medium text-zinc-900">Requires Guarantor</span>
                            <p className="text-xs text-zinc-500">Applications must include guarantor details</p>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-zinc-700 bg-pink-50/50 text-pink-500 focus:ring-pink-500/20"
                        />
                        <div>
                            <span className="text-sm font-medium text-zinc-900">Active Status</span>
                            <p className="text-xs text-zinc-500">Visible for new customer applications</p>
                        </div>
                    </label>
                </div>

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
                        loading={loading}
                        loadingText={selectedLoanType ? "Updating..." : "Creating..."}
                    >
                        {selectedLoanType ? "Update Loan Type" : "Create Loan Type"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
