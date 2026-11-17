
import { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    ShieldCheck,
    RefreshCw
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import RoleModal from "../modals/roles/RoleModal";

import {
    getAllRoles,
    createRole,
    updateRole,
    deleteRole
} from "../services/roleService";

import { getCurrentUser } from "../utils/auth";

function Roles() {
    const user = getCurrentUser();

    const [roles, setRoles] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    // Load roles from API
    const fetchRoles = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllRoles();

            setRoles(response.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load roles."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    // Open create modal
    const handleAddRole = () => {
        setSelectedRole(null);
        setIsModalOpen(true);
        setSuccess("");
    };

    // Open edit modal
    const handleEditRole = (role) => {
        setSelectedRole(role);
        setIsModalOpen(true);
        setSuccess("");
    };

    // Create or update role
    const handleSubmit = async (roleData) => {
        try {
            if (selectedRole) {
                await updateRole(selectedRole.id, roleData);
                setSuccess("Role updated successfully.");
            } else {
                await createRole(roleData);
                setSuccess("Role created successfully.");
            }

            setIsModalOpen(false);
            setSelectedRole(null);

            await fetchRoles();
        } catch (err) {
            throw err;
        }
    };

    // Delete role
    const handleDeleteRole = async (role) => {
        if (role.key === "ADMIN") {
            alert("The Admin role cannot be deleted.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${role.name}?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await deleteRole(role.id);

            setSuccess("Role deleted successfully.");

            await fetchRoles();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete role."
            );
        }
    };

    // Search roles
    const filteredRoles = roles.filter((role) =>
        `${role.name} ${role.key} ${role.description || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <MainLayout user={user}>
            <div className="space-y-6">

                {/* Page Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Role Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Create and manage system roles.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddRole}
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                    >
                        <Plus size={18} />
                        Add New Role
                    </button>

                </div>

                {/* Messages */}
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {success}
                    </div>
                )}

                {/* Role Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Roles
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                                    {roles.length}
                                </h2>
                            </div>

                            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                                <ShieldCheck size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Active Roles
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                                    {roles.filter(role => role.isActive).length}
                                </h2>
                            </div>

                            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                                <ShieldCheck size={24} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Roles Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    {/* Table Header */}
                    <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center">

                        <div>
                            <h2 className="font-semibold text-gray-900">
                                All Roles
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Manage roles and their information.
                            </p>
                        </div>

                        <div className="flex gap-2">

                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search roles..."
                                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 sm:w-64"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={fetchRoles}
                                className="rounded-xl border border-gray-300 p-2.5 text-gray-600 hover:bg-gray-50"
                                title="Refresh"
                            >
                                <RefreshCw size={18} />
                            </button>

                        </div>

                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                                        Role
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                                        Role Key
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                                        Description
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-12 text-center text-sm text-gray-500"
                                        >
                                            Loading roles...
                                        </td>
                                    </tr>
                                ) : filteredRoles.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-12 text-center text-sm text-gray-500"
                                        >
                                            No roles found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRoles.map((role) => (
                                        <tr
                                            key={role.id}
                                            className="transition hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                                        <ShieldCheck size={20} />
                                                    </div>

                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {role.name}
                                                    </span>

                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                                                    {role.key}
                                                </span>
                                            </td>

                                            <td className="max-w-xs px-6 py-4 text-sm text-gray-500">
                                                {role.description || "No description"}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        role.isActive
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-red-50 text-red-700"
                                                    }`}
                                                >
                                                    {role.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditRole(role)}
                                                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                                        title="Edit role"
                                                    >
                                                        <Pencil size={17} />
                                                    </button>

                                                    {role.key !== "ADMIN" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteRole(role)}
                                                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                            title="Delete role"
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

                    {/* Table Footer */}
                    {!loading && (
                        <div className="border-t border-gray-200 px-6 py-4">
                            <p className="text-xs text-gray-500">
                                Showing {filteredRoles.length} of {roles.length} roles
                            </p>
                        </div>
                    )}

                </div>

                {/* Role Modal */}
                <RoleModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedRole(null);
                    }}
                    onSubmit={handleSubmit}
                    selectedRole={selectedRole}
                />

            </div>
        </MainLayout>
    );
}

export default Roles;
