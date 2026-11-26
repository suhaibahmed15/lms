import { useEffect, useState } from "react";
import { Modal, Button, Input, Select, Form } from "../../components/common";

const initialForm = {
    category: "Application",
    name: "",
    key: "",
    sortOrder: 1,
    isActive: true
};

export default function StatusModal({
    isOpen,
    status,
    onClose,
    onSubmit,
    loading,
    error
}) {
    const [formData, setFormData] = useState(initialForm);
    const isEdit = Boolean(status);

    useEffect(() => {
        if (isOpen) {
            if (status) {
                setFormData({
                    category: status.category || "Application",
                    name: status.name || "",
                    key: status.key || "",
                    sortOrder: status.sortOrder ?? 1,
                    isActive: status.isActive ?? true
                });
            } else {
                setFormData(initialForm);
            }
        }
    }, [isOpen, status]);

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
        await onSubmit({
            category: formData.category,
            name: formData.name.trim(),
            key: formData.key.trim().toUpperCase(),
            sortOrder: Number(formData.sortOrder) || 1,
            isActive: formData.isActive
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Edit Status" : "Create Master Status"}
            subtitle="Configure workflow status identifiers across lifecycle categories."
            maxWidth="md"
        >
            <Form onSubmit={handleSubmit} error={error}>
                <Select
                    label="Status Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={[
                        { value: "Application", label: "Application" },
                        { value: "Loan", label: "Loan" },
                        { value: "Document", label: "Document" },
                        { value: "Guarantor", label: "Guarantor" },
                        { value: "Repayment", label: "Repayment" },
                        { value: "RepaymentSchedule", label: "Repayment Schedule" }
                    ]}
                    required
                />

                <Input
                    label="Status Display Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Under Review"
                    maxLength={100}
                    required
                />

                <Input
                    label="Status Key"
                    name="key"
                    value={formData.key}
                    onChange={handleChange}
                    placeholder="e.g. APPLICATION_UNDER_REVIEW"
                    maxLength={100}
                    required
                    helperText="Unique uppercase machine key used by workflow policies"
                />

                <Input
                    label="Display Sort Order"
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleChange}
                    min="1"
                    placeholder="1"
                    required
                />

                <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-pink-500 focus:ring-pink-500/20"
                        />
                        <span className="text-sm font-medium text-white">Active Status</span>
                    </label>
                </div>

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
                        loading={loading}
                        loadingText={isEdit ? "Updating..." : "Creating..."}
                    >
                        {isEdit ? "Update Status" : "Create Status"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
