
import api from "./api";

// Get All Loan Applications
export const getAllLoanApplications = async (params = {}) => {
    const response = await api.get("/LoanApplications", { params });

    return response.data;
};

// Create New Loan Application
export const createLoanApplication = async (applicationData) => {
    const response = await api.post(
        "/LoanApplications",
        applicationData
    );

    return response.data;
};
