import api from "./api";

// 1. Loans Portfolio Report
export const getLoansReport = async (params = {}) => {
    const response = await api.get("/Reports/loans", { params });
    return response.data;
};

export const exportLoansCsv = async (params = {}) => {
    const response = await api.get("/Reports/loans/export-csv", {
        params,
        responseType: "blob"
    });
    return response.data;
};

// 2. Repayments Report
export const getRepaymentsReport = async (params = {}) => {
    const response = await api.get("/Reports/repayments", { params });
    return response.data;
};

export const exportRepaymentsCsv = async (params = {}) => {
    const response = await api.get("/Reports/repayments/export-csv", {
        params,
        responseType: "blob"
    });
    return response.data;
};

// 3. Outstanding Loans Risk Report
export const getOutstandingReport = async (params = {}) => {
    const response = await api.get("/Reports/outstanding", { params });
    return response.data;
};

export const exportOutstandingCsv = async (params = {}) => {
    const response = await api.get("/Reports/outstanding/export-csv", {
        params,
        responseType: "blob"
    });
    return response.data;
};

// 4. Pending Installments Report
export const getPendingInstallmentsReport = async (params = {}) => {
    const response = await api.get("/Reports/pending-installments", { params });
    return response.data;
};

export const exportPendingInstallmentsCsv = async (params = {}) => {
    const response = await api.get("/Reports/pending-installments/export-csv", {
        params,
        responseType: "blob"
    });
    return response.data;
};

// 5. Overdue Installments Report
export const getOverdueInstallmentsReport = async (params = {}) => {
    const response = await api.get("/Reports/overdue-installments", { params });
    return response.data;
};

export const exportOverdueInstallmentsCsv = async (params = {}) => {
    const response = await api.get("/Reports/overdue-installments/export-csv", {
        params,
        responseType: "blob"
    });
    return response.data;
};

// 6. Disbursements Report
export const getDisbursementsReport = async (params = {}) => {
    const response = await api.get("/Reports/disbursements", { params });
    return response.data;
};

export const exportDisbursementsCsv = async (params = {}) => {
    const response = await api.get("/Reports/disbursements/export-csv", {
        params,
        responseType: "blob"
    });
    return response.data;
};

// 7. Customer Statement
export const getCustomerStatement = async (loanId) => {
    const response = await api.get(`/Reports/customer-statement/${loanId}`);
    return response.data;
};

export const exportCustomerStatementCsv = async (loanId) => {
    const response = await api.get(`/Reports/customer-statement/${loanId}/export-csv`, {
        responseType: "blob"
    });
    return response.data;
};

export default {
    getLoansReport,
    exportLoansCsv,
    getRepaymentsReport,
    exportRepaymentsCsv,
    getOutstandingReport,
    exportOutstandingCsv,
    getPendingInstallmentsReport,
    exportPendingInstallmentsCsv,
    getOverdueInstallmentsReport,
    exportOverdueInstallmentsCsv,
    getDisbursementsReport,
    exportDisbursementsCsv,
    getCustomerStatement,
    exportCustomerStatementCsv
};
