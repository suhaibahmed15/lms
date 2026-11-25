import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import {
    getAllLoanApplications,
} from "../services/loanApplicationService";

import {
    createLoanGuarantor,
    getGuarantorsByApplication,
    updateLoanGuarantor,
    deleteLoanGuarantor,
    verifyLoanGuarantor,
    rejectLoanGuarantor,
} from "../services/loanGuarantorService";

import { getMyRole } from "../services/roleService";
import { getEffectivePermissionsByUser } from "../services/permissionService";
import { getUserId } from "../utils/auth";

import LoanGuarantorModal from "../modals/loanGuarantors/LoanGuarantorModal";
import LoanGuarantorTable from "../modals/loanGuarantors/LoanGuarantorTable";

function LoanGuarantors() {
    const [searchParams] = useSearchParams();
    const urlAppId = searchParams.get("applicationId");
    const autoOpen = searchParams.get("autoOpen") === "true";

    const [applications, setApplications] = useState([]);
    const [guarantors, setGuarantors] = useState([]);

    const [selectedApplicationId, setSelectedApplicationId] = useState("");

    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedGuarantor, setSelectedGuarantor] = useState(null);

    const [roleKey, setRoleKey] = useState("");
    const [permissionKeys, setPermissionKeys] = useState([]);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const userId = getUserId();

    const hasPermission = (permissionKey) =>
        roleKey === "ADMIN" || permissionKeys.includes(permissionKey);

    const canView = hasPermission("LOAN_APPLICATION_VIEW");

    const canManage =
        hasPermission("LOAN_APPLICATION_CREATE") &&
        (roleKey === "CUSTOMER" || roleKey === "ADMIN");

    const canReview =
        hasPermission("LOAN_APPLICATION_REVIEW") &&
        ["ADMIN", "MANAGER", "OFFICER", "LOAN_OFFICER"].includes(roleKey);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedApplicationId && canView) {
            loadGuarantors(selectedApplicationId);
        } else {
            setGuarantors([]);
        }
    }, [selectedApplicationId, canView]);

    const getErrorMessage = (err) => {
        return (
            err.response?.data?.message ||
            err.response?.data?.title ||
            err.message ||
            "Something went wrong."
        );
    };

    const loadInitialData = async () => {
        setLoading(true);
        setError("");

        try {
            if (!userId) {
                setError("Unable to identify the logged-in user. Please log in again.");
                return;
            }

            const [roleResponse, permissionResponse] = await Promise.all([
                getMyRole(),
                getEffectivePermissionsByUser(userId),
            ]);

            const role = roleResponse?.data || roleResponse;

            const roleName =
                role?.key ||
                role?.roleKey ||
                role?.name ||
                role?.roleName ||
                "";

            const permissions = Array.isArray(permissionResponse)
                ? permissionResponse
                : permissionResponse?.data || [];

            const keys = permissions
                .map((permission) =>
                    typeof permission === "string"
                        ? permission
                        : permission.permissionKey ||
                          permission.key ||
                          permission.name
                )
                .filter(Boolean)
                .map((key) => key.toUpperCase());

            setRoleKey(roleName.toUpperCase());
            setPermissionKeys(keys);

            if (!keys.includes("LOAN_APPLICATION_VIEW")) {
                setError("You do not have permission to view loan guarantors.");
                return;
            }

            const applicationResponse = await getAllLoanApplications({
                pageNumber: 1,
                pageSize: 100,
            });

            const applicationList = Array.isArray(applicationResponse)
                ? applicationResponse
                : applicationResponse?.data || [];

            setApplications(applicationList);

            if (urlAppId) {
                setSelectedApplicationId(String(urlAppId));
                if (autoOpen) {
                    setSelectedGuarantor(null);
                    setModalOpen(true);
                }
            } else if (applicationList.length > 0) {
                setSelectedApplicationId(
                    String(applicationList[0].id)
                );
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const loadGuarantors = async (applicationId) => {
        setTableLoading(true);
        setError("");

        try {
            const response = await getGuarantorsByApplication(applicationId);

            const data = Array.isArray(response)
                ? response
                : response?.data || [];

            setGuarantors(data);
        } catch (err) {
            setGuarantors([]);
            setError(getErrorMessage(err));
        } finally {
            setTableLoading(false);
        }
    };

    const openAddModal = () => {
        setSelectedGuarantor(null);
        setModalOpen(true);
    };

    const openEditModal = (guarantor) => {
        setSelectedGuarantor(guarantor);
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;

        setModalOpen(false);
        setSelectedGuarantor(null);
    };

    const handleSave = async (formData) => {
        if (!selectedApplicationId) {
            setError("Please select a loan application first.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            if (selectedGuarantor) {
                await updateLoanGuarantor(
                    selectedGuarantor.id,
                    formData
                );

                setSuccess("Guarantor updated successfully.");
            } else {
                await createLoanGuarantor({
                    LoanApplicationId: Number(selectedApplicationId),
                    ...formData,
                });

                setSuccess("Guarantor added successfully.");
            }

            setModalOpen(false);
            setSelectedGuarantor(null);

            await loadGuarantors(selectedApplicationId);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (guarantor) => {
        const confirmed = window.confirm(
            `Are you sure you want to remove ${guarantor.fullName}?`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await deleteLoanGuarantor(guarantor.id);

            setSuccess("Guarantor removed successfully.");

            await loadGuarantors(selectedApplicationId);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleVerify = async (guarantor) => {
        const remarks = window.prompt(
            "Enter verification remarks (optional):"
        );

        if (remarks === null) return;

        setError("");
        setSuccess("");

        try {
            await verifyLoanGuarantor(guarantor.id, {
                VerificationRemarks: remarks.trim() || null,
            });

            setSuccess("Guarantor verified successfully.");

            await loadGuarantors(selectedApplicationId);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleReject = async (guarantor) => {
        const remarks = window.prompt(
            "Enter rejection remarks (minimum 5 characters):"
        );

        if (remarks === null) return;

        if (remarks.trim().length < 5) {
            setError("Rejection remarks must be at least 5 characters.");
            return;
        }

        if (remarks.trim().length > 500) {
            setError("Rejection remarks cannot exceed 500 characters.");
            return;
        }

        setError("");
        setSuccess("");

        try {
            await rejectLoanGuarantor(guarantor.id, {
                RejectionRemarks: remarks.trim(),
            });

            setSuccess("Guarantor rejected successfully.");

            await loadGuarantors(selectedApplicationId);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const selectedApplication = applications.find(
        (application) =>
            String(application.id) === String(selectedApplicationId)
    );

    if (loading) {
        return (
            <MainLayout>
                <div className="p-6 text-center text-slate-400">
                    Loading loan guarantors...
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6 p-4 sm:p-6">
                {/* Page Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Loan Guarantors
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Manage and review guarantors linked to loan applications.
                        </p>
                    </div>

                    {canManage && selectedApplicationId && (
                        <button
                            onClick={openAddModal}
                            className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                        >
                            + Add Guarantor
                        </button>
                    )}
                </div>

                {/* Alerts */}
                {error && (
                    <div className="flex items-start justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        <span>{error}</span>
                        <button
                            onClick={() => setError("")}
                            className="font-bold"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {success && (
                    <div className="flex items-start justify-between gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                        <span>{success}</span>
                        <button
                            onClick={() => setSuccess("")}
                            className="font-bold"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Application Selection */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                        Select Loan Application
                    </label>

                    <select
                        value={selectedApplicationId}
                        onChange={(e) =>
                            setSelectedApplicationId(e.target.value)
                        }
                        className="w-full max-w-xl rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-orange-500"
                    >
                        <option value="">Select an application</option>

                        {applications.map((application) => (
                            <option
                                key={application.id}
                                value={application.id}
                            >
                                {application.applicationNumber
                                    ? `${application.applicationNumber} - ${application.applicantName || "Applicant"}`
                                    : `Application #${application.id}`}
                            </option>
                        ))}
                    </select>

                    {selectedApplication && (
                        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-800 pt-4 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-slate-500">
                                    Applicant
                                </p>
                                <p className="mt-1 text-sm font-medium text-white">
                                    {selectedApplication.applicantName || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Application Number
                                </p>
                                <p className="mt-1 text-sm font-medium text-white">
                                    {selectedApplication.applicationNumber || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Application Status
                                </p>
                                <p className="mt-1 text-sm font-medium text-white">
                                    {selectedApplication.statusName || "—"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Guarantor Table */}
                {selectedApplicationId ? (
                    <>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Guarantor Records
                                </h2>
                                <p className="mt-1 text-xs text-slate-400">
                                    {guarantors.length} guarantor(s) found
                                </p>
                            </div>
                        </div>

                        <LoanGuarantorTable
                            guarantors={guarantors}
                            loading={tableLoading}
                            canManage={canManage}
                            canReview={canReview}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            onVerify={handleVerify}
                            onReject={handleReject}
                        />
                    </>
                ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-10 text-center">
                        <p className="font-medium text-white">
                            No loan application available
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                            Select an application to view its guarantors.
                        </p>
                    </div>
                )}

                {/* Add / Edit Modal */}
                <LoanGuarantorModal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    onSubmit={handleSave}
                    guarantor={selectedGuarantor}
                    loading={saving}
                />
            </div>
        </MainLayout>
    );
}

export default LoanGuarantors;