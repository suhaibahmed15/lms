
import { useEffect, useState } from "react";
import {
    ShieldCheck,
    Search,
    RefreshCw,
    UserPlus,
    Shield,
    XCircle
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";

import {
    getAllPermissions,
    getAllUserPermissions,
    assignPermissionToUser,
    revokeUserPermission
} from "../services/permissionService";

import { getAllUsers } from "../services/userService";
import { getCurrentUser } from "../utils/auth";

function UserPermissions() {
    const user = getCurrentUser();

    const [users, setUsers] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedPermissionId, setSelectedPermissionId] = useState("");

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Get response data safely
    const extractData = (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        return [];
    };

    // Fetch Users, Permissions and Assignments
    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                usersResponse,
                permissionsResponse,
                assignmentsResponse
            ] = await Promise.all([
                getAllUsers(),
                getAllPermissions(),
                getAllUserPermissions()
            ]);

            setUsers(extractData(usersResponse));
            setPermissions(extractData(permissionsResponse));
            setAssignments(extractData(assignmentsResponse));

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load user permissions."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Get User Name
    const getUserName = (userId) => {
        const selectedUser = users.find(
            (item) => Number(item.id) === Number(userId)
        );

        return selectedUser?.fullName || `User ${userId}`;
    };

    // Get Permission Name
    const getPermissionName = (permissionId) => {
        const permission = permissions.find(
            (item) => Number(item.id) === Number(permissionId)
        );

        return permission?.name || `Permission ${permissionId}`;
    };

    // Active and inactive assignments
    const activeAssignments = assignments.filter(
        (item) => item.isActive && !item.isDeleted
    );

    const revokedAssignments = assignments.filter(
        (item) => !item.isActive || item.isDeleted
    );

    // Selected user's assignments
    const filteredAssignments = assignments.filter((item) => {
        const matchesUser =
            !selectedUserId ||
            Number(item.userId) === Number(selectedUserId);

        const searchText = search.toLowerCase();

        const userName = getUserName(item.userId).toLowerCase();
        const permissionName = getPermissionName(
            item.permissionId
        ).toLowerCase();

        const matchesSearch =
            userName.includes(searchText) ||
            permissionName.includes(searchText);

        return matchesUser && matchesSearch;
    });

    // Assign Permission
    const handleAssign = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!selectedUserId || !selectedPermissionId) {
            setError("Please select a user and permission.");
            return;
        }

        const alreadyAssigned = activeAssignments.some(
            (item) =>
                Number(item.userId) === Number(selectedUserId) &&
                Number(item.permissionId) === Number(selectedPermissionId)
        );

        if (alreadyAssigned) {
            setError("This permission is already assigned to this user.");
            return;
        }

        const assignedByUserId = user?.id ?? user?.userId;

        if (!assignedByUserId) {
            setError("Logged-in user ID could not be found.");
            return;
        }

        try {
            setAssigning(true);

            await assignPermissionToUser({
                userId: Number(selectedUserId),
                permissionId: Number(selectedPermissionId),
                assignedByUserId: Number(assignedByUserId)
            });

            setSuccess("Permission assigned successfully.");
            setSelectedPermissionId("");

            await fetchData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to assign permission."
            );
        } finally {
            setAssigning(false);
        }
    };

    // Revoke Permission
    const handleRevoke = async (assignmentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to revoke this permission?"
        );

        if (!confirmed) return;

        const revokedByUserId = user?.id ?? user?.userId;

        if (!revokedByUserId) {
            setError("Logged-in user ID could not be found.");
            return;
        }

        try {
            setError("");
            setSuccess("");

            await revokeUserPermission(
                assignmentId,
                revokedByUserId
            );

            setSuccess("Permission revoked successfully.");

            await fetchData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to revoke permission."
            );
        }
    };

    return (
        <MainLayout user={user}>
            <div className="space-y-6">

                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        User Permissions
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Assign, view and manage individual user permissions.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Assignments
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-gray-800">
                                    {assignments.length}
                                </h2>
                            </div>

                            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                                <Shield size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Active Permissions
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-emerald-600">
                            {activeAssignments.length}
                        </h2>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Revoked Permissions
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-red-600">
                            {revokedAssignments.length}
                        </h2>
                    </div>

                </div>

                {/* Assign Permission Form */}
                <div className="rounded-xl border bg-white p-5 shadow-sm">

                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                            <UserPlus size={22} />
                        </div>

                        <div>
                            <h2 className="font-semibold text-gray-800">
                                Assign Permission
                            </h2>

                            <p className="text-sm text-gray-500">
                                Give an individual permission to a user.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleAssign}>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                            {/* User Dropdown */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Select User
                                </label>

                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2.5 text-sm text-black outline-none focus:border-emerald-500"
                                    required
                                >
                                    <option value="">
                                        Choose a user
                                    </option>

                                    {users
                                        .filter((item) => item.isActive && !item.isDeleted)
                                        .map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.fullName} ({item.email})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Permission Dropdown */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Select Permission
                                </label>

                                <select
                                    value={selectedPermissionId}
                                    onChange={(e) => setSelectedPermissionId(e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2.5 text-sm text-black outline-none focus:border-emerald-500"
                                    required
                                >
                                    <option value="">
                                        Choose a permission
                                    </option>

                                    {permissions
                                        .filter((item) => item.isActive && !item.isDeleted)
                                        .map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.name} ({item.key})
                                            </option>
                                        ))}
                                </select>
                            </div>

                        </div>

                        <div className="mt-5 flex justify-end">
                            <button
                                type="submit"
                                disabled={assigning || loading}
                                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <UserPlus size={17} />
                                {assigning ? "Assigning..." : "Assign Permission"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Notifications */}
                {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        <XCircle size={18} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                        {success}
                    </div>
                )}

                {/* Assigned Permissions Table */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

                    {/* Search and Refresh */}
                    <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">

                        <div>
                            <h2 className="font-semibold text-gray-800">
                                Assigned Permissions
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                View and revoke user permission assignments.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">

                            <div className="relative w-full sm:w-64">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search assignments..."
                                    className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm outline-none focus:border-emerald-500"
                                />
                            </div>

                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                            >
                                <RefreshCw size={16} />
                                Refresh
                            </button>

                        </div>
                    </div>

                    {/* User Filter */}
                    <div className="border-b px-4 py-3">
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 text-sm text-black outline-none focus:border-emerald-500 sm:max-w-xs"
                        >
                            <option value="">
                                All Users
                            </option>

                            {users.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">

                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-5 py-4">User</th>
                                    <th className="px-5 py-4">Permission</th>
                                    <th className="px-5 py-4">Assigned At</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-10 text-center text-gray-500">
                                            Loading assignments...
                                        </td>
                                    </tr>
                                ) : filteredAssignments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-10 text-center text-gray-500">
                                            No permission assignments found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAssignments.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">

                                            <td className="px-5 py-4">
                                                <div className="font-medium text-gray-800">
                                                    {getUserName(item.userId)}
                                                </div>

                                                <div className="mt-1 text-xs text-gray-500">
                                                    User ID: {item.userId}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="font-medium text-gray-800">
                                                    {getPermissionName(item.permissionId)}
                                                </div>

                                                <div className="mt-1 text-xs text-gray-500">
                                                    Permission ID: {item.permissionId}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                                                {item.assignedAt
                                                    ? new Date(item.assignedAt).toLocaleDateString()
                                                    : "-"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                        item.isActive && !item.isDeleted
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-red-50 text-red-600"
                                                    }`}
                                                >
                                                    {item.isActive && !item.isDeleted
                                                        ? "Active"
                                                        : "Revoked"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-center">
                                                    {item.isActive && !item.isDeleted ? (
                                                        <button
                                                            onClick={() => handleRevoke(item.id)}
                                                            title="Revoke Permission"
                                                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">
                                                            Revoked
                                                        </span>
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
                        Showing {filteredAssignments.length} of {assignments.length} assignments
                    </div>

                </div>

            </div>
        </MainLayout>
    );
}

export default UserPermissions;
