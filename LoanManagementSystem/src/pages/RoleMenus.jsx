import { useCallback, useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";
import RoleMenuTable from "../modals/roleMenus/RoleMenuTable";

import {
    getAllRoleMenus,
    getAllMenus,
    assignRoleMenu,
    removeRoleMenu
} from "../services/menuService";

import { getAllRoles, getMyRole } from "../services/roleService";
import { getEffectivePermissionsByUser } from "../services/permissionService";
import { getCurrentUser, notifyMenusUpdated } from "../utils/auth";

function RoleMenus() {
    const user = getCurrentUser();

    const [roleMenus, setRoleMenus] = useState([]);
    const [roles, setRoles] = useState([]);
    const [menus, setMenus] = useState([]);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [sortBy, setSortBy] = useState("displayOrder");
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

                setCanManage(isAdmin || permKeys.has("MENU_MANAGE"));
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
            const [rolesResp, menusResp] = await Promise.all([
                getAllRoles({ pageNumber: 1, pageSize: 100 }).catch(() => ({ data: [] })),
                getAllMenus({ pageNumber: 1, pageSize: 100, isActive: true }).catch(() => ({ data: [] }))
            ]);

            const roleList = Array.isArray(rolesResp) ? rolesResp : rolesResp.data || [];
            const menuList = Array.isArray(menusResp) ? menusResp : menusResp.data || [];

            setRoles(roleList);
            setMenus(menuList);
        } catch {
            setRoles([]);
            setMenus([]);
        }
    }, []);

    const fetchRoleMenus = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = { pageNumber, pageSize, sortBy, sortDirection };
            if (search) params.search = search;
            if (roleFilter) params.roleId = Number(roleFilter);

            const response = await getAllRoleMenus(params);
            const data = Array.isArray(response) ? response : response.data || [];

            setRoleMenus(data);
            setTotalRecords(response.totalRecords ?? data.length);
            setTotalPages(response.totalPages ?? (data.length > 0 ? 1 : 0));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load role menus.");
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, search, roleFilter, sortBy, sortDirection]);

    useEffect(() => {
        fetchLookups();
    }, [fetchLookups]);

    useEffect(() => {
        fetchRoleMenus();
    }, [fetchRoleMenus]);

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
        await assignRoleMenu(payload);
        setSuccess("Menu assigned to role successfully.");
        await fetchRoleMenus();
        notifyMenusUpdated();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this role menu assignment?")) return;

        try {
            setError("");
            setSuccess("");
            await removeRoleMenu(id);
            setSuccess("Role menu assignment removed successfully.");
            await fetchRoleMenus();
            notifyMenusUpdated();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to remove role menu assignment.");
        }
    };

    return (
        <MainLayout user={user}>
            <RoleMenuTable
                roleMenus={roleMenus}
                roles={roles}
                menus={menus}
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
                onRefresh={fetchRoleMenus}
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

export default RoleMenus;