
import React, { useState } from "react";
import api from "../../services/api";
import GamingAuthLayout from "../ui/UIAuthLayout";
import {
    User,
    Phone,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight
} from "lucide-react";

function Signup({ onSwitch, onLoginSuccess }) {

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
    };

    const getPasswordStrength = (password) => {
        if (!password) return 0;

        let score = 0;

        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        return score;
    };

    const strength = getPasswordStrength(formData.password);

    const strengthLabels = [
        "",
        "Weak",
        "Fair",
        "Strong",
        "Vault Grade"
    ];

    const passwordsMatch =
        formData.confirmPassword.length > 0 &&
        formData.password === formData.confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/register", formData);

            const authData = response.data.data;

            if (!authData?.token) {
                throw new Error(
                    "Registration successful, but authentication token was not received."
                );
            }

            onLoginSuccess(authData);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to create account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "h-12 w-full rounded-xl border border-white/10 bg-white/[0.07] pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-orange-500/70 focus:bg-white/[0.10] focus:ring-4 focus:ring-orange-500/10";

    const labelClass =
        "mb-2 block text-sm font-medium text-zinc-300";

    return (
        <UIAuthLayout
            eyebrow="Join LMS Capital"
            heading="Build a smarter financial future."
            description="Create your account and experience a simple, secure, and transparent way to manage your loan applications."
        >

            {/* Form Heading */}
            <div className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[2px] text-orange-400">
                    Secure Registration
                </p>

                <h2 className="text-3xl font-bold text-white">
                    Create Account
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                    Fill in your details to get started.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Full Name */}
                <div>
                    <label htmlFor="signup-fullName" className={labelClass}>
                        Full Name
                    </label>

                    <div className="relative">
                        <User
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />

                        <input
                            id="signup-fullName"
                            type="text"
                            name="fullName"
                            placeholder="Enter your full name"
                            autoComplete="name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="signup-email" className={labelClass}>
                        Email Address
                    </label>

                    <div className="relative">
                        <Mail
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />

                        <input
                            id="signup-email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <label htmlFor="signup-phone" className={labelClass}>
                        Phone Number
                    </label>

                    <div className="relative">
                        <Phone
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />

                        <input
                            id="signup-phone"
                            type="tel"
                            name="phoneNumber"
                            placeholder="Enter phone number"
                            autoComplete="tel"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    {/* Password */}
                    <div>
                        <label htmlFor="signup-password" className={labelClass}>
                            Password
                        </label>

                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                            />

                            <input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Minimum 8 characters"
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange}
                                minLength={8}
                                required
                                className={inputClass}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-orange-400"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword
                                    ? <EyeOff size={18} />
                                    : <Eye size={18} />
                                }
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="signup-confirmPassword" className={labelClass}>
                            Confirm Password
                        </label>

                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                            />

                            <input
                                id="signup-confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Repeat password"
                                autoComplete="new-password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                minLength={8}
                                required
                                className={inputClass}
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-orange-400"
                                aria-label="Toggle confirm password visibility"
                            >
                                {showConfirmPassword
                                    ? <EyeOff size={18} />
                                    : <Eye size={18} />
                                }
                            </button>
                        </div>
                    </div>

                </div>

                {/* Password Strength */}
                {formData.password && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">

                        <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="text-zinc-400">
                                Password Strength
                            </span>

                            <span className="font-semibold text-orange-400">
                                {strengthLabels[strength]}
                            </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5">
                            {[1, 2, 3, 4].map((level) => (
                                <div
                                    key={level}
                                    className={`h-1.5 rounded-full transition-all ${
                                        strength >= level
                                            ? level === 1
                                                ? "bg-red-500"
                                                : level === 2
                                                ? "bg-amber-500"
                                                : "bg-orange-500"
                                            : "bg-zinc-700"
                                    }`}
                                />
                            ))}
                        </div>

                        {formData.confirmPassword && (
                            <p className={`mt-2 text-xs ${
                                passwordsMatch
                                    ? "text-emerald-400"
                                    : "text-red-400"
                            }`}>
                                {passwordsMatch
                                    ? "Passwords match"
                                    : "Passwords do not match"}
                            </p>
                        )}

                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Creating Account..." : "Create Account"}

                    {!loading }
                </button>

            </form>

            {/* Login Link */}
            <div className="mt-6 border-t border-white/10 pt-5 text-center">
                <p className="text-sm text-zinc-400">
                    Already have an account?{" "}

                    <button
                        type="button"
                        onClick={onSwitch}
                        className="font-semibold text-orange-400 transition hover:text-orange-300"
                    >
                        Sign In
                    </button>
                </p>
            </div>

        </UIAuthLayout>
    );
}

export default Signup;
