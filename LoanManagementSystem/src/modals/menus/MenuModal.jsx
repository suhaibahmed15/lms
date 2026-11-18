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
        "w-full rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500/70 focus:bg-white/[0.10] focus:ring-4 focus:ring-orange-500/10";

    const labelClass =
        "mb-1.5 block text-sm font-medium text-zinc-300";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-[#121212] shadow-2xl shadow-black/80">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                    <h2 className="text-xl font-bold text-white">
                        {selectedMenu ? "Edit Menu" : "Add New Menu"}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
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

                    <div className="flex items-center gap-2.5 pt-1">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="h-4 w-4 cursor-pointer accent-orange-500"
                        />

                        <label
                            htmlFor="isActive"
                            className="cursor-pointer text-sm font-medium text-zinc-300"
                        >
                            Active Menu
                        </label>
                    </div>

                    {error && (
                        <p className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.10] hover:text-white"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-500 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
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
