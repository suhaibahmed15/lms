
import api from "./api";

// Get Dashboard Summary
export const getDashboardSummary = async () => {
    const response = await api.get("/Dashboard/summary");

    return response.data;
};
