import { useEffect, useState } from "react";
import { X } from "lucide-react";

function RoleMenuModal({
    isOpen,
    onClose,
    onSubmit,
    roles = [],
    menus = [],
    defaultRoleId = ""
}) {
    const [formData, setFormData] = useState({
        roleId: "",
        menuId: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setFormData({
                roleId: defaultRoleId ? String(defaultRoleId) : "",
                menuId: ""
            });
            setError("");
        }
    }, [isOpen, defaultRoleId]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.roleId || !formData.menuId) {
            setError("Please select both a role and a menu.");
            return;
        }

        try {
            setLoading(true);

            await onSubmit({
                roleId: Number(formData.roleId),
                menuId: Number(formData.menuId)
            });

            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to assign menu to role. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-white/10 bg-white/[0.07] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500/70 focus:bg-white/[0.10] focus:ring-4 focus:ring-orange-500/10";

    const labelClass = "mb-1.5 block text-sm font-medium text-zinc-300";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#121212] shadow-2xl shadow-black/80">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Assign Menu to Role
                        </h2>

                        <p className="mt-1 text-sm text-zinc-400">
                            Select a role and menu to create a role menu assignment.
                        </p>
                    </div>

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
                    {error && (
                        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Role */}
                    <div>
                        <label className={labelClass}>
                            Select Role <span className="text-orange-400">*</span>
                        </label>

                        <select
                            name="roleId"
                            value={formData.roleId}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        >
                            <option value="">Choose a role</option>
                            {roles
                                .filter((role) => role.isActive)
                                .map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name} ({role.key})
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Menu */}
                    <div>
                        <label className={labelClass}>
                            Select Menu <span className="text-orange-400">*</span>
                        </label>

                        <select
                            name="menuId"
                            value={formData.menuId}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        >
                            <option value="">Choose a menu</option>
                            {menus
                                .filter(
                                    (menu) =>
                                        menu.isActive &&
                                        menu.key?.toUpperCase() !== "AUDIT_LOGS"
                                )
                                .map((menu) => (
                                    <option key={menu.id} value={menu.id}>
                                        {menu.parentMenuName
                                            ? `${menu.parentMenuName} → ${menu.name}`
                                            : `${menu.name} (Parent)`}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.10] hover:text-white"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-500 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Assigning..." : "Assign Menu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RoleMenuModal;