import { useCallback, useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import RepaymentTable from "../modals/repayments/RepaymentTable";
import SubmitPaymentModal from "../modals/repayments/SubmitPaymentModal";
import VerifyRejectPaymentModal from "../modals/repayments/VerifyRejectPaymentModal";
import {
    getAllRepayments,
    getMyRepayments,
    getPendingRepayments,
    submitRepayment,
    verifyRepayment,
    rejectRepayment
} from "../services/repaymentService";
import { getAllLoans, getMyLoans } from "../services/loanService";
import { getMyRole } from "../services/roleService";
import { getEffectivePermissionsByUser } from "../services/permissionService";
import { getCurrentUser, getUserId } from "../utils/auth";

export default function Repayments() {
    const user = getCurrentUser();

    const [payments, setPayments] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [activeLoans, setActiveLoans] = useState([]);

    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [modalError, setModalError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [canSubmit, setCanSubmit] = useState(false);
    const [canVerify, setCanVerify] = useState(false);
    const [isCustomer, setIsCustomer] = useState(false);

    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [isDecisionOpen, setIsDecisionOpen] = useState(false);
    const [decisionType, setDecisionType] = useState("verify");
    const [selectedPayment, setSelectedPayment] = useState(null);

    // Load permissions
    const loadPermissions = useCallback(async () => {
        try {
            const userId = getUserId();
            if (!userId) return;

            const [roleRes, permRes] = await Promise.all([
                getMyRole(),
                getEffectivePermissionsByUser(userId)
            ]);

            const roleKey = (roleRes?.data?.key || roleRes?.key || "").toUpperCase();
            const isAdmin = roleKey === "ADMIN";
            const perms = Array.isArray(permRes?.data) ? permRes.data : Array.isArray(permRes) ? permRes : [];
            const permKeys = perms.map((p) => p.key?.toUpperCase());

            const customer = roleKey === "CUSTOMER";
            setIsCustomer(customer);

            setCanSubmit(
                isAdmin ||
                customer ||
                permKeys.includes("REPAYMENT_CREATE")
            );

            setCanVerify(
                isAdmin ||
                roleKey === "MANAGER" ||
                permKeys.includes("REPAYMENT_VERIFY")
            );
        } catch {
            // Ignore
        }
    }, []);

    const fetchRepayments = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                pageNumber,
                pageSize,
                search: search.trim() || undefined,
                statusKey: statusFilter || undefined
            };

            const response = isCustomer
                ? await getMyRepayments(params)
                : await getAllRepayments(params);

            const records = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response)
                    ? response
                    : [];

            setPayments(records);
            setTotalRecords(response?.totalRecords ?? records.length);
            setTotalPages(response?.totalPages ?? 0);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load repayments.");
            setPayments([]);
            setTotalRecords(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [isCustomer, pageNumber, pageSize, search, statusFilter]);

    const fetchPending = useCallback(async () => {
        if (!canVerify) return;
        try {
            const res = await getPendingRepayments();
            const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
            setPendingPayments(list);
        } catch {
            setPendingPayments([]);
        }
    }, [canVerify]);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    useEffect(() => {
        fetchRepayments();
    }, [fetchRepayments]);

    useEffect(() => {
        if (canVerify) {
            fetchPending();
        }
    }, [canVerify, fetchPending]);

    // Open submit payment modal
    const handleOpenSubmit = async () => {
        try {
            setError("");
            setModalError("");
            const loansRes = isCustomer
                ? await getMyLoans({ statusKey: "LOAN_ACTIVE", pageSize: 50 })
                : await getAllLoans({ statusKey: "LOAN_ACTIVE", pageSize: 50 });

            const list = Array.isArray(loansRes?.data) ? loansRes.data : Array.isArray(loansRes) ? loansRes : [];
            setActiveLoans(list);
            setIsSubmitOpen(true);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load active loans.");
        }
    };

    // Open verify payment modal
    const handleVerify = (payment) => {
        setSelectedPayment(payment);
        setDecisionType("verify");
        setModalError("");
        setIsDecisionOpen(true);
    };

    // Open reject payment modal
    const handleReject = (payment) => {
        setSelectedPayment(payment);
        setDecisionType("reject");
        setModalError("");
        setIsDecisionOpen(true);
    };

    // Handle Submit Repayment
    const handleSubmitPayment = async (data) => {
        try {
            setModalLoading(true);
            setModalError("");
            setError("");
            setSuccess("");

            const res = await submitRepayment(data);
            setSuccess(res?.message || "Payment submitted successfully. Awaiting verification.");
            setIsSubmitOpen(false);
            await fetchRepayments();
            if (canVerify) await fetchPending();
        } catch (err) {
            setModalError(err.response?.data?.message || "Failed to submit payment.");
        } finally {
            setModalLoading(false);
        }
    };

    // Handle Verify or Reject
    const handleDecisionSubmit = async (data) => {
        try {
            setModalLoading(true);
            setModalError("");
            setError("");
            setSuccess("");

            if (decisionType === "verify") {
                const res = await verifyRepayment(selectedPayment.id, data);
                setSuccess(res?.message || "Payment verified and ledger updated successfully.");
            } else {
                const res = await rejectRepayment(selectedPayment.id, data);
                setSuccess(res?.message || "Payment submission rejected.");
            }

            setIsDecisionOpen(false);
            setSelectedPayment(null);
            await fetchRepayments();
            if (canVerify) await fetchPending();
        } catch (err) {
            setModalError(err.response?.data?.message || "Decision submission failed.");
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <MainLayout user={user}>
            <div className="space-y-6">
                <RepaymentTable
                    payments={payments}
                    pendingPayments={pendingPayments}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    loading={loading}
                    error={error}
                    success={success}
                    search={search}
                    onSearchChange={(v) => { setSearch(v); setPageNumber(1); }}
                    statusFilter={statusFilter}
                    onStatusFilterChange={(v) => { setStatusFilter(v); setPageNumber(1); }}
                    pageNumber={pageNumber}
                    pageSize={pageSize}
                    totalRecords={totalRecords}
                    totalPages={totalPages}
                    onPageChange={setPageNumber}
                    onPageSizeChange={(v) => { setPageSize(v); setPageNumber(1); }}
                    onRefresh={() => { fetchRepayments(); if (canVerify) fetchPending(); }}
                    onSubmitPayment={handleOpenSubmit}
                    onVerifyPayment={handleVerify}
                    onRejectPayment={handleReject}
                    canSubmit={canSubmit}
                    canVerify={canVerify}
                />

                <SubmitPaymentModal
                    isOpen={isSubmitOpen}
                    loans={activeLoans}
                    onClose={() => { if (!modalLoading) setIsSubmitOpen(false); }}
                    onSubmit={handleSubmitPayment}
                    loading={modalLoading}
                    error={modalError}
                />

                <VerifyRejectPaymentModal
                    isOpen={isDecisionOpen}
                    type={decisionType}
                    payment={selectedPayment}
                    onClose={() => { if (!modalLoading) setIsDecisionOpen(false); }}
                    onSubmit={handleDecisionSubmit}
                    loading={modalLoading}
                    error={modalError}
                />
            </div>
        </MainLayout>
    );
}
