import { useEffect, useState } from "react";
import { X } from "lucide-react";

function RolePermissionModal({
    isOpen,
    onClose,
    onSubmit,
    roles = [],
    permissions = [],
    defaultRoleId = ""
}) {
    const [formData, setFormData] = useState({
        roleId: "",
        permissionId: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setFormData({
                roleId: defaultRoleId ? String(defaultRoleId) : "",
                permissionId: ""
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

        if (!formData.roleId || !formData.permissionId) {
            setError("Please select both a role and a permission.");
            return;
        }

        try {
            setLoading(true);

            await onSubmit({
                roleId: Number(formData.roleId),
                permissionId: Number(formData.permissionId)
            });

            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to assign permission to role. Please try again."
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
                            Assign Permission to Role
                        </h2>

                        <p className="mt-1 text-sm text-zinc-400">
                            Select a role and permission to create a role permission assignment.
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

                    {/* Permission */}
                    <div>
                        <label className={labelClass}>
                            Select Permission <span className="text-orange-400">*</span>
                        </label>

                        <select
                            name="permissionId"
                            value={formData.permissionId}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        >
                            <option value="">Choose a permission</option>
                            {permissions
                                .filter(
                                    (perm) =>
                                        perm.isActive &&
                                        !perm.key?.toUpperCase().startsWith("AUDIT_LOG")
                                )
                                .map((perm) => (
                                    <option key={perm.id} value={perm.id}>
                                        {perm.name} ({perm.key})
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
                            {loading ? "Assigning..." : "Assign Permission"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RolePermissionModal;