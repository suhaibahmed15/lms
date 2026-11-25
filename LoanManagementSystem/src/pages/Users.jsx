import { useCallback, useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import UserTable from "../modals/users/UserTable";
import UserModal from "../modals/users/UserModal";

import {
    getAllUsers,
    createUser,
    deleteUser
} from "../services/userService";

import { getAllRoles, getMyRole } from "../services/roleService";
import { getEffectivePermissionsByUser } from "../services/permissionService";
import { getCurrentUser } from "../utils/auth";

export default function Users() {
    const user = getCurrentUser();

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0 });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [canCreate, setCanCreate] = useState(false);
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

                const roleKey = roleResp?.data?.key?.toUpperCase();
                const isAdmin = roleKey === "ADMIN";

                const permList = Array.isArray(permsResp)
                    ? permsResp
                    : permsResp?.data || [];
                const permKeys = new Set(
                    permList.map((p) => p.key?.toUpperCase())
                );

                setCanCreate(isAdmin || permKeys.has("USER_CREATE"));
                setCanDelete(isAdmin || permKeys.has("USER_DELETE"));
            } catch {
                setCanCreate(false);
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
            const rolesResponse = await getAllRoles({ pageNumber: 1, pageSize: 100 });
            const roleData = Array.isArray(rolesResponse)
                ? rolesResponse
                : rolesResponse.data || [];
            setRoles(roleData);
        } catch {
            setRoles([]);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
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
            if (roleFilter) params.roleId = Number(roleFilter);
            if (statusFilter !== "") params.isActive = statusFilter === "true";

            const response = await getAllUsers(params);
            const userData = Array.isArray(response)
                ? response
                : response.data || [];

            setUsers(userData);
            setTotalRecords(response.totalRecords ?? userData.length);
            setTotalPages(response.totalPages ?? (userData.length > 0 ? 1 : 0));

            const activeCount = response.activeCount ?? userData.filter((u) => u.isActive).length;
            const inactiveCount = response.inactiveCount ?? userData.filter((u) => !u.isActive).length;
            setSummary({
                total: activeCount + inactiveCount,
                active: activeCount,
                inactive: inactiveCount
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load users."
            );
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, search, roleFilter, statusFilter, sortBy, sortDirection]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
        setPageNumber(1);
    };

    const handleCreateUser = async (userData) => {
        await createUser(userData);
        setIsModalOpen(false);
        await fetchUsers();
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to deactivate this user? They will not be able to log in."
        );
        if (!confirmed) return;

        try {
            await deleteUser(id);
            await fetchUsers();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to deactivate user."
            );
        }
    };

    return (
        <MainLayout user={user}>
            <UserTable
                users={users}
                roles={roles}
                loading={loading}
                error={error}
                canCreate={canCreate}
                canDelete={canDelete}
                summary={summary}
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                roleFilter={roleFilter}
                onRoleFilterChange={(val) => {
                    setRoleFilter(val);
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
                onPageSizeChange={(val) => {
                    setPageSize(val);
                    setPageNumber(1);
                }}
                onRefresh={fetchUsers}
                onAdd={() => setIsModalOpen(true)}
                onDelete={handleDelete}
            />

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateUser}
                roles={roles}
            />
        </MainLayout>
    );
}
