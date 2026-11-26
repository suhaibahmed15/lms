import { useEffect, useState } from "react";
import { Modal, Button, Input, Select, Textarea, Form } from "../../components/common";
import { UserCheck, ShieldAlert, Sparkles } from "lucide-react";

const initialForm = {
    loanTypeId: "",
    requestedAmount: "",
    requestedTermMonths: "",
    purpose: "",
    statusKey: "APPLICATION_UNDER_REVIEW",
    remarks: "",

    // Guarantor Details (if loan scheme requires guarantor)
    guarantorFullName: "",
    guarantorNationalId: "",
    guarantorPhoneNumber: "",
    guarantorEmail: "",
    guarantorRelationship: "",
    guarantorAddress: ""
};

export default function LoanApplicationModal({
    isOpen,
    mode,
    application,
    loanTypes = [],
    onClose,
    onSubmit,
    loading,
    error
}) {
    const [formData, setFormData] = useState(initialForm);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        setFormError("");
        if (mode === "review") {
            setFormData({
                ...initialForm,
                statusKey: "APPLICATION_UNDER_REVIEW"
            });
        } else {
            setFormData(initialForm);
        }
    }, [mode, application, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        setFormError("");
    };

    const selectedLoanType = loanTypes.find(
        (item) => item.id === Number(formData.loanTypeId)
    );

    const requiresGuarantor = Boolean(selectedLoanType?.requiresGuarantor);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (mode === "create") {
            if (!formData.loanTypeId) {
                setFormError("Please select a loan product.");
                return;
            }
            const amount = Number(formData.requestedAmount);
            const term = Number(formData.requestedTermMonths);

            if (amount <= 0 || term <= 0) {
                setFormError("Please enter valid requested amount and term.");
                return;
            }

            // If loan requires guarantor, validate guarantor fields
            let guarantorData = null;
            if (requiresGuarantor) {
                if (!formData.guarantorFullName.trim()) {
                    setFormError("Guarantor Full Name is required for this loan scheme.");
                    return;
                }
                if (!formData.guarantorPhoneNumber.trim()) {
                    setFormError("Guarantor Phone Number is required.");
                    return;
                }

                guarantorData = {
                    fullName: formData.guarantorFullName.trim(),
                    nationalIdNumber: formData.guarantorNationalId.trim() || null,
                    phoneNumber: formData.guarantorPhoneNumber.trim(),
                    email: formData.guarantorEmail.trim() || null,
                    relationshipToApplicant: formData.guarantorRelationship.trim() || null,
                    address: formData.guarantorAddress.trim() || null
                };
            }

            await onSubmit({
                loanTypeId: Number(formData.loanTypeId),
                requestedAmount: amount,
                requestedTermMonths: term,
                purpose: formData.purpose.trim() || null,
                requiresGuarantor,
                guarantor: guarantorData
            });
            return;
        }

        if (!formData.remarks.trim()) {
            setFormError("Review remarks are required.");
            return;
        }

        await onSubmit({
            statusKey: formData.statusKey,
            remarks: formData.remarks.trim()
        });
    };

    const title = mode === "create" ? "Apply for a Credit Facility" : "Review Loan Underwriting";
    const subtitle = mode === "create"
        ? "Submit your loan application and required credit particulars."
        : `Application: #${application?.applicationNumber || ""}`;

    const loanTypeOptions = loanTypes.map((lt) => ({
        value: lt.id,
        label: `${lt.name} (${lt.code})${lt.requiresGuarantor ? " [Guarantor Required]" : ""}`
    }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={subtitle}
            maxWidth="2xl"
        >
            <Form onSubmit={handleSubmit} error={error || formError}>
                {mode === "create" ? (
                    <>
                        <Select
                            label="Loan Product Scheme"
                            name="loanTypeId"
                            value={formData.loanTypeId}
                            onChange={handleChange}
                            options={loanTypeOptions}
                            placeholder="Select loan scheme"
                            required
                        />

                        {selectedLoanType && (
                            <div className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4 text-xs text-slate-300 space-y-1.5">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                                    <span className="font-semibold text-white text-sm">
                                        {selectedLoanType.name}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                        selectedLoanType.requiresGuarantor
                                            ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    }`}>
                                        {selectedLoanType.requiresGuarantor ? "Guarantor Mandatory" : "No Guarantor Needed"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-slate-400">
                                    <p>
                                        Amount: <strong className="text-white block">PKR {Number(selectedLoanType.minAmount).toLocaleString()} - {Number(selectedLoanType.maxAmount).toLocaleString()}</strong>
                                    </p>
                                    <p>
                                        Term: <strong className="text-white block">{selectedLoanType.minTermMonths} - {selectedLoanType.maxTermMonths} mos</strong>
                                    </p>
                                    <p>
                                        Interest Rate: <strong className="text-pink-400 block">{selectedLoanType.interestRate}% Fixed APR</strong>
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                label="Requested Amount (PKR)"
                                type="number"
                                name="requestedAmount"
                                value={formData.requestedAmount}
                                onChange={handleChange}
                                min={selectedLoanType?.minAmount ?? 0}
                                max={selectedLoanType?.maxAmount}
                                step="0.01"
                                placeholder="e.g. 500000"
                                required
                            />

                            <Input
                                label="Requested Term (Months)"
                                type="number"
                                name="requestedTermMonths"
                                value={formData.requestedTermMonths}
                                onChange={handleChange}
                                min={selectedLoanType?.minTermMonths ?? 1}
                                max={selectedLoanType?.maxTermMonths ?? 360}
                                step="1"
                                placeholder="e.g. 12"
                                required
                            />
                        </div>

                        <Textarea
                            label="Purpose of Facility"
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleChange}
                            rows={2}
                            placeholder="State the commercial or personal use of loan proceeds..."
                        />

                        {/* Guarantor Section when Loan Product requires one */}
                        {requiresGuarantor && (
                            <div className="rounded-xl border border-pink-500/30 bg-pink-500/[0.04] p-4.5 space-y-4">
                                <div className="flex items-start gap-2.5 text-pink-300 border-b border-pink-500/20 pb-3">
                                    <ShieldAlert size={18} className="mt-0.5 shrink-0 text-pink-400" />
                                    <div>
                                        <h4 className="font-semibold text-sm text-white">
                                            Guarantor Particulars Required
                                        </h4>
                                        <p className="text-xs text-pink-200/80 mt-0.5">
                                            This loan scheme requires a verified guarantor. Please provide your guarantor's details below to ensure seamless underwriting approval.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                    <Input
                                        label="Guarantor Full Name *"
                                        name="guarantorFullName"
                                        value={formData.guarantorFullName}
                                        onChange={handleChange}
                                        placeholder="Full legal name"
                                        required
                                    />

                                    <Input
                                        label="National ID / CNIC"
                                        name="guarantorNationalId"
                                        value={formData.guarantorNationalId}
                                        onChange={handleChange}
                                        placeholder="e.g. 42101-1234567-1"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                    <Input
                                        label="Guarantor Phone Number *"
                                        name="guarantorPhoneNumber"
                                        value={formData.guarantorPhoneNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. +92 300 1234567"
                                        required
                                    />

                                    <Input
                                        label="Guarantor Email"
                                        type="email"
                                        name="guarantorEmail"
                                        value={formData.guarantorEmail}
                                        onChange={handleChange}
                                        placeholder="guarantor@domain.com"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                    <Input
                                        label="Relationship to Applicant"
                                        name="guarantorRelationship"
                                        value={formData.guarantorRelationship}
                                        onChange={handleChange}
                                        placeholder="e.g. Sibling, Business Partner, Colleague"
                                    />

                                    <Input
                                        label="Residential / Office Address"
                                        name="guarantorAddress"
                                        value={formData.guarantorAddress}
                                        onChange={handleChange}
                                        placeholder="Full postal address"
                                    />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <Select
                            label="Underwriting Review Status"
                            name="statusKey"
                            value={formData.statusKey}
                            onChange={handleChange}
                            options={[
                                { value: "APPLICATION_UNDER_REVIEW", label: "Under Review / Credit Assessment" },
                                { value: "APPLICATION_DOCUMENTS_REQUIRED", label: "Documents / Collateral Required" }
                            ]}
                            required
                        />

                        <Textarea
                            label="Underwriting Assessment & Remarks *"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            rows={4}
                            maxLength={1000}
                            placeholder="Enter detailed assessment notes regarding applicant eligibility..."
                            required
                        />
                    </>
                )}

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
                        className="bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/20"
                    >
                        {mode === "create" ? "Submit Application" : "Submit Review"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
