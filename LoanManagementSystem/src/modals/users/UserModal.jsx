import { useEffect, useState } from "react";
import { Modal, Input, Select, Button } from "../../components/common";

export default function UserModal({
    isOpen,
    onClose,
    onSubmit,
    roles = [],
    user = null
}) {
    const isEdit = Boolean(user);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        roleId: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setFormData({
                    fullName: user.fullName || "",
                    email: user.email || "",
                    phoneNumber: user.phoneNumber || "",
                    password: "",
                    roleId: user.roleId ? String(user.roleId) : ""
                });
            } else {
                setFormData({
                    fullName: "",
                    email: "",
                    phoneNumber: "",
                    password: "",
                    roleId: ""
                });
            }
            setError("");
        }
    }, [isOpen, user]);

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

        try {
            setLoading(true);

            const userData = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                phoneNumber: formData.phoneNumber.trim() || null,
                roleId: Number(formData.roleId)
            };

            if (!isEdit) {
                userData.password = formData.password;
            }

            await onSubmit(userData);
            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                (isEdit ? "Unable to update user. Please try again." : "Unable to create user. Please try again.")
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Edit User" : "Add New User"}
            subtitle={isEdit ? "Update user profile details below." : "Enter user details below."}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <Input
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    required
                />

                <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. john@example.com"
                    required
                />

                <Input
                    label="Phone Number"
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="e.g. +1 234 567 890"
                />

                {!isEdit && (
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        required
                    />
                )}

                <Select
                    label="Role"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleChange}
                    placeholder="Select a role"
                    options={roleOptions}
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
                        loadingText={isEdit ? "Saving..." : "Creating..."}
                    >
                        {isEdit ? "Save Changes" : "Create User"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
