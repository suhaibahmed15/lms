import api from "./api";

// Get applications according to the logged-in user's role
export const getAllLoanApplications = async (params = {}) => {
    const response = await api.get("/LoanApplications", { params });
    return response.data;
};

// Get single application by ID
export const getLoanApplicationById = async (id) => {
    const response = await api.get(`/LoanApplications/${id}`);
    return response.data;
};

// Customer submits a new application
export const createLoanApplication = async (applicationData) => {
    const response = await api.post("/LoanApplications", applicationData);
    return response.data;
};

// Officer reviews an assigned application
export const reviewLoanApplication = async (applicationId, reviewData) => {
    const response = await api.put(
        `/LoanApplications/${applicationId}/review`,
        reviewData
    );
    return response.data;
};

// Manager/Admin assigns application to an officer
export const assignLoanApplication = async (applicationId, data) => {
    const response = await api.post(
        `/LoanApplicationAssignments/${applicationId}/assign`,
        data
    );
    return response.data;
};

// Manager/Admin approves application
export const approveLoanApplication = async (applicationId, data) => {
    const response = await api.post(
        `/LoanApprovals/${applicationId}/approve`,
        data
    );
    return response.data;
};

// Manager/Admin rejects application
export const rejectLoanApplication = async (applicationId, data) => {
    const response = await api.post(
        `/LoanApprovals/${applicationId}/reject`,
        data
    );
    return response.data;
};

export default {
    getAllLoanApplications,
    getLoanApplicationById,
    createLoanApplication,
    reviewLoanApplication,
    assignLoanApplication,
    approveLoanApplication,
    rejectLoanApplication
};
