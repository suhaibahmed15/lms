import { useCallback, useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import UserPermissionTable from "../modals/userPermissions/UserPermissionTable";
import UserPermissionModal from "../modals/userPermissions/UserPermissionModal";

import {
    getAllUserPermissions,
    assignPermissionToUser,
    revokeUserPermission,
    getAllPermissions,
    getEffectivePermissionsByUser
} from "../services/permissionService";

import { getAllUsers } from "../services/userService";
import { getMyRole } from "../services/roleService";
import { getCurrentUser, notifyMenusUpdated } from "../utils/auth";

export default function UserPermissions() {
    const user = getCurrentUser();

    const [assignments, setAssignments] = useState([]);
    const [users, setUsers] = useState([]);
    const [permissions, setPermissions] = useState([]);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [filterUserId, setFilterUserId] = useState("");
    const [filterPermissionId, setFilterPermissionId] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("assignedAt");
    const [sortDirection, setSortDirection] = useState("desc");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [summary, setSummary] = useState({ total: 0, active: 0, revoked: 0 });

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

    const extractData = (res) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        return [];
    };

    const fetchLookups = useCallback(async () => {
        try {
            const [usersResponse, permissionsResponse] = await Promise.all([
                getAllUsers({ pageNumber: 1, pageSize: 100 }),
                getAllPermissions({ pageNumber: 1, pageSize: 100, isActive: true })
            ]);

            setUsers(extractData(usersResponse));
            setPermissions(extractData(permissionsResponse));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load users and permissions."
            );
        }
    }, []);

    const fetchAssignments = useCallback(async () => {
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
            if (filterUserId) params.userId = Number(filterUserId);
            if (filterPermissionId) params.permissionId = Number(filterPermissionId);
            if (statusFilter !== "") params.isActive = statusFilter === "true";

            const response = await getAllUserPermissions(params);
            const data = extractData(response);

            setAssignments(data);
            setTotalRecords(response.totalRecords ?? data.length);
            setTotalPages(response.totalPages ?? (data.length > 0 ? 1 : 0));

            const activeCount = response.activeCount ?? data.filter((a) => a.isActive).length;
            const revokedCount = response.revokedCount ?? data.filter((a) => !a.isActive).length;
            setSummary({
                total: activeCount + revokedCount,
                active: activeCount,
                revoked: revokedCount
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load user permissions."
            );
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, sortBy, sortDirection, search, filterUserId, filterPermissionId, statusFilter]);

    useEffect(() => {
        fetchLookups();
    }, [fetchLookups]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
        setPageNumber(1);
    };

    const handleAssign = async ({ userId: targetUserId, permissionId }) => {
        const assignedByUserId = user?.userId ?? user?.id;

        await assignPermissionToUser({
            userId: targetUserId,
            permissionId,
            assignedByUserId: assignedByUserId ? Number(assignedByUserId) : null
        });

        setSuccess("Permission assigned successfully.");
        await fetchAssignments();
        notifyMenusUpdated();
    };

    const handleRevoke = async (assignmentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to revoke this permission?"
        );
        if (!confirmed) return;

        const revokedByUserId = user?.userId ?? user?.id;

        try {
            setError("");
            setSuccess("");

            await revokeUserPermission(assignmentId, revokedByUserId);
            setSuccess("Permission revoked successfully.");
            await fetchAssignments();
            notifyMenusUpdated();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to revoke permission."
            );
        }
    };

    return (
        <MainLayout user={user}>
            <UserPermissionTable
                assignments={assignments}
                users={users}
                permissions={permissions}
                loading={loading}
                error={error}
                success={success}
                canManage={canManage}
                summary={summary}
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                filterUserId={filterUserId}
                onFilterUserIdChange={(val) => {
                    setFilterUserId(val);
                    setPageNumber(1);
                }}
                filterPermissionId={filterPermissionId}
                onFilterPermissionIdChange={(val) => {
                    setFilterPermissionId(val);
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
                onRefresh={fetchAssignments}
                onAdd={() => setIsModalOpen(true)}
                onRevoke={handleRevoke}
            />

            <UserPermissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAssign}
                users={users}
                permissions={permissions}
            />
        </MainLayout>
    );
}
