import { useCallback, useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import RoleTable from "../modals/roles/RoleTable";
import RoleModal from "../modals/roles/RoleModal";

import {
    getAllRoles,
    createRole,
    updateRole,
    deleteRole,
    getMyRole
} from "../services/roleService";

import { getEffectivePermissionsByUser } from "../services/permissionService";
import { getCurrentUser } from "../utils/auth";

export default function Roles() {
    const user = getCurrentUser();

    const [roles, setRoles] = useState([]);
    const [summary, setSummary] = useState({ total: 0, active: 0 });

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
    const [selectedRole, setSelectedRole] = useState(null);

    const [canManage, setCanManage] = useState(false);
    const [canDelete, setCanDelete] = useState(false);

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

                setCanManage(isAdmin || permKeys.has("ROLE_MANAGE"));
                setCanDelete(isAdmin || permKeys.has("ROLE_DELETE"));
            } catch {
                setCanManage(false);
                setCanDelete(false);
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

    const fetchRoles = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                pageNumber,
                pageSize,
                sortBy,
                sortDirection
            };

            if (search) params.search = search;
            if (statusFilter !== "") params.isActive = statusFilter === "true";

            const response = await getAllRoles(params);
            const roleList = response.data || [];

            setRoles(roleList);
            setTotalRecords(response.totalRecords ?? roleList.length);
            setTotalPages(response.totalPages ?? (roleList.length > 0 ? 1 : 0));

            const total = response.totalCount ?? response.totalRecords ?? roleList.length;
            const active = response.activeCount ?? roleList.filter((r) => r.isActive).length;

            setSummary({ total, active });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load roles. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, sortBy, sortDirection, search, statusFilter]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
        setPageNumber(1);
    };

    const handleAddRole = () => {
        setSelectedRole(null);
        setIsModalOpen(true);
        setSuccess("");
    };

    const handleEditRole = (role) => {
        setSelectedRole(role);
        setIsModalOpen(true);
        setSuccess("");
    };

    const handleSubmit = async (roleData) => {
        if (selectedRole) {
            await updateRole(selectedRole.id, roleData);
            setSuccess("Role updated successfully.");
        } else {
            await createRole(roleData);
            setSuccess("Role created successfully.");
        }

        setIsModalOpen(false);
        setSelectedRole(null);
        await fetchRoles();
    };

    const handleDeleteRole = async (role) => {
        if (role.key === "ADMIN") {
            alert("The Admin role cannot be deleted.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${role.name}?`
        );
        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");
            await deleteRole(role.id);
            setSuccess("Role deleted successfully.");
            await fetchRoles();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete role."
            );
        }
    };

    return (
        <MainLayout user={user}>
            <RoleTable
                roles={roles}
                loading={loading}
                error={error}
                success={success}
                canManage={canManage}
                canDelete={canDelete}
                summary={summary}
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
                onPageSizeChange={(val) => {
                    setPageSize(val);
                    setPageNumber(1);
                }}
                onRefresh={fetchRoles}
                onAdd={handleAddRole}
                onEdit={handleEditRole}
                onDelete={handleDeleteRole}
            />

            <RoleModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedRole(null);
                }}
                onSubmit={handleSubmit}
                selectedRole={selectedRole}
            />
        </MainLayout>
    );
}
