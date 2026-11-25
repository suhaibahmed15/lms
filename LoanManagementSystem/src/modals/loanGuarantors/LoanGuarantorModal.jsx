import { useEffect, useState } from "react";
import { Modal, Button, Input, Form } from "../../components/common";

const initialForm = {
    FullName: "",
    NationalIdNumber: "",
    PhoneNumber: "",
    Email: "",
    RelationshipToApplicant: "",
    Address: "",
};

export default function LoanGuarantorModal({
    isOpen,
    onClose,
    onSubmit,
    guarantor,
    loading,
}) {
    const [formData, setFormData] = useState(initialForm);
    const [errors, setErrors] = useState({});

    const isEdit = Boolean(guarantor);

    useEffect(() => {
        if (isOpen) {
            if (guarantor) {
                setFormData({
                    FullName: guarantor.fullName || "",
                    NationalIdNumber: guarantor.nationalIdNumber || "",
                    PhoneNumber: guarantor.phoneNumber || "",
                    Email: guarantor.email || "",
                    RelationshipToApplicant: guarantor.relationshipToApplicant || "",
                    Address: guarantor.address || "",
                });
            } else {
                setFormData(initialForm);
            }
            setErrors({});
        }
    }, [isOpen, guarantor]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.FullName.trim()) {
            newErrors.FullName = "Full name is required.";
        } else if (formData.FullName.length > 150) {
            newErrors.FullName = "Maximum 150 characters allowed.";
        }

        if (!formData.PhoneNumber.trim()) {
            newErrors.PhoneNumber = "Phone number is required.";
        } else if (formData.PhoneNumber.length > 30) {
            newErrors.PhoneNumber = "Maximum 30 characters allowed.";
        }

        if (formData.NationalIdNumber.length > 50) {
            newErrors.NationalIdNumber = "Maximum 50 characters allowed.";
        }

        if (formData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
            newErrors.Email = "Enter a valid email address.";
        }

        if (formData.Email.length > 256) {
            newErrors.Email = "Maximum 256 characters allowed.";
        }

        if (formData.RelationshipToApplicant.length > 100) {
            newErrors.RelationshipToApplicant = "Maximum 100 characters allowed.";
        }

        if (formData.Address.length > 500) {
            newErrors.Address = "Maximum 500 characters allowed.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit(formData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Update Guarantor" : "Add Guarantor"}
            subtitle="Enter the guarantor's verified personal information."
            maxWidth="2xl"
        >
            <Form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Full Name"
                        name="FullName"
                        value={formData.FullName}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        maxLength={150}
                        required
                        error={errors.FullName}
                    />

                    <Input
                        label="Phone Number"
                        name="PhoneNumber"
                        value={formData.PhoneNumber}
                        onChange={handleChange}
                        placeholder="e.g. +92 300 1234567"
                        maxLength={30}
                        required
                        error={errors.PhoneNumber}
                    />

                    <Input
                        label="National ID / CNIC"
                        name="NationalIdNumber"
                        value={formData.NationalIdNumber}
                        onChange={handleChange}
                        placeholder="e.g. 42101-1234567-1"
                        maxLength={50}
                        error={errors.NationalIdNumber}
                    />

                    <Input
                        label="Email Address"
                        name="Email"
                        type="email"
                        value={formData.Email}
                        onChange={handleChange}
                        placeholder="guarantor@example.com"
                        maxLength={256}
                        error={errors.Email}
                    />

                    <Input
                        label="Relationship to Applicant"
                        name="RelationshipToApplicant"
                        value={formData.RelationshipToApplicant}
                        onChange={handleChange}
                        placeholder="e.g. Brother, Colleague, Business Partner"
                        maxLength={100}
                        error={errors.RelationshipToApplicant}
                        className="sm:col-span-2"
                    />

                    <Input
                        label="Residential Address"
                        name="Address"
                        value={formData.Address}
                        onChange={handleChange}
                        placeholder="Enter full address"
                        maxLength={500}
                        error={errors.Address}
                        className="sm:col-span-2"
                    />
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
                        loadingText={isEdit ? "Updating..." : "Adding..."}
                    >
                        {isEdit ? "Update Guarantor" : "Add Guarantor"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
