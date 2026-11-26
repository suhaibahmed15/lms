import { useEffect, useState } from "react";
import { Modal, Input, Select, Button } from "../../components/common";

export default function MenuModal({
    isOpen,
    onClose,
    onSubmit,
    selectedMenu,
    menus = []
}) {
    const [formData, setFormData] = useState({
        name: "",
        key: "",
        route: "",
        icon: "",
        displayOrder: 0,
        parentMenuId: "",
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (selectedMenu) {
            setFormData({
                name: selectedMenu.name || "",
                key: selectedMenu.key || "",
                route: selectedMenu.route || "",
                icon: selectedMenu.icon || "",
                displayOrder: selectedMenu.displayOrder ?? 0,
                parentMenuId: selectedMenu.parentMenuId ?? "",
                isActive: selectedMenu.isActive ?? true
            });
        } else {
            setFormData({
                name: "",
                key: "",
                route: "",
                icon: "",
                displayOrder: 0,
                parentMenuId: "",
                isActive: true
            });
        }

        setError("");
    }, [selectedMenu, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            const menuData = {
                name: formData.name.trim(),
                key: formData.key.trim(),
                route: formData.route.trim() || null,
                icon: formData.icon.trim() || null,
                displayOrder: Number(formData.displayOrder),
                parentMenuId: formData.parentMenuId
                    ? Number(formData.parentMenuId)
                    : null,
                isActive: formData.isActive
            };

            await onSubmit(menuData);
            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const parentMenuOptions = menus
        .filter((menu) => menu.parentMenuId === null && menu.id !== selectedMenu?.id)
        .map((menu) => ({
            value: menu.id,
            label: menu.name
        }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={selectedMenu ? "Edit Menu" : "Add New Menu"}
            subtitle={selectedMenu ? "Update menu configuration." : "Configure a new sidebar navigation menu."}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <Input
                    label="Menu Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="Enter menu name"
                />

                <Input
                    label="Menu Key"
                    name="key"
                    value={formData.key}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="e.g. USER_MANAGEMENT"
                />

                <Input
                    label="Route"
                    name="route"
                    value={formData.route}
                    onChange={handleChange}
                    maxLength={250}
                    placeholder="e.g. /users"
                />

                <Input
                    label="Icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="e.g. users"
                />

                <Input
                    label="Display Order"
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    min="0"
                    required
                />

                <Select
                    label="Parent Menu"
                    name="parentMenuId"
                    value={formData.parentMenuId}
                    onChange={handleChange}
                    placeholder="No Parent (Main Menu)"
                    options={parentMenuOptions}
                />

                <div className="flex items-center gap-2.5 pt-1">
                    <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="h-4 w-4 cursor-pointer accent-pink-500"
                    />
                    <label
                        htmlFor="isActive"
                        className="cursor-pointer text-sm font-medium text-zinc-300"
                    >
                        Active Menu
                    </label>
                </div>

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
                        {selectedMenu ? "Update Menu" : "Create Menu"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
