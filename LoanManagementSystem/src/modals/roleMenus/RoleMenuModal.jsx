import { useEffect, useState } from "react";
import { Modal, Select, Button } from "../../components/common";

export default function RoleMenuModal({
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
        setFormData((prev) => ({
            ...prev,
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

    const roleOptions = roles
        .filter((role) => role.isActive && !role.isDeleted)
        .map((role) => ({
            value: role.id,
            label: `${role.name} (${role.key})`
        }));

    const menuOptions = menus
        .filter((menu) => menu.isActive && !menu.isDeleted)
        .map((menu) => ({
            value: menu.id,
            label: `${menu.name} (${menu.key})`
        }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assign Menu to Role"
            subtitle="Select a role and menu to create a role menu assignment."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
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
                    label="Select Menu"
                    name="menuId"
                    value={formData.menuId}
                    onChange={handleChange}
                    placeholder="Choose a menu"
                    options={menuOptions}
                    required
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
                        loadingText="Assigning..."
                    >
                        Assign Menu
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
