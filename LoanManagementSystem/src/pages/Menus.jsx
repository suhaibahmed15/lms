import { useCallback, useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";
import MenuTable from "../modals/menus/MenuTable";

import {
    getAllMenus,
    createMenu,
    updateMenu,
    deleteMenu
} from "../services/menuService";

import { getMyRole } from "../services/roleService";
import { getEffectivePermissionsByUser } from "../services/permissionService";
import { getCurrentUser, notifyMenusUpdated } from "../utils/auth";

function Menus() {
    const user = getCurrentUser();

    const [menus, setMenus] = useState([]);
    const [parentMenuOptions, setParentMenuOptions] = useState([]);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [parentFilter, setParentFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("displayOrder");
    const [sortDirection, setSortDirection] = useState("asc");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0 });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
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

    const fetchParentOptions = useCallback(async () => {
        try {
            const response = await getAllMenus({
                pageNumber: 1,
                pageSize: 100,
                parentMenuId: 0
            });
            const data = Array.isArray(response) ? response : response.data || [];
            setParentMenuOptions(data);
        } catch {
            setParentMenuOptions([]);
        }
    }, []);

    const fetchMenus = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = { pageNumber, pageSize, sortBy, sortDirection };
            if (search) params.search = search;
            if (statusFilter !== "") params.isActive = statusFilter === "true";
            if (parentFilter !== "") params.parentMenuId = Number(parentFilter);

            const response = await getAllMenus(params);
            const menuData = (Array.isArray(response) ? response : response.data || []).filter(
                (m) => m.key?.toUpperCase() !== "AUDIT_LOGS"
            );

            setMenus(menuData);
            setTotalRecords(response.totalRecords ?? menuData.length);
            setTotalPages(response.totalPages ?? (menuData.length > 0 ? 1 : 0));

            const activeCount = response.activeCount ?? menuData.filter((m) => m.isActive).length;
            const inactiveCount = response.inactiveCount ?? menuData.filter((m) => !m.isActive).length;
            setSummary({ total: activeCount + inactiveCount, active: activeCount, inactive: inactiveCount });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load menus.");
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, search, statusFilter, parentFilter, sortBy, sortDirection]);

    useEffect(() => {
        fetchParentOptions();
    }, [fetchParentOptions]);

    useEffect(() => {
        fetchMenus();
    }, [fetchMenus]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
        setPageNumber(1);
    };

    const handleSubmit = async (menuData) => {
        if (selectedMenu) {
            await updateMenu(selectedMenu.id, menuData);
        } else {
            await createMenu(menuData);
        }

        await Promise.all([fetchMenus(), fetchParentOptions()]);
        notifyMenusUpdated();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to deactivate this menu?")) return;

        try {
            await deleteMenu(id);
            await Promise.all([fetchMenus(), fetchParentOptions()]);
            notifyMenusUpdated();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete menu.");
        }
    };

    return (
        <MainLayout user={user}>
            <MenuTable
                menus={menus}
                parentMenuOptions={parentMenuOptions}
                summary={summary}
                loading={loading}
                error={error}
                canManage={canManage}
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                parentFilter={parentFilter}
                onParentFilterChange={(val) => {
                    setParentFilter(val);
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
                onRefresh={fetchMenus}
                onAdd={() => {
                    setSelectedMenu(null);
                    setIsModalOpen(true);
                }}
                onEdit={(menu) => {
                    setSelectedMenu(menu);
                    setIsModalOpen(true);
                }}
                onDelete={handleDelete}
                isModalOpen={isModalOpen}
                onCloseModal={() => setIsModalOpen(false)}
                onSubmitModal={handleSubmit}
                selectedMenu={selectedMenu}
            />
        </MainLayout>
    );
}

export default Menus;
