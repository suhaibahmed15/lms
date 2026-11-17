
import { useEffect, useState } from "react";
import { X } from "lucide-react";

function UserModal({
    isOpen,
    onClose,
    onSubmit,
    roles = []
}) {
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
            setFormData({
                fullName: "",
                email: "",
                phoneNumber: "",
                password: "",
                roleId: ""
            });

            setError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
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
                password: formData.password,
                roleId: Number(formData.roleId)
            };

            await onSubmit(userData);
            onClose();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create user. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-500";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b p-5">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Add New User
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Enter user details below.
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
                <form onSubmit={handleSubmit} className="space-y-4 p-5">

                    {/* Full Name */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            maxLength={150}
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Email Address
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            maxLength={150}
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Phone Number
                        </label>

                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            maxLength={30}
                            className={inputClass}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Minimum 8 characters"
                            minLength={8}
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Select Role
                        </label>

                        <select
                            name="roleId"
                            value={formData.roleId}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        >
                            <option value="">Select a role</option>

                            {roles
                                .filter((role) => role.isActive)
                                .map((role) => (
                                    <option
                                        key={role.id}
                                        value={role.id}
                                    >
                                        {role.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 border-t pt-4">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-emerald-600 px-5 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create User"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default UserModal;
