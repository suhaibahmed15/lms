import { useCallback, useEffect, useState } from "react";
import {
    UserRound,
    Menu as MenuIcon,
    Plus,
    Trash2,
    RefreshCw,
    ShieldCheck,
    CheckCircle,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";

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

function UserMenus() {
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

    const fetchInitialData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const [usersResponse, menusResponse] = await Promise.all([
                getAllUsers({ pageNumber: 1, pageSize: 100, isActive: true }),
                getAllMenus({ pageNumber: 1, pageSize: 100, isActive: true })
            ]);

            const usersData = getArray(usersResponse);
            const menusData = getArray(menusResponse)
                .filter((m) => m.key?.toUpperCase() !== "AUDIT_LOGS")
                .sort((a, b) => a.displayOrder - b.displayOrder);

            setUsers(usersData);
            setMenus(menusData);

            setSelectedUserId((previous) => {
                const previousUserExists = usersData.some(
                    (item) => String(item.id) === String(previous)
                );

                if (previousUserExists) return previous;
                return usersData.length > 0 ? String(usersData[0].id) : "";
            });

            if (usersData.length === 0) {
                setRoleMenus([]);
                setUserMenus([]);
                setAllUserAssignedMenuIds([]);
                setSelectedMenuIds([]);
            }
        } catch (err) {
            console.error("Error loading users and menus:", err);
            setError(
                err.response?.data?.message ||
                "Unable to load users and menus."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUserMenuData = useCallback(async (userId, showRefreshing = false) => {
        if (!userId) {
            setRoleMenus([]);
            setUserMenus([]);
            setAllUserAssignedMenuIds([]);
            setSelectedMenuIds([]);
            return;
        }

        const selectedUserObj = users.find(
            (item) => String(item.id) === String(userId)
        );

        if (!selectedUserObj) return;

        try {
            if (showRefreshing) setRefreshing(true);

            setError("");
            setSelectedMenuIds([]);

            const assignedParams = {
                pageNumber: assignedPageNumber,
                pageSize: assignedPageSize,
                sortBy: assignedSortBy,
                sortDirection: assignedSortDirection
            };
            if (assignedSearch) assignedParams.search = assignedSearch;

            const [roleResponse, pagedUserResponse, allUserResponse] = await Promise.all([
                getMenusByRole(selectedUserObj.roleId),
                getUserMenuAssignments(userId, assignedParams),
                getUserMenuAssignments(userId, { pageNumber: 1, pageSize: 100 })
            ]);

            const pagedUserData = getArray(pagedUserResponse).filter(
                (m) => m.menuKey?.toUpperCase() !== "AUDIT_LOGS"
            );
            const allUserData = getArray(allUserResponse).filter(
                (m) => m.menuKey?.toUpperCase() !== "AUDIT_LOGS"
            );

            setRoleMenus(
                getArray(roleResponse).filter(
                    (m) => m.menuKey?.toUpperCase() !== "AUDIT_LOGS"
                )
            );
            setUserMenus(pagedUserData);
            setAssignedTotalRecords(pagedUserResponse.totalRecords ?? pagedUserData.length);
            setAssignedTotalPages(pagedUserResponse.totalPages ?? (pagedUserData.length > 0 ? 1 : 0));
            setAllUserAssignedMenuIds(
                allUserData.filter((item) => item.isActive).map((item) => Number(item.menuId))
            );
        } catch (err) {
            console.error("Error loading user menu assignments:", err);
            setRoleMenus([]);
            setUserMenus([]);
            setAllUserAssignedMenuIds([]);
            setError(
                err.response?.data?.message ||
                "Unable to load menu assignments."
            );
        } finally {
            setRefreshing(false);
        }
    }, [users, assignedPageNumber, assignedPageSize, assignedSearch, assignedSortBy, assignedSortDirection]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        if (selectedUserId && users.length > 0) {
            fetchUserMenuData(selectedUserId);
        }
    }, [selectedUserId, users, fetchUserMenuData]);

    const selectedUser = users.find(
        (item) => String(item.id) === String(selectedUserId)
    );

    const isRoleMenuAssigned = (menuId) => {
        return roleMenus.some((item) => Number(item.menuId) === Number(menuId));
    };

    const isUserMenuAssigned = (menuId) => {
        return allUserAssignedMenuIds.includes(Number(menuId));
    };

    const handleAssignedSort = (column) => {
        if (assignedSortBy === column) {
            setAssignedSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setAssignedSortBy(column);
            setAssignedSortDirection("asc");
        }
        setAssignedPageNumber(1);
    };

    const renderSortIcon = (column) => {
        if (assignedSortBy !== column) {
            return <ArrowUpDown size={14} className="text-zinc-500" />;
        }
        return assignedSortDirection === "asc"
            ? <ArrowUp size={14} className="text-orange-400" />
            : <ArrowDown size={14} className="text-orange-400" />;
    };

    const handleMenuSelection = (menuId) => {
        const id = Number(menuId);

        setSelectedMenuIds((previous) => {
            if (previous.includes(id)) {
                return previous.filter((item) => item !== id);
            }
            return [...previous, id];
        });
    };

    const handleAssignMenus = async () => {
        if (!selectedUserId || selectedMenuIds.length === 0) {
            setError("Please select at least one menu.");
            return;
        }

        try {
            setAssigning(true);
            setError("");
            setSuccess("");

            for (const menuId of selectedMenuIds) {
                await assignUserMenu({
                    userId: Number(selectedUserId),
                    menuId: Number(menuId)
                });
            }

            setSelectedMenuIds([]);
            await fetchUserMenuData(selectedUserId);
            notifyMenusUpdated();

            setSuccess("Selected menus assigned successfully.");
        } catch (err) {
            console.error("Error assigning menus:", err);
            await fetchUserMenuData(selectedUserId);
            setError(
                err.response?.data?.message ||
                "Unable to assign selected menus."
            );
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveMenu = async (assignmentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this individual menu assignment?"
        );

        if (!confirmed) return;

        try {
            setRemovingId(assignmentId);
            setError("");
            setSuccess("");

            await removeUserMenu(assignmentId);

            await fetchUserMenuData(selectedUserId);
            notifyMenusUpdated();

            setSuccess("Individual menu assignment removed successfully.");
        } catch (err) {
            console.error("Error removing menu:", err);
            setError(
                err.response?.data?.message ||
                "Unable to remove menu assignment."
            );
        } finally {
            setRemovingId(null);
        }
    };

    const availableMenus = menus.filter((menu) => {
        const alreadyAssigned =
            isRoleMenuAssigned(menu.id) ||
            isUserMenuAssigned(menu.id);

        const matchesSearch =
            menu.name.toLowerCase().includes(search.toLowerCase()) ||
            menu.key.toLowerCase().includes(search.toLowerCase());

        return !alreadyAssigned && matchesSearch;
    });

    const controlClass =
        "rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500/70 focus:bg-white/[0.10] focus:ring-4 focus:ring-orange-500/10";

    const startRecord = assignedTotalRecords === 0 ? 0 : (assignedPageNumber - 1) * assignedPageSize + 1;
    const endRecord = Math.min(assignedPageNumber * assignedPageSize, assignedTotalRecords);

    return (
        <MainLayout user={user}>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            User Menu Assignments
                        </h1>

                        <p className="mt-1 text-sm text-zinc-400">
                            Manage additional menu access for individual users.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchUserMenuData(selectedUserId, true)}
                        disabled={!selectedUserId || refreshing || assigning}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.10] hover:text-white disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />

                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {/* Messages */}
                {error && (
                    <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                        {success}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-10 text-center text-zinc-400">
                        Loading users and menus...
                    </div>
                ) : (
                    <>
                        {/* User Selection */}
                        <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                            <div className="mb-4 flex items-center gap-2">
                                <UserRound size={20} className="text-orange-400" />
                                <h2 className="font-semibold text-white">Select User</h2>
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
                                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                    <p className="font-semibold text-white">
                                        {selectedUser.fullName}
                                    </p>

                                    <p className="mt-1 text-sm text-zinc-400">
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
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-zinc-400">Role Menus</p>
                                            <ShieldCheck size={20} className="text-orange-400" />
                                        </div>

                                        <p className="mt-3 text-2xl font-bold text-white">
                                            {roleMenus.length}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-zinc-400">Individual Menus</p>
                                            <UserRound size={20} className="text-emerald-400" />
                                        </div>

                                        <p className="mt-3 text-2xl font-bold text-emerald-400">
                                            {allUserAssignedMenuIds.length}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl shadow-black/40">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-zinc-400">Available Menus</p>
                                            <MenuIcon size={20} className="text-amber-400" />
                                        </div>

                                        <p className="mt-3 text-2xl font-bold text-white">
                                            {menus.filter(
                                                (menu) =>
                                                    !isRoleMenuAssigned(menu.id) &&
                                                    !isUserMenuAssigned(menu.id)
                                            ).length}
                                        </p>
                                    </div>
                                </div>

                                {/* Role-Based Menus */}
                                <div className="rounded-2xl border border-white/10 bg-[#111111] shadow-xl shadow-black/40">
                                    <div className="border-b border-white/10 p-5">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={20} className="text-orange-400" />
                                            <h2 className="font-semibold text-white">
                                                Role-Based Menus
                                            </h2>
                                        </div>

                                        <p className="mt-1 text-sm text-zinc-400">
                                            These menus are inherited from the user's role.
                                        </p>
                                    </div>

                                    <div className="p-5">
                                        {roleMenus.length === 0 ? (
                                            <p className="text-sm text-zinc-500">
                                                No role-based menus assigned.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {roleMenus.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 p-3"
                                                    >
                                                        <CheckCircle
                                                            size={17}
                                                            className="shrink-0 text-orange-400"
                                                        />

                                                        <span className="text-sm font-medium text-zinc-200">
                                                            {item.menuName}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Individual Menu Assignments */}
                                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-xl shadow-black/40">
                                    <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <UserRound size={20} className="text-orange-400" />
                                                <h2 className="font-semibold text-white">
                                                    Individual Menu Assignments
                                                </h2>
                                            </div>

                                            <p className="mt-1 text-sm text-zinc-400">
                                                Additional menus assigned directly to this user.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="relative w-full sm:w-56">
                                                <Search
                                                    size={16}
                                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                                                />
                                                <input
                                                    type="text"
                                                    value={assignedSearchInput}
                                                    onChange={(e) => setAssignedSearchInput(e.target.value)}
                                                    placeholder="Search assigned..."
                                                    className={`${controlClass} w-full py-2 pl-10`}
                                                />
                                            </div>

                                            <select
                                                value={assignedPageSize}
                                                onChange={(e) => {
                                                    setAssignedPageSize(Number(e.target.value));
                                                    setAssignedPageNumber(1);
                                                }}
                                                className={`${controlClass} py-2`}
                                            >
                                                <option value={5}>5 / page</option>
                                                <option value={10}>10 / page</option>
                                                <option value={20}>20 / page</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-zinc-400">
                                                <tr>
                                                    <th className="px-5 py-3.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAssignedSort("menuName")}
                                                            className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                                        >
                                                            Menu Name {renderSortIcon("menuName")}
                                                        </button>
                                                    </th>

                                                    <th className="px-5 py-3.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAssignedSort("menuKey")}
                                                            className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                                        >
                                                            Menu Key {renderSortIcon("menuKey")}
                                                        </button>
                                                    </th>

                                                    <th className="px-5 py-3.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAssignedSort("route")}
                                                            className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-orange-400"
                                                        >
                                                            Route {renderSortIcon("route")}
                                                        </button>
                                                    </th>

                                                    <th className="px-5 py-3.5 font-semibold">
                                                        Status
                                                    </th>

                                                    <th className="px-5 py-3.5 text-right font-semibold">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-white/[0.07]">
                                                {userMenus.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan="5"
                                                            className="px-5 py-8 text-center text-zinc-500"
                                                        >
                                                            No individual menus assigned.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    userMenus.map((item) => (
                                                        <tr key={item.id} className="transition hover:bg-white/[0.04]">
                                                            <td className="px-5 py-4 font-medium text-white">
                                                                {item.menuName}
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <span className="rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-orange-300">
                                                                    {item.menuKey}
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-4 text-zinc-400">
                                                                {item.route || "-"}
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                                                    Active
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-4 text-right">
                                                                {canManage ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveMenu(item.id)}
                                                                        disabled={removingId === item.id || assigning}
                                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                                                                    >
                                                                        <Trash2 size={14} />

                                                                        {removingId === item.id
                                                                            ? "Removing..."
                                                                            : "Remove"}
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-xs text-zinc-500">
                                                                        View Only
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Footer */}
                                    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-5 py-3.5 sm:flex-row">
                                        <p className="text-xs text-zinc-400">
                                            Showing {startRecord}–{endRecord} of {assignedTotalRecords} assignments
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setAssignedPageNumber((p) => Math.max(1, p - 1))}
                                                disabled={assignedPageNumber <= 1 || refreshing}
                                                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <ChevronLeft size={14} />
                                                Previous
                                            </button>

                                            <span className="px-2 text-xs font-medium text-zinc-300">
                                                Page {assignedTotalPages === 0 ? 0 : assignedPageNumber} of {assignedTotalPages}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => setAssignedPageNumber((p) => Math.min(assignedTotalPages, p + 1))}
                                                disabled={assignedPageNumber >= assignedTotalPages || refreshing}
                                                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Next
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Assign Additional Menus */}
                                {canManage && (
                                    <div className="rounded-2xl border border-white/10 bg-[#111111] shadow-xl shadow-black/40">
                                    <div className="border-b border-white/10 p-5">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Plus size={20} className="text-orange-400" />
                                                    <h2 className="font-semibold text-white">
                                                        Assign Additional Menus
                                                    </h2>
                                                </div>

                                                <p className="mt-1 text-sm text-zinc-400">
                                                    Select menus that are not already available through the user's role or individual assignments.
                                                </p>
                                            </div>

                                            <span className="text-sm font-semibold text-orange-400">
                                                {selectedMenuIds.length} selected
                                            </span>
                                        </div>

                                        <div className="relative mt-4">
                                            <Search
                                                size={17}
                                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                                            />

                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search available menus..."
                                                className={`${controlClass} w-full pl-10`}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        {availableMenus.length === 0 ? (
                                            <p className="py-6 text-center text-sm text-zinc-500">
                                                No additional menus available.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {availableMenus.map((menu) => (
                                                    <label
                                                        key={menu.id}
                                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                                                            selectedMenuIds.includes(Number(menu.id))
                                                                ? "border-orange-500/50 bg-orange-500/15"
                                                                : "border-white/10 bg-white/[0.03] hover:border-orange-500/30 hover:bg-white/[0.06]"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMenuIds.includes(Number(menu.id))}
                                                            onChange={() => handleMenuSelection(menu.id)}
                                                            className="h-4 w-4 cursor-pointer accent-orange-500"
                                                        />

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium text-white">
                                                                {menu.name}
                                                            </p>

                                                            <p className="mt-1 truncate text-xs text-zinc-400">
                                                                {menu.key}
                                                            </p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-6 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleAssignMenus}
                                                disabled={assigning || selectedMenuIds.length === 0}
                                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-500 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Plus size={17} />

                                                {assigning
                                                    ? "Assigning..."
                                                    : "Assign Selected Menus"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                )}
                            </>
                        )}

                        {!selectedUser && (
                            <div className="rounded-2xl border border-white/10 bg-[#111111] p-10 text-center text-zinc-400">
                                No active users found. Please create a user first.
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}

export default UserMenus;
