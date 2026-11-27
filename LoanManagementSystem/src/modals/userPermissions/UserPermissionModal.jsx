import { useEffect, useState } from "react";
import { Modal, Select, Button } from "../../components/common";

export default function UserPermissionModal({
    isOpen,
    onClose,
    onSubmit,
    users = [],
    permissions = []
}) {
    const [userId, setUserId] = useState("");
    const [permissionId, setPermissionId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setUserId("");
            setPermissionId("");
            setError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!userId || !permissionId) {
            setError("Please select both a user and a permission.");
            return;
        }

        try {
            setLoading(true);
            await onSubmit({
                userId: Number(userId),
                permissionId: Number(permissionId)
            });
            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to assign permission. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const userOptions = users
        .filter((item) => item.isActive && !item.isDeleted)
        .map((item) => ({
            value: item.id,
            label: `${item.fullName} (${item.email})`
        }));

    const permissionOptions = permissions
        .filter((item) => item.isActive && !item.isDeleted)
        .map((item) => ({
            value: item.id,
            label: `${item.name} (${item.key})`
        }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assign Permission to User"
            subtitle="Grant or re-grant an active permission to a user."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <Select
                    label="Select User"
                    name="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Choose a user"
                    options={userOptions}
                    required
                />

                <Select
                    label="Select Permission"
                    name="permissionId"
                    value={permissionId}
                    onChange={(e) => setPermissionId(e.target.value)}
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
