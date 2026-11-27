import { useState } from "react";
import { Modal, Button, Textarea, Form } from "../../components/common";

export default function RejectDocumentModal({
    isOpen,
    onClose,
    onSubmit,
    loading = false,
    error = ""
}) {
    const [remarks, setRemarks] = useState("");
    const [validationError, setValidationError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError("");

        const value = remarks.trim();
        if (value.length < 5 || value.length > 500) {
            setValidationError("Rejection remarks must be between 5 and 500 characters.");
            return;
        }

        await onSubmit({
            rejectionRemarks: value
        });
    };

    const handleClose = () => {
        if (loading) return;
        setRemarks("");
        setValidationError("");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Reject Document"
            subtitle="Provide a reason for rejecting this document so the applicant can re-upload."
            maxWidth="md"
        >
            <Form onSubmit={handleSubmit} error={validationError || error}>
                <Textarea
                    label="Rejection Remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={4}
                    maxLength={500}
                    placeholder="e.g. The document is blurry or expired. Please upload a clear copy."
                    required
                    helperText="Minimum 5 characters."
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-pink-100">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="danger"
                        loading={loading}
                        loadingText="Rejecting..."
                    >
                        Confirm Rejection
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
