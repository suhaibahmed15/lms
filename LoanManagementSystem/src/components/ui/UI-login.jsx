import React, { useState } from "react";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowRight
} from "lucide-react";

/* =====================================
   INPUT COMPONENT
===================================== */

const FormInput = ({
    icon,
    type,
    placeholder,
    value,
    onChange,
    required,
    name,
    autoComplete
}) => {
    return (
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-pink-600">
                {icon}
            </div>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                autoComplete={autoComplete}
                className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-12 text-sm text-zinc-900 outline-none transition-all duration-300 placeholder:text-zinc-400 hover:border-pink-300 focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/15"
            />
        </div>
    );
};

/* =====================================
   LOGIN FORM
===================================== */

const LoginForm = ({ onSubmit, onSwitch }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            if (onSubmit) {
                await onSubmit({ email, password, remember });
            }
        } catch (err) {
            setError(err.message || "Sign in failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <FormInput
                    icon={<Mail size={18} />}
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                />

                <div className="relative">
                    <FormInput
                        icon={<Lock size={18} />}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-pink-600"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-600 font-medium">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="rounded accent-pink-600"
                        />
                        Remember me
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 py-3 text-sm font-bold text-zinc-900 shadow-lg shadow-pink-500/25 transition hover:from-pink-600 hover:to-rose-600"
                >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                </button>
            </form>

            <div className="mt-6 border-t border-pink-100 pt-4 text-center text-sm text-zinc-600">
                Don't have an account?{" "}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="font-bold text-pink-600 hover:text-pink-700"
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
};

export default LoginForm;
