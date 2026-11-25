import { useCallback, useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import LoanTable from "../modals/loans/LoanTable";
import LoanDetailsModal from "../modals/loans/LoanDetailsModal";
import LoanScheduleModal from "../modals/loans/LoanScheduleModal";
import LoanRepaymentsModal from "../modals/loans/LoanRepaymentsModal";
import LoanAgreementPreviewModal from "../modals/loans/LoanAgreementPreviewModal";
import { getAllLoans, getMyLoans, getLoanSchedule } from "../services/loanService";
import { getMyRole } from "../services/roleService";
import { getCurrentUser } from "../utils/auth";
import { generateLoanAgreementPdf } from "../utils/pdfGenerator";

export default function Loans() {
    const user = getCurrentUser();

    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [selectedLoan, setSelectedLoan] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [isRepaymentsOpen, setIsRepaymentsOpen] = useState(false);
    const [isAgreementOpen, setIsAgreementOpen] = useState(false);

    const [isCustomer, setIsCustomer] = useState(false);

    useEffect(() => {
        const checkRole = async () => {
            try {
                const roleRes = await getMyRole();
                const roleKey = (roleRes?.data?.key || roleRes?.key || "").toUpperCase();
                setIsCustomer(roleKey === "CUSTOMER");
            } catch {
                // Ignore
            }
        };
        checkRole();
    }, []);

    const fetchLoans = useCallback(async () => {
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
                ? await getMyLoans(params)
                : await getAllLoans(params);

            const records = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response)
                    ? response
                    : [];

            setLoans(records);
            setTotalRecords(response?.totalRecords ?? records.length);
            setTotalPages(response?.totalPages ?? 0);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load loans.");
            setLoans([]);
            setTotalRecords(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [isCustomer, pageNumber, pageSize, search, statusFilter]);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    const handleViewDetails = (loan) => {
        setSelectedLoan(loan);
        setIsDetailsOpen(true);
    };

    const handleViewSchedule = (loan) => {
        setSelectedLoan(loan);
        setIsScheduleOpen(true);
    };

    const handleViewRepayments = (loan) => {
        setSelectedLoan(loan);
        setIsRepaymentsOpen(true);
    };

    const handleDownloadAgreement = (loan) => {
        setSelectedLoan(loan);
        setIsAgreementOpen(true);
    };

    return (
        <MainLayout user={user}>
            <div className="space-y-6">
                <LoanTable
                    loans={loans}
                    loading={loading}
                    error={error}
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
                    onRefresh={fetchLoans}
                    onViewDetails={handleViewDetails}
                    onViewSchedule={handleViewSchedule}
                    onViewRepayments={handleViewRepayments}
                    onDownloadAgreement={handleDownloadAgreement}
                />

                <LoanDetailsModal
                    isOpen={isDetailsOpen}
                    loan={selectedLoan}
                    onClose={() => setIsDetailsOpen(false)}
                />

                <LoanScheduleModal
                    isOpen={isScheduleOpen}
                    loan={selectedLoan}
                    onClose={() => setIsScheduleOpen(false)}
                />

                <LoanRepaymentsModal
                    isOpen={isRepaymentsOpen}
                    loan={selectedLoan}
                    onClose={() => setIsRepaymentsOpen(false)}
                />

                <LoanAgreementPreviewModal
                    isOpen={isAgreementOpen}
                    loan={selectedLoan}
                    onClose={() => setIsAgreementOpen(false)}
                />
            </div>
        </MainLayout>
    );
}
