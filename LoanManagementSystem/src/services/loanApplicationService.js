
import api from "./api";

// Get All Loan Applications
export const getAllLoanApplications = async () => {
    const response = await api.get("/LoanApplications");

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
