import api from "./api";

// Get all loan types (supports pagination, search, sorting, isActive filter)
export const getAllLoanTypes = async (params = {}) => {
    const response = await api.get("/LoanTypes", { params });
    return response.data;
};

// Get all active loan types for dropdowns (e.g. loan application form)
export const getActiveLoanTypes = async () => {
    const response = await api.get("/LoanTypes/active");
    return response.data;
};

// Get loan type by ID
export const getLoanTypeById = async (id) => {
    const response = await api.get(`/LoanTypes/${id}`);
    return response.data;
};

// Create a new loan type (requires LOAN_TYPE_MANAGE)
export const createLoanType = async (data) => {
    const response = await api.post("/LoanTypes", data);
    return response.data;
};

// Update an existing loan type (requires LOAN_TYPE_MANAGE)
export const updateLoanType = async (id, data) => {
    const response = await api.put(`/LoanTypes/${id}`, data);
    return response.data;
};

// Delete a loan type (requires LOAN_TYPE_MANAGE)
export const deleteLoanType = async (id) => {
    const response = await api.delete(`/LoanTypes/${id}`);
    return response.data;
};

// Toggle active status (requires LOAN_TYPE_MANAGE)
export const changeLoanTypeStatus = async (id, isActive) => {
    const response = await api.patch(`/LoanTypes/${id}/status?isActive=${isActive}`);
    return response.data;
};
