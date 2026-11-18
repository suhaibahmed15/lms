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
        "w-full rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-orange-500/70 focus:bg-white/[0.10] focus:ring-4 focus:ring-orange-500/10";

    const labelClass = "mb-1.5 block text-sm font-medium text-zinc-300";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#121212] shadow-2xl shadow-black/80">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Add New User
                        </h2>

                        <p className="mt-1 text-sm text-zinc-400">
                            Enter user details below.
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
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    {/* Full Name */}
                    <div>
                        <label className={labelClass}>
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
                        <label className={labelClass}>
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
                        <label className={labelClass}>
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
                        <label className={labelClass}>
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
                        <label className={labelClass}>
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
                        <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.10] hover:text-white"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-500 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
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
