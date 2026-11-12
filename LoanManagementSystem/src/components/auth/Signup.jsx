import { useState } from "react";
import api from "../../services/api";

function Signup({ onSwitch }) {
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
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const getPasswordStrength = (pwd) => {
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length >= 8) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
        return score;
    };

    const strength = getPasswordStrength(formData.password);
    const strengthLabel = ["", "Weak", "Fair", "Strong", "Vault Grade"][strength];

    const passwordsMatch =
        formData.confirmPassword.length > 0 &&
        formData.password === formData.confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/register", formData);
            const authData = response.data.data;

            localStorage.setItem("token", authData.token);
            localStorage.setItem("user", JSON.stringify(authData));

            setSuccess("Account created! Your LMS Capital vault is ready.");
            console.log("Registered user:", authData);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to create account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Heading */}
            <div className="mb-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                    <span className="text-amber-300">$</span> Get Started
                </div>

                <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    Create Your Vault
                </h1>

                <p className="mt-1.5 text-sm text-zinc-400">
                    Register for instant USD loan access and portfolio tracking.
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200 sm:text-sm">
                    <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-rose-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Success Alert */}
            {success && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-4 py-3 text-xs text-emerald-200 sm:text-sm">
                    <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                    </svg>
                    <span>{success}</span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name & Phone Number Responsive Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="signup-fullname"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                        >
                            Full Name
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                    />
                                </svg>
                            </span>
                            <input
                                id="signup-fullname"
                                type="text"
                                name="fullName"
                                autoComplete="name"
                                placeholder="Alex Morgan"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-emerald-400 focus:bg-zinc-900 focus:ring-2 focus:ring-emerald-400/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="signup-phone"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                        >
                            Phone Number
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                                    />
                                </svg>
                            </span>
                            <input
                                id="signup-phone"
                                type="tel"
                                name="phoneNumber"
                                autoComplete="tel"
                                placeholder="+1 (555) 000-0000"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-emerald-400 focus:bg-zinc-900 focus:ring-2 focus:ring-emerald-400/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Email Address */}
                <div>
                    <label
                        htmlFor="signup-email"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                    >
                        Email Address
                    </label>
                    <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                />
                            </svg>
                        </span>
                        <input
                            id="signup-email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-white/10 bg-zinc-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-emerald-400 focus:bg-zinc-900 focus:ring-2 focus:ring-emerald-400/20"
                        />
                    </div>
                </div>

                {/* Password & Confirm Password Responsive Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="signup-password"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                                    />
                                </svg>
                            </span>
                            <input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                autoComplete="new-password"
                                placeholder="Min. 8 chars"
                                value={formData.password}
                                onChange={handleChange}
                                minLength={8}
                                required
                                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-emerald-400 focus:bg-zinc-900 focus:ring-2 focus:ring-emerald-400/20"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 transition hover:text-emerald-300"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    {showPassword ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                        />
                                    ) : (
                                        <>
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                            />
                                        </>
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="signup-confirm"
                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300"
                        >
                            Confirm Password
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                                    />
                                </svg>
                            </span>
                            <input
                                id="signup-confirm"
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                autoComplete="new-password"
                                placeholder="Repeat password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                minLength={8}
                                required
                                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-emerald-400 focus:bg-zinc-900 focus:ring-2 focus:ring-emerald-400/20"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide confirm password"
                                        : "Show confirm password"
                                }
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 transition hover:text-emerald-300"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    {showConfirmPassword ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                        />
                                    ) : (
                                        <>
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                            />
                                        </>
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Password Strength & Match Bar */}
                {formData.password && (
                    <div className="space-y-1.5 rounded-xl border border-white/5 bg-zinc-900/50 px-3.5 py-2.5">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-zinc-400">
                                Security Strength:{" "}
                                <span className="font-semibold text-emerald-300">
                                    {strengthLabel}
                                </span>
                            </span>
                            {formData.confirmPassword && (
                                <span
                                    className={`font-semibold ${
                                        passwordsMatch
                                            ? "text-emerald-400"
                                            : "text-rose-400"
                                    }`}
                                >
                                    {passwordsMatch
                                        ? "Passwords Match"
                                        : "Mismatch"}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                            {[1, 2, 3, 4].map((level) => (
                                <div
                                    key={level}
                                    className={`h-1.5 rounded-full transition-all ${
                                        strength >= level
                                            ? level <= 1
                                                ? "bg-rose-400"
                                                : level === 2
                                                ? "bg-amber-400"
                                                : "bg-emerald-400"
                                            : "bg-zinc-800"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-300 px-5 py-3.5 text-sm font-extrabold tracking-wide text-zinc-950 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-emerald-400/35 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                    {loading ? (
                        <>
                            <svg
                                className="h-4 w-4 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
                                />
                            </svg>
                            <span>Creating Vault...</span>
                        </>
                    ) : (
                        <>
                            <span>Create Capital Account</span>
                            <svg
                                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                />
                            </svg>
                        </>
                    )}
                </button>
            </form>

            {/* Switch Footer */}
            <div className="mt-5 border-t border-white/10 pt-4 text-center text-xs text-zinc-400 sm:text-sm">
                Already have an account?
                <button
                    type="button"
                    onClick={onSwitch}
                    className="ml-2 font-bold text-amber-300 transition hover:text-emerald-300"
                >
                    Sign In →
                </button>
            </div>
        </div>
    );
}

export default Signup;
