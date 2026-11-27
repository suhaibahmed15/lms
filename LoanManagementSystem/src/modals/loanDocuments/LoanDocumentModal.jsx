import { useState } from "react";
import { Upload, FileText } from "lucide-react";
import { Modal, Button, Input, Form } from "../../components/common";

export default function LoanDocumentModal({
    isOpen,
    onClose,
    onSubmit,
    loading = false,
    error = ""
}) {
    const [documentType, setDocumentType] = useState("");
    const [file, setFile] = useState(null);
    const [validationError, setValidationError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError("");

        if (!documentType.trim()) {
            setValidationError("Please enter document type.");
            return;
        }

        if (!file) {
            setValidationError("Please select a document.");
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png"
        ];

        if (!allowedTypes.includes(file.type)) {
            setValidationError("Only PDF, JPG, JPEG and PNG files are allowed.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setValidationError("File size cannot exceed 5 MB.");
            return;
        }

        const formData = new FormData();
        formData.append("DocumentType", documentType.trim());
        formData.append("File", file);

        await onSubmit(formData);
    };

    const handleClose = () => {
        if (loading) return;
        setDocumentType("");
        setFile(null);
        setValidationError("");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Upload Loan Document"
            subtitle="Upload a supporting document for your loan application (max 5MB)."
            maxWidth="md"
        >
            <Form onSubmit={handleSubmit} error={validationError || error}>
                <Input
                    label="Document Type"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    placeholder="e.g. CNIC Front, Salary Slip, Bank Statement"
                    maxLength={100}
                    required
                />

                <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                        Select File <span className="text-pink-400">*</span>
                    </label>

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-pink-200 bg-pink-50/40 px-5 py-8 transition hover:border-pink-500/60">
                        <Upload size={28} className="mb-3 text-pink-400" />
                        <span className="text-sm font-medium text-zinc-900">
                            Click to select a file
                        </span>
                        <span className="mt-2 text-xs text-zinc-500">
                            PDF, JPG, JPEG or PNG · Maximum 5 MB
                        </span>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                                const selected = e.target.files?.[0];
                                if (selected) {
                                    setFile(selected);
                                    setValidationError("");
                                }
                            }}
                            className="hidden"
                        />
                    </label>

                    {file && (
                        <div className="mt-3 flex items-center gap-3 rounded-xl border border-pink-100 bg-pink-50/30 p-3 text-sm text-zinc-700">
                            <FileText size={18} className="text-pink-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-zinc-900">{file.name}</p>
                                <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                    )}
                </div>

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
                        loading={loading}
                        loadingText="Uploading..."
                    >
                        Upload Document
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
