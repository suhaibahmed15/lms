import { useCallback, useEffect, useState } from "react";
import { UserRound, RefreshCw, ShieldCheck } from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import UserMenuTable from "../modals/userMenus/UserMenuTable";
import UserMenuAssignSection from "../modals/userMenus/UserMenuAssignSection";
import { Button } from "../components/common";

import { getCurrentUser, notifyMenusUpdated } from "../utils/auth";
import { getAllUsers } from "../services/userService";
import { getMyRole } from "../services/roleService";
import { getEffectivePermissionsByUser } from "../services/permissionService";

import {
    getAllMenus,
    getMenusByRole,
    getUserMenuAssignments,
    assignUserMenu,
    removeUserMenu
} from "../services/menuService";

export default function UserMenus() {
    const user = getCurrentUser();

    const [users, setUsers] = useState([]);
    const [menus, setMenus] = useState([]);

    const [selectedUserId, setSelectedUserId] = useState("");

    const [roleMenus, setRoleMenus] = useState([]);
    const [userMenus, setUserMenus] = useState([]);
    const [allUserAssignedMenuIds, setAllUserAssignedMenuIds] = useState([]);

    // Paging/search/sort for Individual User Menu Assignments table
    const [assignedSearchInput, setAssignedSearchInput] = useState("");
    const [assignedSearch, setAssignedSearch] = useState("");
    const [assignedSortBy, setAssignedSortBy] = useState("displayOrder");
    const [assignedSortDirection, setAssignedSortDirection] = useState("asc");
    const [assignedPageNumber, setAssignedPageNumber] = useState(1);
    const [assignedPageSize, setAssignedPageSize] = useState(5);
    const [assignedTotalRecords, setAssignedTotalRecords] = useState(0);
    const [assignedTotalPages, setAssignedTotalPages] = useState(0);

    const [selectedMenuIds, setSelectedMenuIds] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
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

    const getArray = (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setAssignedSearch(assignedSearchInput.trim());
            setAssignedPageNumber(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [assignedSearchInput]);

    // Initial load: users and menus
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError("");

                const [usersResponse, menusResponse] = await Promise.all([
                    getAllUsers({ pageNumber: 1, pageSize: 100 }),
                    getAllMenus({ pageNumber: 1, pageSize: 100 })
                ]);

                const userList = getArray(usersResponse).filter(
                    (u) => u.isActive && !u.isDeleted
                );
                const menuList = getArray(menusResponse).filter(
                    (m) => m.isActive && !m.isDeleted
                );

                setUsers(userList);
                setMenus(menuList);

                if (userList.length > 0) {
                    setSelectedUserId(String(userList[0].id));
                }
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load users and menus. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const selectedUser = users.find(
        (item) => String(item.id) === String(selectedUserId)
    );

    // Fetch user menu data
    const fetchUserMenuData = useCallback(
        async (userId, isManualRefresh = false) => {
            if (!userId) {
                setRoleMenus([]);
                setUserMenus([]);
                setAllUserAssignedMenuIds([]);
                setSelectedMenuIds([]);
                setAssignedTotalRecords(0);
                setAssignedTotalPages(0);
                return;
            }

            const targetUser = users.find((item) => String(item.id) === String(userId));
            if (!targetUser) return;

            try {
                if (isManualRefresh) {
                    setRefreshing(true);
                }

                setError("");

                const pagedParams = {
                    pageNumber: assignedPageNumber,
                    pageSize: assignedPageSize,
                    sortBy: assignedSortBy,
                    sortDirection: assignedSortDirection
                };

                if (assignedSearch) pagedParams.search = assignedSearch;

                const [roleMenusResponse, userMenusPagedResp, userMenusAllResp] = await Promise.all([
                    targetUser.roleId ? getMenusByRole(targetUser.roleId) : Promise.resolve([]),
                    getUserMenuAssignments(userId, pagedParams),
                    getUserMenuAssignments(userId, { pageNumber: 1, pageSize: 500 })
                ]);

                const activeRoleMenus = getArray(roleMenusResponse).filter(
                    (item) => item.isActive !== false && !item.isDeleted
                );

                const pagedUserMenus = getArray(userMenusPagedResp);
                const allUserMenus = getArray(userMenusAllResp);

                setRoleMenus(activeRoleMenus);
                setUserMenus(pagedUserMenus);
                setAllUserAssignedMenuIds(
                    allUserMenus.map((item) => Number(item.menuId))
                );

                setAssignedTotalRecords(
                    userMenusPagedResp?.totalRecords ?? pagedUserMenus.length
                );
                setAssignedTotalPages(
                    userMenusPagedResp?.totalPages ?? (pagedUserMenus.length > 0 ? 1 : 0)
                );

                setSelectedMenuIds([]);

                if (isManualRefresh) {
                    setSuccess("User menu assignments refreshed successfully.");
                }
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to fetch user menu assignments."
                );
            } finally {
                if (isManualRefresh) {
                    setRefreshing(false);
                }
            }
        },
        [users, assignedPageNumber, assignedPageSize, assignedSortBy, assignedSortDirection, assignedSearch]
    );

    useEffect(() => {
        if (selectedUserId) {
            fetchUserMenuData(selectedUserId);
        }
    }, [selectedUserId, fetchUserMenuData]);

    const handleAssignedSort = (column) => {
        if (assignedSortBy === column) {
            setAssignedSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setAssignedSortBy(column);
            setAssignedSortDirection("asc");
        }
        setAssignedPageNumber(1);
    };

    const handleMenuSelection = (menuId) => {
        const id = Number(menuId);
        setSelectedMenuIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleAssignMenus = async () => {
        if (!selectedUserId || selectedMenuIds.length === 0) return;

        try {
            setAssigning(true);
            setError("");
            setSuccess("");

            await Promise.all(
                selectedMenuIds.map((menuId) =>
                    assignUserMenu({
                        userId: Number(selectedUserId),
                        menuId: Number(menuId)
                    })
                )
            );

            setSuccess("Selected menus assigned successfully.");
            setSelectedMenuIds([]);
            await fetchUserMenuData(selectedUserId);
            notifyMenusUpdated();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to assign some menus. Please try again."
            );
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveMenu = async (assignmentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this menu assignment?"
        );
        if (!confirmed) return;

        try {
            setRemovingId(assignmentId);
            setError("");
            setSuccess("");

            await removeUserMenu(assignmentId);

            setSuccess("Menu assignment removed successfully.");
            await fetchUserMenuData(selectedUserId);
            notifyMenusUpdated();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to remove menu assignment."
            );
        } finally {
            setRemovingId(null);
        }
    };

    // Calculate available menus
    const inheritedMenuIds = new Set(roleMenus.map((item) => Number(item.menuId)));
    const assignedMenuIds = new Set(allUserAssignedMenuIds);

    const availableMenus = menus.filter((menu) => {
        const menuId = Number(menu.id);
        const isInherited = inheritedMenuIds.has(menuId);
        const isAssigned = assignedMenuIds.has(menuId);
        const matchesSearch =
            menu.name.toLowerCase().includes(search.toLowerCase()) ||
            menu.key.toLowerCase().includes(search.toLowerCase());

        return !isInherited && !isAssigned && matchesSearch;
    });

    const controlClass =
        "rounded-xl border border-pink-100 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-pink-500/70 focus:bg-pink-100/60 focus:ring-4 focus:ring-pink-500/10";

    return (
        <MainLayout user={user}>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                            User Menu Assignments
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            Manage additional menu access for individual users.
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => fetchUserMenuData(selectedUserId, true)}
                        disabled={!selectedUserId || refreshing || assigning}
                        loading={refreshing}
                        loadingText="Refreshing..."
                        icon={RefreshCw}
                    >
                        Refresh
                    </Button>
                </div>

                {/* Messages */}
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                        {success}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-pink-100 bg-white p-10 text-center text-zinc-500">
                        Loading users and menus...
                    </div>
                ) : (
                    <>
                        {/* User Selection */}
                        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-xl shadow-pink-500/5">
                            <div className="mb-4 flex items-center gap-2">
                                <UserRound size={20} className="text-pink-400" />
                                <h2 className="font-semibold text-zinc-900">Select User</h2>
                            </div>

                            <select
                                value={selectedUserId}
                                onChange={(e) => {
                                    setSelectedUserId(e.target.value);
                                    setAssignedPageNumber(1);
                                    setSuccess("");
                                }}
                                className={`${controlClass} block w-full max-w-md`}
                            >
                                <option value="">Select a user</option>
                                {users.map((item) => (
                                    <option key={item.id} value={String(item.id)}>
                                        {item.fullName} - {item.email}
                                    </option>
                                ))}
                            </select>

                            {selectedUser && (
                                <div className="mt-4 rounded-xl border border-pink-100 bg-pink-50/50 p-4">
                                    <p className="font-semibold text-zinc-900">
                                        {selectedUser.fullName}
                                    </p>
                                    <p className="mt-1 text-sm text-zinc-500">
                                        {selectedUser.email}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        User ID: {selectedUser.id} | Role: {selectedUser.roleName || `Role ${selectedUser.roleId}`}
                                    </p>
                                </div>
                            )}
                        </div>

                        {selectedUser && (
                            <>
                                {/* Inherited & Individual Tables */}
                                <UserMenuTable
                                    selectedUser={selectedUser}
                                    roleMenus={roleMenus}
                                    userMenus={userMenus}
                                    loading={loading}
                                    refreshing={refreshing}
                                    canManage={canManage}
                                    removingId={removingId}
                                    assignedSearchInput={assignedSearchInput}
                                    onAssignedSearchChange={setAssignedSearchInput}
                                    assignedPageSize={assignedPageSize}
                                    onAssignedPageSizeChange={(val) => {
                                        setAssignedPageSize(val);
                                        setAssignedPageNumber(1);
                                    }}
                                    assignedSortBy={assignedSortBy}
                                    assignedSortDirection={assignedSortDirection}
                                    onAssignedSort={handleAssignedSort}
                                    assignedPageNumber={assignedPageNumber}
                                    assignedTotalPages={assignedTotalPages}
                                    assignedTotalRecords={assignedTotalRecords}
                                    onAssignedPageChange={setAssignedPageNumber}
                                    onRemove={handleRemoveMenu}
                                />

                                {/* Assign Additional Menus */}
                                {canManage && (
                                    <UserMenuAssignSection
                                        availableMenus={availableMenus}
                                        selectedMenuIds={selectedMenuIds}
                                        onToggleMenu={handleMenuSelection}
                                        search={search}
                                        onSearchChange={setSearch}
                                        onAssign={handleAssignMenus}
                                        assigning={assigning}
                                    />
                                )}
                            </>
                        )}

                        {!selectedUser && (
                            <div className="rounded-2xl border border-pink-100 bg-white p-10 text-center text-zinc-500">
                                No active users found. Please create a user first.
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}
