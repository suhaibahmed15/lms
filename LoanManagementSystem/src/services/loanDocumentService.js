
import api from "./api";

// Upload a document against a loan application
export const uploadLoanDocument = async (documentData) => {
    const response = await api.post(
        "/LoanDocuments",
        documentData
    );

    return response.data;
};

// Get documents by loan application ID
export const getDocumentsByApplication = async (applicationId) => {
    const response = await api.get(
        `/LoanDocuments/application/${applicationId}`
    );

    return response.data;
};

// Get single document details
export const getLoanDocumentById = async (documentId) => {
    const response = await api.get(`/LoanDocuments/${documentId}`);
    return response.data;
};

// Download a document
export const downloadLoanDocument = async (documentId) => {
    const response = await api.get(
        `/LoanDocuments/${documentId}/download`,
        {
            responseType: "blob"
        }
    );

    return response;
};

// Verify a document
export const verifyLoanDocument = async (documentId, data) => {
    const response = await api.put(
        `/LoanDocuments/${documentId}/verify`,
        data
    );

    return response.data;
};

// Reject a document
export const rejectLoanDocument = async (documentId, data) => {
    const response = await api.put(
        `/LoanDocuments/${documentId}/reject`,
        data
    );

    return response.data;
};
