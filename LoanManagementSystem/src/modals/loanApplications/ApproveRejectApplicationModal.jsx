import { useEffect, useState } from "react";
import { Modal, Button, Textarea, Form } from "../../components/common";
import { ShieldAlert, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ApproveRejectApplicationModal({
    isOpen,
    type = "approve", // "approve" | "reject"
    application,
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

    if (!isOpen || !application) return null;

    const isApprove = type === "approve";
    const requiresGuarantor = Boolean(application.requiresGuarantor);
    const hasVerifiedGuarantor = Boolean(application.hasVerifiedGuarantor);

    // If approval is attempted but loan requires guarantor and none is verified, block approval
    const isApprovalBlocked = isApprove && requiresGuarantor && !hasVerifiedGuarantor;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isApprovalBlocked) return;

        await onSubmit({
            remarks: remarks.trim() || null
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isApprove ? "Sanction / Approve Loan Facility" : "Reject Loan Application"}
            subtitle={`Application #${application?.applicationNumber || ""} — ${application?.applicantName || ""}`}
            maxWidth="lg"
        >
            <Form onSubmit={handleSubmit} error={error}>
                {/* Facility Summary Badge */}
                <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    isApprove
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border-red-500/20 bg-red-500/10 text-red-300"
                }`}>
                    <p className="font-semibold text-sm text-white">
                        {isApprove
                            ? "Confirm Credit Facility Sanction"
                            : "Confirm Application Underwriting Rejection"}
                    </p>
                    <p className="text-slate-300">
                        Requested: <strong className="text-white">PKR {Number(application?.requestedAmount || 0).toLocaleString()}</strong> | Term: <strong className="text-white">{application?.requestedTermMonths} Months</strong>
                    </p>
                    <p className="text-slate-300">
                        Scheme: <strong className="text-white">{application?.loanTypeName || "—"}</strong>
                    </p>
                </div>

                {/* Guarantor Requirement Alert */}
                {isApprove && requiresGuarantor && (
                    <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        hasVerifiedGuarantor
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-red-500/30 bg-red-500/10 text-red-300"
                    }`}>
                        <div className="flex items-center gap-1.5 font-semibold text-white">
                            {hasVerifiedGuarantor ? (
                                <>
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                    <span>Guarantor Policy Met: Verified Guarantor Attached</span>
                                </>
                            ) : (
                                <>
                                    <ShieldAlert size={16} className="text-red-400" />
                                    <span>Guarantor Policy Violation: Verification Missing</span>
                                </>
                            )}
                        </div>
                        <p className="opacity-90 leading-relaxed">
                            {hasVerifiedGuarantor
                                ? "This loan scheme requires a guarantor, and a verified guarantor is registered on file."
                                : "This loan product requires at least one verified guarantor before approval. Please ensure a guarantor is submitted and verified on the Guarantors page before approving."}
                        </p>
                    </div>
                )}

                <Textarea
                    label={isApprove ? "Approval Remarks / Sanction Conditions (Optional)" : "Reason for Rejection *"}
                    name="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder={isApprove ? "Enter underwriting notes or sanction conditions..." : "Provide clear justification for credit rejection..."}
                    required={!isApprove}
                />

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
                        variant={isApprove ? "primary" : "danger"}
                        loading={loading}
                        loadingText={isApprove ? "Approving..." : "Rejecting..."}
                        disabled={isApprovalBlocked}
                        className={isApprove ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20" : ""}
                    >
                        {isApprove ? "Sanction & Approve Facility" : "Reject Application"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
