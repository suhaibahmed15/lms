import { useCallback, useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";
import PermissionTable from "../modals/permissions/PermissionTable";

import {
    getAllPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    getEffectivePermissionsByUser
} from "../services/permissionService";

import { getMyRole } from "../services/roleService";
import { getCurrentUser } from "../utils/auth";

function Permissions() {
    const user = getCurrentUser();

    const [permissions, setPermissions] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [canManage, setCanManage] = useState(false);

    useEffect(() => {
        const fetchCurrentUserAccess = async () => {
            const currentUserId = user?.userId ?? user?.id;
            if (!currentUserId) return;

            try {
                const [roleResp, permsResp] = await Promise.all([
                    getMyRole().catch(() => null),
                    getEffectivePermissionsByUser(currentUserId).catch(() => [])
                ]);

                const isAdmin = roleResp?.data?.key?.toUpperCase() === "ADMIN";
                const permList = Array.isArray(permsResp) ? permsResp : permsResp?.data || [];
                const permKeys = new Set(permList.map((p) => p.key?.toUpperCase()));

                setCanManage(isAdmin || permKeys.has("PERMISSION_MANAGE"));
            } catch {
                setCanManage(false);
            }
        };

        fetchCurrentUserAccess();
    }, [user?.userId, user?.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPageNumber(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const fetchPermissions = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = { pageNumber, pageSize, sortBy, sortDirection };
            if (search) params.search = search;
            if (statusFilter !== "") params.isActive = statusFilter === "true";

            const response = await getAllPermissions(params);
            const data = (Array.isArray(response) ? response : response.data || []).filter(
                (p) => !p.key?.toUpperCase().startsWith("AUDIT_LOG")
            );

            setPermissions(data);
            setTotalRecords(response.totalRecords ?? data.length);
            setTotalPages(response.totalPages ?? (data.length > 0 ? 1 : 0));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load permissions.");
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, search, statusFilter, sortBy, sortDirection]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
        setPageNumber(1);
    };

    const handleSubmit = async (permissionData) => {
        setSuccess("");

        if (selectedPermission) {
            await updatePermission(selectedPermission.id, permissionData);
            setSuccess("Permission updated successfully.");
        } else {
            await createPermission(permissionData);
            setSuccess("Permission created successfully.");
        }

        setSelectedPermission(null);
        await fetchPermissions();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to deactivate this permission?")) return;

        try {
            setError("");
            setSuccess("");
            await deletePermission(id);
            setSuccess("Permission deactivated successfully.");
            await fetchPermissions();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete permission.");
        }
    };

    return (
        <MainLayout user={user}>
            <PermissionTable
                permissions={permissions}
                loading={loading}
                error={error}
                success={success}
                canManage={canManage}
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                statusFilter={statusFilter}
                onStatusFilterChange={(val) => {
                    setStatusFilter(val);
                    setPageNumber(1);
                }}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                pageNumber={pageNumber}
                pageSize={pageSize}
                totalRecords={totalRecords}
                totalPages={totalPages}
                onPageChange={setPageNumber}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPageNumber(1);
                }}
                onRefresh={fetchPermissions}
                onAdd={() => {
                    setSelectedPermission(null);
                    setIsModalOpen(true);
                    setSuccess("");
                }}
                onEdit={(item) => {
                    setSelectedPermission(item);
                    setIsModalOpen(true);
                    setSuccess("");
                }}
                onDelete={handleDelete}
                isModalOpen={isModalOpen}
                onCloseModal={() => {
                    setIsModalOpen(false);
                    setSelectedPermission(null);
                }}
                onSubmitModal={handleSubmit}
                selectedPermission={selectedPermission}
            />
        </MainLayout>
    );
}

export default Permissions;