
import { useCallback, useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";

import LoanDocumentTable from "../modals/loanDocuments/LoanDocumentTable";
import LoanDocumentModal from "../modals/loanDocuments/LoanDocumentModal";
import RejectDocumentModal from "../modals/loanDocuments/RejectDocumentModal";

import {
    uploadLoanDocument,
    getDocumentsByApplication,
    downloadLoanDocument,
    verifyLoanDocument,
    rejectLoanDocument
} from "../services/loanDocumentService";

import { getAllLoanApplications } from "../services/loanApplicationService";
import { getMyRole } from "../services/roleService";
import { getEffectivePermissionsByUser } from "../services/permissionService";
import { getCurrentUser, getUserId } from "../utils/auth";

export default function LoanDocuments() {
    const user = getCurrentUser();

    const [applications, setApplications] = useState([]);
    const [selectedApplicationId, setSelectedApplicationId] = useState("");
    const [documents, setDocuments] = useState([]);

    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [modalError, setModalError] = useState("");

    const [canView, setCanView] = useState(false);
    const [canUpload, setCanUpload] = useState(false);
    const [canVerify, setCanVerify] = useState(false);

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const selectedApplication =
        applications.find(
            (application) =>
                String(application.id) === String(selectedApplicationId)
        ) || null;

    // Load logged-in user's role and permissions
    const loadPermissions = useCallback(async () => {
        try {
            const userId = getUserId();

            if (!userId) return;

            const [roleResponse, permissionResponse] = await Promise.all([
                getMyRole(),
                getEffectivePermissionsByUser(userId)
            ]);

            const role = roleResponse?.data || roleResponse;

            const permissions = Array.isArray(permissionResponse)
                ? permissionResponse
                : permissionResponse?.data || [];

            const permissionKeys = permissions.map((permission) =>
                permission.key?.toUpperCase()
            );

            const roleKey = role?.key?.toUpperCase();
            const isAdmin = roleKey === "ADMIN";

            setCanView(
                isAdmin || permissionKeys.includes("LOAN_DOCUMENT_VIEW")
            );

            setCanUpload(
                isAdmin ||
                (roleKey === "CUSTOMER" && permissionKeys.includes("LOAN_DOCUMENT_UPLOAD")) ||
                permissionKeys.includes("LOAN_DOCUMENT_UPLOAD")
            );

            setCanVerify(
                isAdmin ||
                (["MANAGER", "OFFICER", "LOAN_OFFICER"].includes(roleKey) &&
                permissionKeys.includes("LOAN_APPLICATION_REVIEW"))
            );
        } catch (err) {
            console.error("Loan document permission error:", err);
        }
    }, []);

    // Load applications visible to the logged-in user
    const fetchApplications = useCallback(async () => {
        try {
            setError("");

            const response = await getAllLoanApplications({
                pageNumber: 1,
                pageSize: 100,
                sortDirection: "desc"
            });

            const records = Array.isArray(response?.data)
                ? response.data
                : [];

            setApplications(records);
        } catch (err) {
            console.error("Loan applications loading error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load loan applications."
            );

            setApplications([]);
        }
    }, []);

    // Load documents for selected application
    const fetchDocuments = useCallback(async () => {
        if (!selectedApplicationId) {
            setDocuments([]);
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await getDocumentsByApplication(
                selectedApplicationId
            );

            setDocuments(
                Array.isArray(response?.data) ? response.data : []
            );
        } catch (err) {
            console.error("Loan documents loading error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load loan documents."
            );

            setDocuments([]);
        } finally {
            setLoading(false);
        }
    }, [selectedApplicationId]);

    useEffect(() => {
        loadPermissions();
        fetchApplications();
    }, [loadPermissions, fetchApplications]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Upload document
    const handleUpload = async (formData) => {
        try {
            setModalLoading(true);
            setModalError("");

            formData.append(
                "LoanApplicationId",
                selectedApplicationId
            );

            const response = await uploadLoanDocument(formData);

            setIsUploadOpen(false);
            setSuccess(
                response?.message ||
                "Document uploaded successfully."
            );

            await fetchDocuments();
        } catch (err) {
            console.error("Document upload error:", err);

            setModalError(
                err.response?.data?.message ||
                "Unable to upload document."
            );
        } finally {
            setModalLoading(false);
        }
    };

    // Download document
    const handleDownload = async (document) => {
        try {
            setError("");

            const response = await downloadLoanDocument(document.id);

            const blob = new Blob([response.data], {
                type: document.contentType || "application/octet-stream"
            });

            const url = window.URL.createObjectURL(blob);
            const link = window.document.createElement("a");

            link.href = url;
            link.download = document.fileName || "loan-document";

            window.document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Document download error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to download document."
            );
        }
    };

    // Verify document
    const handleVerify = async (document) => {
        const remarks = window.prompt(
            "Enter verification remarks (optional):"
        );

        if (remarks === null) return;

        try {
            setError("");
            setSuccess("");

            await verifyLoanDocument(document.id, {
                verificationRemarks: remarks.trim() || null
            });

            setSuccess("Document verified successfully.");
            await fetchDocuments();
        } catch (err) {
            console.error("Document verification error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to verify document."
            );
        }
    };

    // Open rejection modal
    const handleOpenReject = (document) => {
        setSelectedDocument(document);
        setModalError("");
        setIsRejectOpen(true);
    };

    // Reject document
    const handleReject = async (data) => {
        try {
            setModalLoading(true);
            setModalError("");

            await rejectLoanDocument(
                selectedDocument.id,
                data
            );

            setIsRejectOpen(false);
            setSelectedDocument(null);
            setSuccess("Document rejected successfully.");

            await fetchDocuments();
        } catch (err) {
            console.error("Document rejection error:", err);

            setModalError(
                err.response?.data?.message ||
                "Unable to reject document."
            );
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <MainLayout user={user}>
            <div className="space-y-6">

                <div className="rounded-3xl border border-pink-200/80 bg-white p-5 shadow-xl shadow-pink-500/5">
                    <h1 className="text-xl font-bold text-zinc-900">
                        Loan Documents
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Manage, upload and review loan application documents.
                    </p>

                    <div className="mt-5 max-w-xl">
                        <label className="mb-2 block text-sm font-medium text-zinc-700">
                            Select Loan Application
                        </label>

                        <select
                            value={selectedApplicationId}
                            onChange={(e) => {
                                setSelectedApplicationId(e.target.value);
                                setDocuments([]);
                                setError("");
                                setSuccess("");
                            }}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-pink-500"
                        >
                            <option value="">
                                Select an application
                            </option>

                            {applications.map((application) => (
                                <option
                                    key={application.id}
                                    value={application.id}
                                    className="bg-white text-zinc-900"
                                >
                                    {application.applicationNumber}
                                    {" — "}
                                    {application.applicantName}
                                    {" — "}
                                    {application.loanTypeName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {applications.length === 0 && (
                        <p className="mt-3 text-xs text-zinc-500">
                            No loan applications are available.
                        </p>
                    )}
                </div>

                {canView ? (
                    <LoanDocumentTable
                        documents={documents}
                        loading={loading}
                        error={error}
                        success={success}
                        selectedApplication={selectedApplication}
                        canVerify={canVerify}
                        onUpload={
                            canUpload
                                ? () => {
                                    setModalError("");
                                    setIsUploadOpen(true);
                                }
                                : null
                        }
                        onDownload={handleDownload}
                        onVerify={handleVerify}
                        onReject={handleOpenReject}
                        onRefresh={fetchDocuments}
                    />
                ) : (
                    <div className="rounded-xl border border-amber-200 bg-yellow-500/10 p-5 text-sm text-yellow-400">
                        You do not have permission to view loan documents.
                    </div>
                )}

                <LoanDocumentModal
                    isOpen={isUploadOpen}
                    onClose={() => {
                        setIsUploadOpen(false);
                        setModalError("");
                    }}
                    onSubmit={handleUpload}
                    loading={modalLoading}
                    error={modalError}
                />

                <RejectDocumentModal
                    isOpen={isRejectOpen}
                    onClose={() => {
                        setIsRejectOpen(false);
                        setSelectedDocument(null);
                        setModalError("");
                    }}
                    onSubmit={handleReject}
                    loading={modalLoading}
                    error={modalError}
                />

            </div>
        </MainLayout>
    );
}
