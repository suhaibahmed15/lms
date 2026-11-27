import { useEffect, useState } from "react";
import { Modal, Select, Button } from "../../components/common";

export default function RolePermissionModal({
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
        setFormData((prev) => ({
            ...prev,
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

    const roleOptions = roles
        .filter((role) => role.isActive && !role.isDeleted)
        .map((role) => ({
            value: role.id,
            label: `${role.name} (${role.key})`
        }));

    const permissionOptions = permissions
        .filter(
            (perm) =>
                perm.isActive &&
                !perm.isDeleted
        )
        .map((perm) => ({
            value: perm.id,
            label: `${perm.name} (${perm.key})`
        }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assign Permission to Role"
            subtitle="Grant an active permission to a role."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <Select
                    label="Select Role"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleChange}
                    placeholder="Choose a role"
                    options={roleOptions}
                    required
                />

                <Select
                    label="Select Permission"
                    name="permissionId"
                    value={formData.permissionId}
                    onChange={handleChange}
                    placeholder="Choose a permission"
                    options={permissionOptions}
                    required
                />

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
                        loadingText="Assigning..."
                    >
                        Assign Permission
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
