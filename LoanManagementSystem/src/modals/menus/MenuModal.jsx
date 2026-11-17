
import { useEffect, useState } from "react";
import { X } from "lucide-react";

function MenuModal({
    isOpen,
    onClose,
    onSubmit,
    selectedMenu,
    menus = []
}) {
    const [formData, setFormData] = useState({
        name: "",
        key: "",
        route: "",
        icon: "",
        displayOrder: 0,
        parentMenuId: "",
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (selectedMenu) {
            setFormData({
                name: selectedMenu.name || "",
                key: selectedMenu.key || "",
                route: selectedMenu.route || "",
                icon: selectedMenu.icon || "",
                displayOrder: selectedMenu.displayOrder ?? 0,
                parentMenuId: selectedMenu.parentMenuId ?? "",
                isActive: selectedMenu.isActive ?? true
            });
        } else {
            setFormData({
                name: "",
                key: "",
                route: "",
                icon: "",
                displayOrder: 0,
                parentMenuId: "",
                isActive: true
            });
        }

        setError("");
    }, [selectedMenu, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            const menuData = {
                name: formData.name.trim(),
                key: formData.key.trim(),
                route: formData.route.trim() || null,
                icon: formData.icon.trim() || null,
                displayOrder: Number(formData.displayOrder),
                parentMenuId: formData.parentMenuId
                    ? Number(formData.parentMenuId)
                    : null,
                isActive: formData.isActive
            };

            await onSubmit(menuData);
            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const parentMenus = menus.filter(
        (menu) =>
            menu.parentMenuId === null &&
            menu.id !== selectedMenu?.id
    );

    const inputClass =
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

    const labelClass =
        "mb-1.5 block text-sm font-semibold text-gray-900";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-5">
                    <h2 className="text-xl font-bold text-gray-900">
                        {selectedMenu ? "Edit Menu" : "Add New Menu"}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 p-5">

                    <div>
                        <label className={labelClass}>
                            Menu Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            maxLength={100}
                            placeholder="Enter menu name"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Menu Key
                        </label>

                        <input
                            type="text"
                            name="key"
                            value={formData.key}
                            onChange={handleChange}
                            required
                            maxLength={100}
                            placeholder="e.g. USER_MANAGEMENT"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Route
                        </label>

                        <input
                            type="text"
                            name="route"
                            value={formData.route}
                            onChange={handleChange}
                            maxLength={250}
                            placeholder="e.g. /users"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Icon
                        </label>

                        <input
                            type="text"
                            name="icon"
                            value={formData.icon}
                            onChange={handleChange}
                            maxLength={100}
                            placeholder="e.g. users"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Display Order
                        </label>

                        <input
                            type="number"
                            name="displayOrder"
                            value={formData.displayOrder}
                            onChange={handleChange}
                            min="0"
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Parent Menu
                        </label>

                        <select
                            name="parentMenuId"
                            value={formData.parentMenuId}
                            onChange={handleChange}
                            className={inputClass}
                        >
                            <option value="">
                                No Parent (Main Menu)
                            </option>

                            {parentMenus.map((menu) => (
                                <option key={menu.id} value={menu.id}>
                                    {menu.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="h-4 w-4 cursor-pointer accent-emerald-600"
                        />

                        <label
                            htmlFor="isActive"
                            className="cursor-pointer text-sm font-semibold text-gray-900"
                        >
                            Active Menu
                        </label>
                    </div>

                    {error && (
                        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Saving..."
                                : selectedMenu
                                    ? "Update Menu"
                                    : "Create Menu"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default MenuModal;
