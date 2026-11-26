import { useState } from "react";
import api from "../../services/api";
import UIAuthLayout from "../ui/UIAuthLayout";
import { User, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input, Button } from "../common";

export default function Signup({ onSwitch, onLoginSuccess }) {
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
        setFormData((prev) => ({
            ...prev,
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
    const strengthLabels = ["", "Weak", "Fair", "Strong", "Vault Grade"];

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

    return (
        <UIAuthLayout
            eyebrow="Get Started"
            heading="Join LMS Capital today."
            description="Create your account to apply for personal and commercial loans, track real-time approvals, and manage repayments."
        >
            {/* Form Heading */}
            <div className="mb-7">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[2px] text-pink-400">
                    Registration
                </p>

                <h2 className="text-3xl font-bold text-white">
                    Create Account
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                    Fill in your details below to begin.
                </p>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Full Name"
                    id="signup-fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    icon={User}
                />

                <Input
                    label="Email Address"
                    id="signup-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    icon={Mail}
                />

                <Input
                    label="Phone Number"
                    id="signup-phone"
                    type="tel"
                    name="phoneNumber"
                    placeholder="Enter phone number"
                    autoComplete="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    icon={Phone}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Password"
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Min 8 characters"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        minLength={8}
                        required
                        icon={Lock}
                        iconRight={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="cursor-pointer text-zinc-500 hover:text-pink-400"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                    />

                    <Input
                        label="Confirm Password"
                        id="signup-confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        minLength={8}
                        required
                        icon={Lock}
                        iconRight={
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="cursor-pointer text-zinc-500 hover:text-pink-400"
                                aria-label="Toggle confirm password visibility"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                    />
                </div>

                {/* Password Strength */}
                {formData.password && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                        <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="text-zinc-400">Password Strength</span>
                            <span className="font-semibold text-pink-400">
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
                                                ? "bg-rose-500"
                                                : level === 2
                                                ? "bg-pink-400"
                                                : "bg-pink-500"
                                            : "bg-zinc-700"
                                    }`}
                                />
                            ))}
                        </div>

                        {formData.confirmPassword && (
                            <p className={`mt-2 text-xs ${
                                passwordsMatch ? "text-pink-300" : "text-rose-400"
                            }`}>
                                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                            </p>
                        )}
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    loadingText="Creating Account..."
                    className="w-full py-3.5 text-sm font-bold shadow-lg shadow-pink-500/25"
                >
                    Create Account
                </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 border-t border-white/10 pt-5 text-center">
                <p className="text-sm text-zinc-400">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitch}
                        className="font-semibold text-pink-400 transition hover:text-pink-300"
                    >
                        Sign In
                    </button>
                </p>
            </div>
        </UIAuthLayout>
    );
}
