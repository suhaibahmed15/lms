import { useCallback, useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import StatusTable from "../modals/statuses/StatusTable";
import StatusModal from "../modals/statuses/StatusModal";
import {
    getAllStatuses,
    createStatus,
    updateStatus,
    changeStatusActive,
    deleteStatus
} from "../services/statusService";
import { getMyRole } from "../services/roleService";
import { getEffectivePermissionsByUser } from "../services/permissionService";
import { getCurrentUser, getUserId } from "../utils/auth";

export default function Statuses() {
    const user = getCurrentUser();

    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [modalError, setModalError] = useState("");

    const [categoryFilter, setCategoryFilter] = useState("");
    const [canManage, setCanManage] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);

    const loadPermissions = useCallback(async () => {
        try {
            const userId = getUserId();
            if (!userId) return;

            const [roleRes, permRes] = await Promise.all([
                getMyRole(),
                getEffectivePermissionsByUser(userId)
            ]);

            const roleKey = (roleRes?.data?.key || roleRes?.key || "").toUpperCase();
            const isAdmin = roleKey === "ADMIN";
            const perms = Array.isArray(permRes?.data) ? permRes.data : Array.isArray(permRes) ? permRes : [];
            const permKeys = perms.map((p) => p.key?.toUpperCase());

            setCanManage(isAdmin || permKeys.includes("STATUS_MANAGE"));
        } catch {
            setCanManage(false);
        }
    }, []);

    const fetchStatuses = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const res = await getAllStatuses();
            const list = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res?.items)
                    ? res.items
                    : Array.isArray(res)
                        ? res
                        : [];

            const filtered = categoryFilter
                ? list.filter((s) => s.category?.toLowerCase() === categoryFilter.toLowerCase())
                : list;

            setStatuses(filtered);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load statuses.");
            setStatuses([]);
        } finally {
            setLoading(false);
        }
    }, [categoryFilter]);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);

    const handleAdd = () => {
        setSelectedStatus(null);
        setModalError("");
        setIsModalOpen(true);
    };

    const handleEdit = (status) => {
        setSelectedStatus(status);
        setModalError("");
        setIsModalOpen(true);
    };

    const handleDelete = async (status) => {
        if (!window.confirm(`Are you sure you want to delete status "${status.name}"?`)) return;

        try {
            setLoading(true);
            await deleteStatus(status.id);
            setSuccess("Status deleted successfully.");
            await fetchStatuses();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete status.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (status) => {
        try {
            setLoading(true);
            await changeStatusActive(status.id, { isActive: !status.isActive });
            setSuccess(`Status "${status.name}" ${status.isActive ? "deactivated" : "activated"}.`);
            await fetchStatuses();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to toggle status state.");
        } finally {
            setLoading(false);
        }
    };

    const handleModalSubmit = async (formData) => {
        try {
            setModalLoading(true);
            setModalError("");

            if (selectedStatus) {
                await updateStatus(selectedStatus.id, formData);
                setSuccess("Status updated successfully.");
            } else {
                await createStatus(formData);
                setSuccess("Status created successfully.");
            }

            setIsModalOpen(false);
            setSelectedStatus(null);
            await fetchStatuses();
        } catch (err) {
            setModalError(err.response?.data?.message || "Operation failed.");
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <MainLayout user={user}>
            <div className="space-y-6">
                <StatusTable
                    statuses={statuses}
                    loading={loading}
                    error={error}
                    success={success}
                    categoryFilter={categoryFilter}
                    onCategoryFilterChange={setCategoryFilter}
                    onRefresh={fetchStatuses}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    canManage={canManage}
                />

                <StatusModal
                    isOpen={isModalOpen}
                    status={selectedStatus}
                    onClose={() => { if (!modalLoading) setIsModalOpen(false); }}
                    onSubmit={handleModalSubmit}
                    loading={modalLoading}
                    error={modalError}
                />
            </div>
        </MainLayout>
    );
}
