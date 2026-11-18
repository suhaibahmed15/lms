import { useEffect, useState } from "react";
import { X } from "lucide-react";

function PermissionModal({ isOpen, onClose, onSubmit, selectedPermission }) {
    const [formData, setFormData] = useState({
        name: "",
        key: "",
        description: "",
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (selectedPermission) {
            setFormData({
                name: selectedPermission.name || "",
                key: selectedPermission.key || "",
                description: selectedPermission.description || "",
                isActive: selectedPermission.isActive ?? true
            });
        } else {
            setFormData({
                name: "",
                key: "",
                description: "",
                isActive: true
            });
        }

        setError("");
    }, [selectedPermission, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : name === "key"
                        ? value.toUpperCase().replace(/\s/g, "_")
                        : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.name.trim() || !formData.key.trim()) {
            setError("Permission name and key are required.");
            return;
        }

        try {
            setLoading(true);

            const payload = selectedPermission
                ? {
                      name: formData.name.trim(),
                      key: formData.key.trim(),
                      description: formData.description.trim() || null,
                      isActive: formData.isActive
                  }
                : {
                      name: formData.name.trim(),
                      key: formData.key.trim(),
                      description: formData.description.trim() || null
                  };

            await onSubmit(payload);
            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save permission. Please try again."
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
                            {selectedPermission ? "Edit Permission" : "Add New Permission"}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-400">
                            {selectedPermission
                                ? "Update permission details."
                                : "Create a new system permission."}
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

                    {/* Permission Name */}
                    <div>
                        <label className={labelClass}>
                            Permission Name <span className="text-orange-400">*</span>
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. View Loan Applications"
                            maxLength={150}
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Permission Key */}
                    <div>
                        <label className={labelClass}>
                            Permission Key <span className="text-orange-400">*</span>
                        </label>

                        <input
                            type="text"
                            name="key"
                            value={formData.key}
                            onChange={handleChange}
                            placeholder="e.g. LOAN_APPLICATION_VIEW"
                            maxLength={100}
                            required
                            className={`${inputClass} uppercase`}
                        />

                        <p className="mt-1.5 text-xs text-zinc-500">
                            Use uppercase letters and underscores.
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className={labelClass}>Description</label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter permission description..."
                            maxLength={500}
                            rows={3}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    {/* Active Status (Edit Mode) */}
                    {selectedPermission && (
                        <div className="flex items-center gap-2.5 pt-1">
                            <input
                                type="checkbox"
                                id="permission-isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="h-4 w-4 cursor-pointer accent-orange-500"
                            />

                            <label
                                htmlFor="permission-isActive"
                                className="cursor-pointer text-sm font-medium text-zinc-300"
                            >
                                Active Permission
                            </label>
                        </div>
                    )}

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
                            {loading
                                ? "Saving..."
                                : selectedPermission
                                    ? "Update Permission"
                                    : "Create Permission"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PermissionModal;