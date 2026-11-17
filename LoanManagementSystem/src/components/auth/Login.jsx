
import React, { useState } from "react";
import api from "../../services/api";
import GamingAuthLayout from "../ui/UIAuthLayout";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight
} from "lucide-react";

function Login({ onSwitch, onLoginSuccess }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            const authData = response.data.data;

            if (!authData?.token) {
                throw new Error("Authentication token was not received.");
            }

            // Keep the existing authentication flow.
            // Remember Me is currently controlled by the parent flow.
            onLoginSuccess(authData, remember);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to sign in. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "h-12 w-full rounded-xl border border-white/10 bg-white/[0.07] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-orange-500/70 focus:bg-white/[0.10] focus:ring-4 focus:ring-orange-500/10";

    return (
        <GamingAuthLayout
            eyebrow="Welcome Back"
            heading="Your financial journey starts here."
            description="Access your LMS Capital account and manage your loan activities through one secure and convenient platform."
        >

            {/* Form Heading */}
            <div className="mb-7">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[2px] text-orange-400">
                    Secure Login
                </p>

                <h2 className="text-3xl font-bold text-white">
                    Sign In
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                    Enter your credentials to access your account.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">

                {/* Email */}
                <div>
                    <label
                        htmlFor="login-email"
                        className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                        Email Address
                    </label>

                    <div className="relative">
                        <Mail
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />

                        <input
                            id="login-email"
                            type="email"
                            placeholder="Enter your email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label
                        htmlFor="login-password"
                        className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                        Password
                    </label>

                    <div className="relative">
                        <Lock
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />

                        <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={inputClass}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-orange-400"
                            aria-label="Toggle password visibility"
                        >
                            {showPassword
                                ? <EyeOff size={18} />
                                : <Eye size={18} />
                            }
                        </button>
                    </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between gap-3">

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="h-4 w-4 accent-orange-500"
                        />
                        Remember me
                    </label>

                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Signing In..." : "Sign In"}

                    {!loading }
                </button>

            </form>

            {/* Signup Link */}
            <div className="mt-7 border-t border-white/10 pt-5 text-center">
                <p className="text-sm text-zinc-400">
                    Don't have an account?{" "}

                    <button
                        type="button"
                        onClick={onSwitch}
                        className="font-semibold text-orange-400 transition hover:text-orange-300"
                    >
                        Create Account
                    </button>
                </p>
            </div>

        </GamingAuthLayout>
    );
}

export default Login;
