import api from "./api";

export const createLoanGuarantor = async (data) => {
    const response = await api.post("/LoanGuarantors", data);
    return response.data;
};

export const getGuarantorsByApplication = async (applicationId) => {
    const response = await api.get(
        `/LoanGuarantors/application/${applicationId}`
    );
    return response.data;
};

export const getLoanGuarantorById = async (guarantorId) => {
    const response = await api.get(`/LoanGuarantors/${guarantorId}`);
    return response.data;
};

export const updateLoanGuarantor = async (guarantorId, data) => {
    const response = await api.put(`/LoanGuarantors/${guarantorId}`, data);
    return response.data;
};

export const deleteLoanGuarantor = async (guarantorId) => {
    const response = await api.delete(`/LoanGuarantors/${guarantorId}`);
    return response.data;
};

export const verifyLoanGuarantor = async (guarantorId, data) => {
    const response = await api.put(
        `/LoanGuarantors/${guarantorId}/verify`,
        data
    );
    return response.data;
};

export const rejectLoanGuarantor = async (guarantorId, data) => {
    const response = await api.put(
        `/LoanGuarantors/${guarantorId}/reject`,
        data
    );
    return response.data;
};