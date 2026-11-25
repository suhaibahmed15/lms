import { useState } from "react";
import api from "../../services/api";
import GamingAuthLayout from "../ui/UIAuthLayout";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input, Button } from "../common";

export default function Login({ onSwitch, onLoginSuccess }) {
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
                <Input
                    label="Email Address"
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    icon={Mail}
                />

                <Input
                    label="Password"
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    icon={Lock}
                    iconRight={
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="cursor-pointer text-zinc-500 transition hover:text-orange-400"
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    }
                />

                {/* Remember Me */}
                <div className="flex items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="h-4 w-4 cursor-pointer accent-orange-500"
                        />
                        Remember me
                    </label>
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    loadingText="Signing In..."
                    className="w-full py-3.5 text-sm font-bold shadow-lg shadow-orange-500/20"
                >
                    Sign In
                </Button>
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
