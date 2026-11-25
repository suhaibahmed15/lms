import { useEffect, useState } from "react";
import { Modal, Input, Textarea, Button } from "../../components/common";

export default function RoleModal({ isOpen, onClose, onSubmit, selectedRole }) {
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

        setFormData((prev) => ({
            ...prev,
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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={selectedRole ? "Edit Role" : "Add New Role"}
            subtitle={selectedRole ? "Update role information." : "Create a new system role."}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <Input
                    label="Role Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Branch Manager"
                    maxLength={150}
                    required
                />

                <Input
                    label="Role Key"
                    name="key"
                    value={formData.key}
                    onChange={handleChange}
                    placeholder="e.g. BRANCH_MANAGER"
                    maxLength={100}
                    required
                    inputClassName="uppercase"
                    helperText="Use uppercase letters and underscores."
                />

                <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter role description..."
                    rows={3}
                />

                <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
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
                        {selectedRole ? "Update Role" : "Create Role"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
