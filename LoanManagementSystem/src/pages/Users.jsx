
import { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    Users as UsersIcon
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import UserModal from "../modals/users/UserModal";

import {
    getAllUsers,
    createUser,
    deleteUser
} from "../services/userService";

import { getAllRoles } from "../services/roleService";
import { getCurrentUser } from "../utils/auth";

function Users() {
    const user = getCurrentUser();

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch Users and Roles
    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [usersResponse, rolesResponse] = await Promise.all([
                getAllUsers(),
                getAllRoles()
            ]);

            const userData = Array.isArray(usersResponse)
                ? usersResponse
                : usersResponse.data || [];

            const roleData = Array.isArray(rolesResponse)
                ? rolesResponse
                : rolesResponse.data || [];

            setUsers(userData);
            setRoles(roleData);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Get Role Name
    const getRoleName = (roleId) => {
        const role = roles.find(
            (item) => item.id === roleId
        );

        return role?.name || `Role ${roleId}`;
    };

    // Search Users
    const filteredUsers = users.filter((item) => {
        const searchText = search.toLowerCase();

        return (
            item.fullName?.toLowerCase().includes(searchText) ||
            item.email?.toLowerCase().includes(searchText) ||
            item.phoneNumber?.toLowerCase().includes(searchText) ||
            getRoleName(item.roleId).toLowerCase().includes(searchText)
        );
    });

    // Create User
    const handleCreateUser = async (userData) => {
        try {
            await createUser(userData);
            await fetchData();
        } catch (err) {
            throw err;
        }
    };

    // Deactivate User
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to deactivate this user?"
        );

        if (!confirmed) return;

        try {
            await deleteUser(id);
            await fetchData();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to deactivate user."
            );
        }
    };

    // Summary
    const totalUsers = users.length;

    const activeUsers = users.filter(
        (item) => item.isActive
    ).length;

    const inactiveUsers = totalUsers - activeUsers;

    return (
        <MainLayout user={user}>
            <div className="space-y-6">

                {/* Page Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            User Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage system users and their roles.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        <Plus size={18} />
                        Add User
                    </button>

                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Users
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-gray-800">
                                    {totalUsers}
                                </h2>
                            </div>

                            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                                <UsersIcon size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Active Users
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-emerald-600">
                            {activeUsers}
                        </h2>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Inactive Users
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-red-600">
                            {inactiveUsers}
                        </h2>
                    </div>

                </div>

                {/* Users Table */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

                    {/* Search and Refresh */}
                    <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">

                        <div className="relative w-full sm:max-w-sm">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search users..."
                                className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm outline-none focus:border-emerald-500"
                            />
                        </div>

                        <button
                            onClick={fetchData}
                            className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>

                    </div>

                    {/* Error */}
                    {error && (
                        <div className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">

                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-5 py-4">User</th>
                                    <th className="px-5 py-4">Phone</th>
                                    <th className="px-5 py-4">Role</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Created At</th>
                                    <th className="px-5 py-4 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-5 py-10 text-center text-gray-500"
                                        >
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-5 py-10 text-center text-gray-500"
                                        >
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-gray-800">
                                                    {item.fullName}
                                                </div>

                                                <div className="mt-1 text-xs text-gray-500">
                                                    {item.email}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {item.phoneNumber || "-"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                                    {getRoleName(item.roleId)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                        item.isActive
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-red-50 text-red-600"
                                                    }`}
                                                >
                                                    {item.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                                                {item.createdAt
                                                    ? new Date(item.createdAt).toLocaleDateString()
                                                    : "-"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center">

                                                    {item.isActive && (
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            title="Deactivate User"
                                                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 size={17} />
                                                        </button>
                                                    )}

                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}

                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="border-t px-5 py-4 text-sm text-gray-500">
                        Showing {filteredUsers.length} of {totalUsers} users
                    </div>

                </div>

                {/* Add User Modal */}
                <UserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateUser}
                    roles={roles}
                />

            </div>
        </MainLayout>
    );
}

export default Users;
