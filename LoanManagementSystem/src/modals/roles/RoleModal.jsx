import { useEffect, useState } from "react";
import { X } from "lucide-react";

function RoleModal({ isOpen, onClose, onSubmit, selectedRole }) {
    const [formData, setFormData] = useState({
        name: "",
        key: "",
        description: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (selectedRole) {
            setFormData({
                name: selectedRole.name || "",
                key: selectedRole.key || "",
                description: selectedRole.description || ""
            });
        } else {
            setFormData({
                name: "",
                key: "",
                description: ""
            });
        }

        setError("");
    }, [selectedRole, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: name === "key" ? value.toUpperCase().replace(/\s/g, "_") : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.key.trim()) {
            setError("Role name and role key are required.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await onSubmit({
                name: formData.name.trim(),
                key: formData.key.trim(),
                description: formData.description.trim()
            });

            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save role. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500/70 focus:bg-white/[0.10] focus:ring-4 focus:ring-orange-500/10";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#121212] shadow-2xl shadow-black/80">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {selectedRole ? "Edit Role" : "Add New Role"}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-400">
                            {selectedRole
                                ? "Update role information."
                                : "Create a new system role."}
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
                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    {error && (
                        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Role Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                            Role Name <span className="text-orange-400">*</span>
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Branch Manager"
                            maxLength={150}
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Role Key */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                            Role Key <span className="text-orange-400">*</span>
                        </label>

                        <input
                            type="text"
                            name="key"
                            value={formData.key}
                            onChange={handleChange}
                            placeholder="e.g. BRANCH_MANAGER"
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
                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter role description..."
                            rows={3}
                            className={`${inputClass} resize-none`}
                        />
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
                            {loading
                                ? "Saving..."
                                : selectedRole
                                    ? "Update Role"
                                    : "Create Role"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RoleModal;
