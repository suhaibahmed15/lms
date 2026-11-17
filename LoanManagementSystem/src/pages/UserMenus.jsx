
import { useEffect, useState } from "react";
import {
    UserRound,
    Menu as MenuIcon,
    Plus,
    Trash2,
    RefreshCw,
    ShieldCheck,
    CheckCircle,
    Search
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";

import { getCurrentUser } from "../utils/auth";

import { getAllUsers } from "../services/userService";

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

    const [selectedMenuIds, setSelectedMenuIds] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Handle API response arrays
    const getArray = (response) => {
        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        return [];
    };

    // Load users and menus
    const fetchInitialData = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const [usersResponse, menusResponse] = await Promise.all([
                getAllUsers(),
                getAllMenus()
            ]);

            const usersData = getArray(usersResponse);
            const menusData = getArray(menusResponse);

            const activeUsers = usersData;

            const activeMenus = menusData.sort(
                (a, b) => a.displayOrder - b.displayOrder
            );

            setUsers(activeUsers);
            setMenus(activeMenus);

            setSelectedUserId((previous) => {
                const previousUserExists = activeUsers.some(
                    (item) => String(item.id) === String(previous)
                );

                if (previousUserExists) {
                    return previous;
                }

                return activeUsers.length > 0
                    ? String(activeUsers[0].id)
                    : "";
            });

            if (activeUsers.length === 0) {
                setRoleMenus([]);
                setUserMenus([]);
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
    };

    // Load selected user's role menus and individual menus
    const fetchUserMenuData = async (userId, showRefreshing = false) => {
        if (!userId) {
            setRoleMenus([]);
            setUserMenus([]);
            setSelectedMenuIds([]);
            return;
        }

        const selectedUser = users.find(
            (item) => String(item.id) === String(userId)
        );

        if (!selectedUser) {
            return;
        }

        try {
            if (showRefreshing) {
                setRefreshing(true);
            }

            setError("");
            setSuccess("");
            setSelectedMenuIds([]);

            const [roleResponse, userResponse] = await Promise.all([
                getMenusByRole(selectedUser.roleId),
                getUserMenuAssignments(userId)
            ]);

            setRoleMenus(getArray(roleResponse));

            setUserMenus(getArray(userResponse));
        } catch (err) {
            console.error("Error loading user menu assignments:", err);

            setRoleMenus([]);
            setUserMenus([]);

            setError(
                err.response?.data?.message ||
                "Unable to load menu assignments."
            );
        } finally {
            setRefreshing(false);
        }
    };

    // Initial API call
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Load menus whenever selected user changes
    useEffect(() => {
        if (selectedUserId && users.length > 0) {
            fetchUserMenuData(selectedUserId);
        }
    }, [selectedUserId, users]);

    // Find selected user
    const selectedUser = users.find(
        (item) => String(item.id) === String(selectedUserId)
    );

    // Check whether menu is assigned through role
    const isRoleMenuAssigned = (menuId) => {
        return roleMenus.some(
            (item) => Number(item.menuId) === Number(menuId)
        );
    };

    // Check whether menu is individually assigned
    const isUserMenuAssigned = (menuId) => {
        return userMenus.some(
            (item) =>
                Number(item.menuId) === Number(menuId) &&
                item.isActive
        );
    };

    // Toggle selected menu checkbox
    const handleMenuSelection = (menuId) => {
        const id = Number(menuId);

        setSelectedMenuIds((previous) => {
            if (previous.includes(id)) {
                return previous.filter((item) => item !== id);
            }

            return [...previous, id];
        });
    };

    // Assign selected menus
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

    // Remove individual user menu assignment
    const handleRemoveMenu = async (assignmentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this individual menu assignment?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setRemovingId(assignmentId);
            setError("");
            setSuccess("");

            await removeUserMenu(assignmentId);

            await fetchUserMenuData(selectedUserId);

            setSuccess(
                "Individual menu assignment removed successfully."
            );
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

    // Menus that are not already assigned
    const availableMenus = menus.filter((menu) => {
        const alreadyAssigned =
            isRoleMenuAssigned(menu.id) ||
            isUserMenuAssigned(menu.id);

        const matchesSearch = menu.name
            .toLowerCase()
            .includes(search.toLowerCase());

        return !alreadyAssigned && matchesSearch;
    });

    return (
        <MainLayout user={user}>
            <div className="space-y-6">

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            User Menu Assignments
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage additional menu access for individual users.
                        </p>
                    </div>

                    <button
                        onClick={() => fetchUserMenuData(selectedUserId, true)}
                        disabled={!selectedUserId || refreshing || assigning}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {success}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-500">
                        Loading users and menus...
                    </div>
                ) : (
                    <>
                        {/* User Selection */}
                        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <UserRound
                                    size={20}
                                    className="text-emerald-600"
                                />

                                <h2 className="font-semibold text-gray-800">
                                    Select User
                                </h2>
                            </div>

                            <select
                                value={selectedUserId}
                                onChange={(e) => {
                                    setSelectedUserId(e.target.value);
                                }}
                                className="block w-full max-w-md appearance-auto rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            >
                                <option value="">Select a user</option>

                                {users.map((item) => (
                                    <option
                                        key={item.id}
                                        value={String(item.id)}
                                    >
                                        {item.fullName} - {item.email}
                                    </option>
                                ))}
                            </select>

                            {selectedUser && (
                                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                                    <p className="font-semibold text-gray-800">
                                        {selectedUser.fullName}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {selectedUser.email}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        User ID: {selectedUser.id}
                                        {" "} | Role ID: {selectedUser.roleId}
                                    </p>
                                </div>
                            )}
                        </div>

                        {selectedUser && (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-500">
                                                Role Menus
                                            </p>

                                            <ShieldCheck
                                                size={20}
                                                className="text-blue-600"
                                            />
                                        </div>

                                        <p className="mt-3 text-2xl font-bold text-gray-800">
                                            {roleMenus.length}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-500">
                                                Individual Menus
                                            </p>

                                            <UserRound
                                                size={20}
                                                className="text-emerald-600"
                                            />
                                        </div>

                                        <p className="mt-3 text-2xl font-bold text-gray-800">
                                            {userMenus.filter(
                                                (item) => item.isActive
                                            ).length}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-500">
                                                Available Menus
                                            </p>

                                            <MenuIcon
                                                size={20}
                                                className="text-orange-600"
                                            />
                                        </div>

                                        <p className="mt-3 text-2xl font-bold text-gray-800">
                                            {menus.filter(
                                                (menu) =>
                                                    !isRoleMenuAssigned(menu.id) &&
                                                    !isUserMenuAssigned(menu.id)
                                            ).length}
                                        </p>
                                    </div>

                                </div>

                                {/* Role-Based Menus */}
                                <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                                    <div className="border-b border-gray-100 p-5">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck
                                                size={20}
                                                className="text-blue-600"
                                            />

                                            <h2 className="font-semibold text-gray-800">
                                                Role-Based Menus
                                            </h2>
                                        </div>

                                        <p className="mt-1 text-sm text-gray-500">
                                            These menus are inherited from the user's role.
                                            They cannot be removed here.
                                        </p>
                                    </div>

                                    <div className="p-5">
                                        {roleMenus.length === 0 ? (
                                            <p className="text-sm text-gray-500">
                                                No role-based menus assigned.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {roleMenus.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3"
                                                    >
                                                        <CheckCircle
                                                            size={17}
                                                            className="shrink-0 text-blue-600"
                                                        />

                                                        <span className="text-sm font-medium text-gray-700">
                                                            {item.menuName}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Individual Menu Assignments */}
                                <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                                    <div className="border-b border-gray-100 p-5">
                                        <div className="flex items-center gap-2">
                                            <UserRound
                                                size={20}
                                                className="text-emerald-600"
                                            />

                                            <h2 className="font-semibold text-gray-800">
                                                Individual Menu Assignments
                                            </h2>
                                        </div>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Additional menus assigned directly to this user.
                                        </p>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 text-gray-600">
                                                <tr>
                                                    <th className="px-5 py-3 font-semibold">
                                                        Menu Name
                                                    </th>

                                                    <th className="px-5 py-3 font-semibold">
                                                        Menu Key
                                                    </th>

                                                    <th className="px-5 py-3 font-semibold">
                                                        Route
                                                    </th>

                                                    <th className="px-5 py-3 font-semibold">
                                                        Status
                                                    </th>

                                                    <th className="px-5 py-3 text-right font-semibold">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-gray-100">
                                                {userMenus.filter(
                                                    (item) => item.isActive
                                                ).length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan="5"
                                                            className="px-5 py-8 text-center text-gray-500"
                                                        >
                                                            No individual menus assigned.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    userMenus
                                                        .filter((item) => item.isActive)
                                                        .map((item) => (
                                                            <tr key={item.id}>
                                                                <td className="px-5 py-4 font-medium text-gray-800">
                                                                    {item.menuName}
                                                                </td>

                                                                <td className="px-5 py-4 text-gray-600">
                                                                    {item.menuKey}
                                                                </td>

                                                                <td className="px-5 py-4 text-gray-600">
                                                                    {item.route || "-"}
                                                                </td>

                                                                <td className="px-5 py-4">
                                                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                                                        Active
                                                                    </span>
                                                                </td>

                                                                <td className="px-5 py-4 text-right">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleRemoveMenu(item.id)
                                                                        }
                                                                        disabled={
                                                                            removingId === item.id ||
                                                                            assigning
                                                                        }
                                                                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                                    >
                                                                        <Trash2 size={16} />

                                                                        {removingId === item.id
                                                                            ? "Removing..."
                                                                            : "Remove"}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Assign Additional Menus */}
                                <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                                    <div className="border-b border-gray-100 p-5">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Plus
                                                        size={20}
                                                        className="text-emerald-600"
                                                    />

                                                    <h2 className="font-semibold text-gray-800">
                                                        Assign Additional Menus
                                                    </h2>
                                                </div>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    Select menus that are not already available through the user's role or individual assignments.
                                                </p>
                                            </div>

                                            <span className="text-sm font-medium text-emerald-700">
                                                {selectedMenuIds.length} selected
                                            </span>
                                        </div>

                                        <div className="relative mt-4">
                                            <Search
                                                size={17}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            />

                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search available menus..."
                                                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-gray-900 outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        {availableMenus.length === 0 ? (
                                            <p className="py-6 text-center text-sm text-gray-500">
                                                No additional menus available.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {availableMenus.map((menu) => (
                                                    <label
                                                        key={menu.id}
                                                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:border-emerald-300 hover:bg-emerald-50"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMenuIds.includes(Number(menu.id))}
                                                            onChange={() =>
                                                                handleMenuSelection(menu.id)
                                                            }
                                                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                        />

                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">
                                                                {menu.name}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {menu.key}
                                                            </p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-6 flex justify-end">
                                            <button
                                                onClick={handleAssignMenus}
                                                disabled={
                                                    assigning ||
                                                    selectedMenuIds.length === 0
                                                }
                                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Plus size={17} />

                                                {assigning
                                                    ? "Assigning..."
                                                    : "Assign Selected Menus"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {!selectedUser && (
                            <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-500">
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
