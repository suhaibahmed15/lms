import { useEffect, useState } from "react";
import { Modal, Input, Textarea, Button } from "../../components/common";

export default function PermissionModal({
    isOpen,
    onClose,
    onSubmit,
    selectedPermission
}) {
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

        setFormData((prev) => ({
            ...prev,
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={selectedPermission ? "Edit Permission" : "Add New Permission"}
            subtitle={selectedPermission ? "Update permission details." : "Create a new authorization permission."}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <Input
                    label="Permission Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. View Audit Logs"
                    required
                />

                <Input
                    label="Permission Key"
                    name="key"
                    value={formData.key}
                    onChange={handleChange}
                    placeholder="e.g. AUDIT_LOG_VIEW"
                    required
                    inputClassName="uppercase"
                    helperText="Unique uppercase identifier for backend policy checks."
                />

                <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what access this permission grants..."
                    rows={3}
                />

                {selectedPermission && (
                    <div className="flex items-center gap-2.5 pt-1">
                        <input
                            type="checkbox"
                            id="permIsActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="h-4 w-4 cursor-pointer accent-pink-500"
                        />
                        <label
                            htmlFor="permIsActive"
                            className="cursor-pointer text-sm font-medium text-zinc-700"
                        >
                            Active Permission
                        </label>
                    </div>
                )}

                <div className="flex justify-end gap-3 border-t border-pink-100 pt-5">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        loadingText="Saving..."
                    >
                        {selectedPermission ? "Update Permission" : "Create Permission"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
