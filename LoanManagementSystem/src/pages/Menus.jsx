
import { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    Menu as MenuIcon
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import MenuModal from "../modals/menus/MenuModal";

import {
    getAllMenus,
    createMenu,
    updateMenu,
    deleteMenu
} from "../services/menuService";

import { getCurrentUser } from "../utils/auth";

function Menus() {
    const user = getCurrentUser();

    const [menus, setMenus] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);

    // Fetch All Menus
    const fetchMenus = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllMenus();

            const menuData = Array.isArray(response)
                ? response
                : response.data || [];

            setMenus(menuData);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load menus."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    // Search Menus
    const filteredMenus = menus.filter((menu) => {
        const searchText = search.toLowerCase();

        return (
            menu.name?.toLowerCase().includes(searchText) ||
            menu.key?.toLowerCase().includes(searchText) ||
            menu.route?.toLowerCase().includes(searchText) ||
            menu.parentMenuName?.toLowerCase().includes(searchText)
        );
    });

    // Open Add Modal
    const handleAdd = () => {
        setSelectedMenu(null);
        setIsModalOpen(true);
    };

    // Open Edit Modal
    const handleEdit = (menu) => {
        setSelectedMenu(menu);
        setIsModalOpen(true);
    };

    // Create / Update Menu
    const handleSubmit = async (menuData) => {
        try {
            if (selectedMenu) {
                await updateMenu(selectedMenu.id, menuData);
            } else {
                await createMenu(menuData);
            }

            await fetchMenus();
        } catch (err) {
            throw err;
        }
    };

    // Soft Delete Menu
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to deactivate this menu?"
        );

        if (!confirmed) return;

        try {
            await deleteMenu(id);
            await fetchMenus();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to delete menu."
            );
        }
    };

    const totalMenus = menus.length;

    const activeMenus = menus.filter(
        (menu) => menu.isActive
    ).length;

    const inactiveMenus = totalMenus - activeMenus;

    return (
        <MainLayout user={user}>
            <div className="space-y-6">

                {/* Page Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Menu Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage system menus and navigation items.
                        </p>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        <Plus size={18} />
                        Add Menu
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Menus
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-gray-800">
                                    {totalMenus}
                                </h2>
                            </div>

                            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                                <MenuIcon size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Active Menus
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-emerald-600">
                            {activeMenus}
                        </h2>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Inactive Menus
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-red-600">
                            {inactiveMenus}
                        </h2>
                    </div>

                </div>

                {/* Menu Table */}
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
                                placeholder="Search menus..."
                                className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm outline-none focus:border-emerald-500"
                            />
                        </div>

                        <button
                            onClick={fetchMenus}
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
                                    <th className="px-5 py-4">Menu</th>
                                    <th className="px-5 py-4">Key</th>
                                    <th className="px-5 py-4">Route</th>
                                    <th className="px-5 py-4">Parent Menu</th>
                                    <th className="px-5 py-4">Order</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Created At</th>
                                    <th className="px-5 py-4 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-5 py-10 text-center text-gray-500"
                                        >
                                            Loading menus...
                                        </td>
                                    </tr>
                                ) : filteredMenus.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-5 py-10 text-center text-gray-500"
                                        >
                                            No menus found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMenus.map((menu) => (
                                        <tr
                                            key={menu.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-gray-800">
                                                    {menu.name}
                                                </div>

                                                <div className="mt-1 text-xs text-gray-400">
                                                    {menu.icon || "No icon"}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {menu.key}
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {menu.route || "-"}
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {menu.parentMenuName || "Main Menu"}
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {menu.displayOrder}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                        menu.isActive
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-red-50 text-red-600"
                                                    }`}
                                                >
                                                    {menu.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                                                {menu.createdAt
                                                    ? new Date(menu.createdAt).toLocaleDateString()
                                                    : "-"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">

                                                    <button
                                                        onClick={() => handleEdit(menu)}
                                                        title="Edit Menu"
                                                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Pencil size={17} />
                                                    </button>

                                                    {menu.isActive && (
                                                        <button
                                                            onClick={() => handleDelete(menu.id)}
                                                            title="Deactivate Menu"
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
                        Showing {filteredMenus.length} of {totalMenus} menus
                    </div>

                </div>

                {/* Menu Modal */}
                <MenuModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    selectedMenu={selectedMenu}
                    menus={menus}
                />

            </div>
        </MainLayout>
    );
}

export default Menus;
