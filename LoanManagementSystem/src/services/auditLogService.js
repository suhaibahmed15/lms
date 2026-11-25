import api from "./api";

// Get paginated audit logs (Admin only)
export const getAuditLogs = async (params = {}) => {
    const response = await api.get("/AuditLogs", { params });
    return response.data;
};

export default {
    getAuditLogs
};
