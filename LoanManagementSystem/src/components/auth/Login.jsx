
import { useState } from "react";
import api from "../../services/api";

function Login({ onSwitch }) {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", formData);

            const authData = response.data.data;

            localStorage.setItem("token", authData.token);
            localStorage.setItem("user", JSON.stringify(authData));

            alert("Login successful!");

            console.log("Logged in user:", authData);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to login. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-8">
                <span className="text-sm font-semibold tracking-[3px] text-orange-500">
                    WELCOME BACK
                </span>

                <h1 className="mt-3 text-4xl font-bold text-slate-900">
                    Sign In
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Access your Loan Management account.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Email Address
                    </label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Password
                    </label>

                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Signing In..." : "Sign In"}
                </button>

            </form>

            {/* Switch */}
            <div className="mt-7 text-center text-sm text-slate-500">
                Don't have an account?

                <button
                    type="button"
                    onClick={onSwitch}
                    className="ml-2 font-semibold text-orange-500 transition hover:text-orange-600"
                >
                    Sign Up
                </button>
            </div>

        </div>
    );
}

export default Login;
