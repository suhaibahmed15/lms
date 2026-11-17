
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {selectedRole ? "Edit Role" : "Add New Role"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {selectedRole
                                ? "Update role information."
                                : "Create a new system role."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 p-6">

                    {error && (
                        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Role Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Role Name <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Branch Manager"
                            maxLength={150}
                            required
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    {/* Role Key */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Role Key <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="text"
                            name="key"
                            value={formData.key}
                            onChange={handleChange}
                            placeholder="e.g. BRANCH_MANAGER"
                            maxLength={100}
                            required
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm uppercase outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        />

                        <p className="mt-1 text-xs text-gray-400">
                            Use uppercase letters and underscores.
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter role description..."
                            rows={3}
                            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
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
