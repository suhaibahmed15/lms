import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";

import LoanApplicationTable from "../modals/loanApplications/LoanApplicationTable";
import LoanApplicationModal from "../modals/loanApplications/LoanApplicationModal";
import AssignApplicationModal from "../modals/loanApplications/AssignApplicationModal";
import ApproveRejectApplicationModal from "../modals/loanApplications/ApproveRejectApplicationModal";
import DisburseApplicationModal from "../modals/loanApplications/DisburseApplicationModal";

import {
    getAllLoanApplications,
    createLoanApplication,
    reviewLoanApplication,
    assignLoanApplication,
    approveLoanApplication,
    rejectLoanApplication
} from "../services/loanApplicationService";

import { createLoanGuarantor } from "../services/loanGuarantorService";
import { disburseLoan } from "../services/loanService";
import { getActiveLoanTypes } from "../services/loanTypeService";
import { getAllUsers } from "../services/userService";
import { getMyRole } from "../services/roleService";
import { getEffectivePermissionsByUser } from "../services/permissionService";
import { getCurrentUser, getUserId } from "../utils/auth";

export default function LoanApplications() {
    const user = getCurrentUser();
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loanTypes, setLoanTypes] = useState([]);
    const [officers, setOfficers] = useState([]);

    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [modalError, setModalError] = useState("");

    const [search, setSearch] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [canCreate, setCanCreate] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const [canAssign, setCanAssign] = useState(false);
    const [canApprove, setCanApprove] = useState(false);
    const [canReject, setCanReject] = useState(false);
    const [canDisburse, setCanDisburse] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [selectedApplication, setSelectedApplication] = useState(null);

    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [isDecisionOpen, setIsDecisionOpen] = useState(false);
    const [decisionType, setDecisionType] = useState("approve");
    const [isDisburseOpen, setIsDisburseOpen] = useState(false);

    // Load permissions of logged-in user
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

            const permissionKeys = permissions.map((p) => p.key?.toUpperCase());
            const roleKey = role?.key?.toUpperCase();
            const isAdmin = roleKey === "ADMIN";

            setCanCreate(
                isAdmin ||
                (roleKey === "CUSTOMER" && permissionKeys.includes("LOAN_APPLICATION_CREATE")) ||
                permissionKeys.includes("LOAN_APPLICATION_CREATE")
            );

            setCanReview(
                isAdmin ||
                roleKey === "OFFICER" ||
                roleKey === "LOAN_OFFICER" ||
                permissionKeys.includes("LOAN_APPLICATION_REVIEW")
            );

            setCanAssign(
                isAdmin ||
                roleKey === "MANAGER" ||
                permissionKeys.includes("LOAN_APPLICATION_ASSIGN")
            );

            setCanApprove(
                isAdmin ||
                roleKey === "MANAGER" ||
                permissionKeys.includes("LOAN_APPLICATION_APPROVE")
            );

            setCanReject(
                isAdmin ||
                roleKey === "MANAGER" ||
                permissionKeys.includes("LOAN_APPLICATION_REJECT")
            );

            setCanDisburse(
                isAdmin ||
                roleKey === "MANAGER" ||
                permissionKeys.includes("LOAN_DISBURSE")
            );
        } catch (err) {
            console.error("Loan application permission error:", err);
        }
    }, []);

    // Load loan applications
    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllLoanApplications({
                pageNumber,
                pageSize,
                search: search.trim() || undefined,
                sortBy: "SubmittedAt",
                sortDirection: "desc"
            });

            const records = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response)
                    ? response
                    : [];

            setApplications(records);
            setTotalRecords(response?.totalRecords ?? records.length);
            setTotalPages(response?.totalPages ?? 0);
        } catch (err) {
            console.error("Loan applications loading error:", err);
            setError(err.response?.data?.message || "Unable to load loan applications.");
            setApplications([]);
            setTotalRecords(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, search]);

    // Load officers if user can assign
    const loadOfficers = useCallback(async () => {
        try {
            const res = await getAllUsers({ pageSize: 100 });
            const userList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
            const officerUsers = userList.filter((u) => {
                const r = (u.roleKey || u.roleName || "").toUpperCase();
                return r.includes("OFFICER") || r.includes("ADMIN") || r.includes("MANAGER");
            });
            setOfficers(officerUsers);
        } catch {
            // Silently fallback
        }
    }, []);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    useEffect(() => {
        if (canAssign) {
            loadOfficers();
        }
    }, [canAssign, loadOfficers]);

    // Open create application form
    const handleAdd = async () => {
        try {
            setError("");
            setModalError("");

            const response = await getActiveLoanTypes();
            const records = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response)
                    ? response
                    : [];

            setLoanTypes(records);
            setSelectedApplication(null);
            setModalMode("create");
            setIsModalOpen(true);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load active loan types.");
        }
    };

    // Open officer review form
    const handleReview = (application) => {
        setSelectedApplication(application);
        setModalMode("review");
        setModalError("");
        setIsModalOpen(true);
    };

    // Open assignment modal
    const handleAssign = (application) => {
        setSelectedApplication(application);
        setModalError("");
        setIsAssignOpen(true);
    };

    // Open approve modal
    const handleApprove = (application) => {
        setSelectedApplication(application);
        setDecisionType("approve");
        setModalError("");
        setIsDecisionOpen(true);
    };

    // Open reject modal
    const handleReject = (application) => {
        setSelectedApplication(application);
        setDecisionType("reject");
        setModalError("");
        setIsDecisionOpen(true);
    };

    // Open disburse modal
    const handleDisburse = (application) => {
        setSelectedApplication(application);
        setModalError("");
        setIsDisburseOpen(true);
    };

    // Handle Create / Review submit
    const handleModalSubmit = async (formData) => {
        try {
            setModalLoading(true);
            setModalError("");
            setError("");
            setSuccess("");

            if (modalMode === "create") {
                const { guarantor, requiresGuarantor, ...appPayload } = formData;
                const response = await createLoanApplication(appPayload);
                const newAppId =
                    response?.data?.id ??
                    response?.id ??
                    response?.data?.applicationId ??
                    response?.applicationId;

                if (newAppId && guarantor) {
                    try {
                        await createLoanGuarantor({
                            loanApplicationId: Number(newAppId),
                            ...guarantor
                        });
                        setSuccess("Loan application and guarantor particulars submitted successfully.");
                    } catch (gErr) {
                        setSuccess("Loan application created. Please review guarantor under Guarantors.");
                    }
                } else if (newAppId && requiresGuarantor) {
                    setIsModalOpen(false);
                    setSelectedApplication(null);
                    navigate(`/loan-guarantors?applicationId=${newAppId}&autoOpen=true`);
                    return;
                } else {
                    setSuccess(response?.message || "Loan application submitted successfully.");
                }
            } else {
                await reviewLoanApplication(selectedApplication.id, formData);
                setSuccess("Loan application reviewed successfully.");
            }

            setIsModalOpen(false);
            setSelectedApplication(null);
            await fetchApplications();
        } catch (err) {
            setModalError(err.response?.data?.message || "Unable to complete operation.");
        } finally {
            setModalLoading(false);
        }
    };

    const handleAddGuarantor = (app) => {
        navigate(`/loan-guarantors?applicationId=${app.id}&autoOpen=true`);
    };

    // Handle Assign submit
    const handleAssignSubmit = async (data) => {
        try {
            setModalLoading(true);
            setModalError("");
            setError("");
            setSuccess("");

            await assignLoanApplication(selectedApplication.id, data);
            setSuccess("Application assigned to officer successfully.");
            setIsAssignOpen(false);
            setSelectedApplication(null);
            await fetchApplications();
        } catch (err) {
            setModalError(err.response?.data?.message || "Assignment failed.");
        } finally {
            setModalLoading(false);
        }
    };

    // Handle Decision submit (Approve / Reject)
    const handleDecisionSubmit = async (data) => {
        try {
            setModalLoading(true);
            setModalError("");
            setError("");
            setSuccess("");

            if (decisionType === "approve") {
                await approveLoanApplication(selectedApplication.id, data);
                setSuccess("Application approved successfully.");
            } else {
                await rejectLoanApplication(selectedApplication.id, data);
                setSuccess("Application rejected successfully.");
            }

            setIsDecisionOpen(false);
            setSelectedApplication(null);
            await fetchApplications();
        } catch (err) {
            setModalError(err.response?.data?.message || "Decision submission failed.");
        } finally {
            setModalLoading(false);
        }
    };

    // Handle Disburse submit
    const handleDisburseSubmit = async (data) => {
        try {
            setModalLoading(true);
            setModalError("");
            setError("");
            setSuccess("");

            const res = await disburseLoan(selectedApplication.id, data);
            setSuccess(res?.message || "Loan disbursed successfully! Installment schedule initialized.");
            setIsDisburseOpen(false);
            setSelectedApplication(null);
            await fetchApplications();
        } catch (err) {
            setModalError(err.response?.data?.message || "Disbursement failed.");
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <MainLayout user={user}>
            <div className="space-y-6">
                <LoanApplicationTable
                    applications={applications}
                    loading={loading}
                    error={error}
                    success={success}
                    search={search}
                    onSearchChange={(v) => { setSearch(v); setPageNumber(1); }}
                    pageNumber={pageNumber}
                    pageSize={pageSize}
                    totalRecords={totalRecords}
                    totalPages={totalPages}
                    onPageChange={setPageNumber}
                    onPageSizeChange={(v) => { setPageSize(v); setPageNumber(1); }}
                    onRefresh={fetchApplications}
                    onAdd={handleAdd}
                    onReview={handleReview}
                    onAssign={handleAssign}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDisburse={handleDisburse}
                    canCreate={canCreate}
                    canReview={canReview}
                    canAssign={canAssign}
                    canApprove={canApprove}
                    canReject={canReject}
                    canDisburse={canDisburse}
                    onAddGuarantor={handleAddGuarantor}
                    onViewLoan={() => navigate("/loans")}
                />

                <LoanApplicationModal
                    isOpen={isModalOpen}
                    mode={modalMode}
                    application={selectedApplication}
                    loanTypes={loanTypes}
                    onClose={() => { if (!modalLoading) setIsModalOpen(false); }}
                    onSubmit={handleModalSubmit}
                    loading={modalLoading}
                    error={modalError}
                />

                <AssignApplicationModal
                    isOpen={isAssignOpen}
                    application={selectedApplication}
                    officers={officers}
                    onClose={() => { if (!modalLoading) setIsAssignOpen(false); }}
                    onSubmit={handleAssignSubmit}
                    loading={modalLoading}
                    error={modalError}
                />

                <ApproveRejectApplicationModal
                    isOpen={isDecisionOpen}
                    type={decisionType}
                    application={selectedApplication}
                    onClose={() => { if (!modalLoading) setIsDecisionOpen(false); }}
                    onSubmit={handleDecisionSubmit}
                    loading={modalLoading}
                    error={modalError}
                />

                <DisburseApplicationModal
                    isOpen={isDisburseOpen}
                    application={selectedApplication}
                    onClose={() => { if (!modalLoading) setIsDisburseOpen(false); }}
                    onSubmit={handleDisburseSubmit}
                    loading={modalLoading}
                    error={modalError}
                />
            </div>
        </MainLayout>
    );
}
