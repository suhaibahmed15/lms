import api from "./api";

// Customer submits repayment
export const submitRepayment = async (data) => {
    const response = await api.post("/Repayments", data);
    return response.data;
};

// All repayments with pagination & filters (staff)
export const getAllRepayments = async (params = {}) => {
    const response = await api.get("/Repayments", { params });
    return response.data;
};

// Customer's own repayments
export const getMyRepayments = async (params = {}) => {
    const response = await api.get("/Repayments/my-payments", { params });
    return response.data;
};

// Pending payments awaiting verification (admin/manager)
export const getPendingRepayments = async () => {
    const response = await api.get("/Repayments/pending");
    return response.data;
};

// Get single repayment details
export const getRepaymentById = async (id) => {
    const response = await api.get(`/Repayments/${id}`);
    return response.data;
};

// Verify payment (admin/manager)
export const verifyRepayment = async (id, data = {}) => {
    const response = await api.post(`/Repayments/${id}/verify`, data);
    return response.data;
};

// Reject payment (admin/manager)
export const rejectRepayment = async (id, data = {}) => {
    const response = await api.post(`/Repayments/${id}/reject`, data);
    return response.data;
};

// Generate repayment schedule for a loan
export const generateRepaymentSchedule = async (loanId, data) => {
    const response = await api.post(`/RepaymentSchedules/${loanId}/generate`, data);
    return response.data;
};

// Get repayment schedule for a loan
export const getRepaymentScheduleByLoan = async (loanId) => {
    const response = await api.get(`/RepaymentSchedules/loan/${loanId}`);
    return response.data;
};

export default {
    submitRepayment,
    getAllRepayments,
    getMyRepayments,
    getPendingRepayments,
    getRepaymentById,
    verifyRepayment,
    rejectRepayment,
    generateRepaymentSchedule,
    getRepaymentScheduleByLoan
};
