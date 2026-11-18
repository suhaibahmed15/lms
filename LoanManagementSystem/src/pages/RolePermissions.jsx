import { useCallback, useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";
import RolePermissionTable from "../modals/rolePermissions/RolePermissionTable";

import {
    getAllRolePermissions,
    assignPermissionToRole,
    removeRolePermission,
    getAllPermissions,
    getEffectivePermissionsByUser
} from "../services/permissionService";

import { getAllRoles, getMyRole } from "../services/roleService";
import { getCurrentUser, notifyMenusUpdated } from "../utils/auth";

function RolePermissions() {
    const user = getCurrentUser();

    const [rolePermissions, setRolePermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [permissionFilter, setPermissionFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("permissionName");
    const [sortDirection, setSortDirection] = useState("asc");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const fetchLookups = useCallback(async () => {
        try {
            const [rolesResp, permsResp] = await Promise.all([
                getAllRoles({ pageNumber: 1, pageSize: 100 }).catch(() => ({ data: [] })),
                getAllPermissions({ pageNumber: 1, pageSize: 100, isActive: true }).catch(() => ({ data: [] }))
            ]);

            const roleList = Array.isArray(rolesResp) ? rolesResp : rolesResp.data || [];
            const permList = (Array.isArray(permsResp) ? permsResp : permsResp.data || []).filter(
                (p) => !p.key?.toUpperCase().startsWith("AUDIT_LOG")
            );

            setRoles(roleList);
            setPermissions(permList);
        } catch {
            setRoles([]);
            setPermissions([]);
        }
    }, []);

    const fetchRolePermissions = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = { pageNumber, pageSize, sortBy, sortDirection };
            if (search) params.search = search;
            if (roleFilter) params.roleId = Number(roleFilter);
            if (permissionFilter) params.permissionId = Number(permissionFilter);
            if (statusFilter !== "") params.isActive = statusFilter === "true";

            const response = await getAllRolePermissions(params);
            const data = (Array.isArray(response) ? response : response.data || []).filter(
                (item) => !item.permissionKey?.toUpperCase().startsWith("AUDIT_LOG")
            );

            setRolePermissions(data);
            setTotalRecords(response.totalRecords ?? data.length);
            setTotalPages(response.totalPages ?? (data.length > 0 ? 1 : 0));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load role permissions.");
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, search, roleFilter, permissionFilter, statusFilter, sortBy, sortDirection]);

    useEffect(() => {
        fetchLookups();
    }, [fetchLookups]);

    useEffect(() => {
        fetchRolePermissions();
    }, [fetchRolePermissions]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
        setPageNumber(1);
    };

    const handleAssign = async (payload) => {
        setSuccess("");
        await assignPermissionToRole(payload);
        setSuccess("Permission assigned to role successfully.");
        await fetchRolePermissions();
        notifyMenusUpdated();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this role permission assignment?")) return;

        try {
            setError("");
            setSuccess("");
            await removeRolePermission(id);
            setSuccess("Role permission assignment removed successfully.");
            await fetchRolePermissions();
            notifyMenusUpdated();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to remove role permission assignment.");
        }
    };

    return (
        <MainLayout user={user}>
            <RolePermissionTable
                rolePermissions={rolePermissions}
                roles={roles}
                permissions={permissions}
                loading={loading}
                error={error}
                success={success}
                canManage={canManage}
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                roleFilter={roleFilter}
                onRoleFilterChange={(val) => {
                    setRoleFilter(val);
                    setPageNumber(1);
                }}
                permissionFilter={permissionFilter}
                onPermissionFilterChange={(val) => {
                    setPermissionFilter(val);
                    setPageNumber(1);
                }}
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
                onRefresh={fetchRolePermissions}
                onAdd={() => {
                    setIsModalOpen(true);
                    setSuccess("");
                }}
                onDelete={handleDelete}
                isModalOpen={isModalOpen}
                onCloseModal={() => setIsModalOpen(false)}
                onSubmitModal={handleAssign}
            />
        </MainLayout>
    );
}

export default RolePermissions;