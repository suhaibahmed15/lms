
import React, { useState } from "react";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowRight
} from "lucide-react";

/* =====================================
   VIDEO BACKGROUND
===================================== */

const VideoBackground = ({ videoUrl }) => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#080808]">

            <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                src={videoUrl}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                    console.error(
                        "Background video error:",
                        e.currentTarget.error
                    );
                }}
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/35 pointer-events-none" />

            {/* Pink cinematic lighting */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-950/20 via-transparent to-black/40 pointer-events-none" />

        </div>
    );
};

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

            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-pink-500">
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
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-12 pr-12 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-500 hover:border-white/20 focus:border-pink-500/70 focus:bg-white/[0.09] focus:ring-4 focus:ring-pink-500/10"
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
            await onSubmit(email, password, remember);
        } catch (err) {

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to sign in. Please try again."
            );

        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101010]/90 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-9">

            {/* Card Glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-pink-500/15 blur-[90px]" />

            <div className="relative z-10">

                {/* Brand */}
                <div className="mb-8 flex items-center gap-3">

                    <img
                        src="/logo.png"
                        alt="LMS Logo"
                        className="h-12 w-auto object-contain rounded-xl p-1 bg-white/5 border border-pink-500/20"
                    />

                    <div>
                        <h2 className="text-lg font-extrabold tracking-wide text-white">
                            LMS <span className="text-pink-500">CAPITAL</span>
                        </h2>

                        <p className="text-xs text-zinc-500">
                            Smart Loan Management
                        </p>
                    </div>

                </div>

                {/* Heading */}
                <div className="mb-8">

                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1">

                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-500" />

                        <span className="text-[10px] font-semibold uppercase tracking-[2px] text-pink-400">
                            Secure Access
                        </span>

                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Welcome Back
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Sign in to access your account and manage your financial activities.
                    </p>

                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Email */}
                    <div className="space-y-2">

                        <label className="text-sm font-medium text-zinc-300">
                            Email Address
                        </label>

                        <FormInput
                            icon={<Mail size={19} />}
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="username"
                            required
                        />

                    </div>

                    {/* Password */}
                    <div className="space-y-2">

                        <label className="text-sm font-medium text-zinc-300">
                            Password
                        </label>

                        <div className="relative">

                            <FormInput
                                icon={<Lock size={19} />}
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-pink-500"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff size={19} />
                                ) : (
                                    <Eye size={19} />
                                )}
                            </button>

                        </div>

                    </div>

                    {/* Remember / Forgot */}
                    <div className="flex items-center justify-between gap-3">

                        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-400">

                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="h-4 w-4 cursor-pointer accent-pink-500"
                            />

                            Remember me

                        </label>

                        <button
                            type="button"
                            className="text-sm font-medium text-pink-400 transition hover:text-pink-300"
                        >
                            Forgot Password?
                        </button>

                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-500/25 transition-all duration-300 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >

                        <span>
                            {isSubmitting ? "Signing In..." : "Sign In"}
                        </span>

                    </button>

                </form>

                {/* Divider */}
                <div className="my-7 h-px bg-white/10" />

                {/* Register */}
                <p className="text-center text-sm text-zinc-400">

                    Don't have an account?{" "}

                    <button
                        type="button"
                        onClick={onSwitch}
                        className="font-semibold text-pink-400 transition hover:text-pink-300 cursor-pointer"
                    >
                        Create Account
                    </button>

                </p>

            </div>

        </div>
    );
};

/* =====================================
   DEFAULT EXPORT
===================================== */

const LoginPage = {
    LoginForm,
    VideoBackground
};

export default LoginPage;
