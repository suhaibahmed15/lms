import api from "./api";

// Get all loans (admin/manager/officer)
export const getAllLoans = async (params = {}) => {
    const response = await api.get("/Loans", { params });
    return response.data;
};

// Get loans belonging to the currently logged in customer
export const getMyLoans = async (params = {}) => {
    const response = await api.get("/Loans/my-loans", { params });
    return response.data;
};

// Get loan by ID
export const getLoanById = async (id) => {
    const response = await api.get(`/Loans/${id}`);
    return response.data;
};

// Get loan repayment schedule
export const getLoanSchedule = async (id) => {
    try {
        const response = await api.get(`/Loans/${id}/repayment-schedule`);
        return response.data;
    } catch {
        const fallback = await api.get(`/RepaymentSchedules/loan/${id}`);
        return fallback.data;
    }
};

// Get repayments made towards a loan
export const getLoanRepayments = async (id) => {
    const response = await api.get(`/Loans/${id}/repayments`);
    return response.data;
};

// Disburse an approved loan application
export const disburseLoan = async (applicationId, data = {}) => {
    const response = await api.post(`/LoanDisbursements/${applicationId}/disburse`, data);
    return response.data;
};

export default {
    getAllLoans,
    getMyLoans,
    getLoanById,
    getLoanSchedule,
    getLoanRepayments,
    disburseLoan
};
