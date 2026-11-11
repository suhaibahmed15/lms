
import { useState } from "react";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

function App() {
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div className="flex min-h-screen bg-white">

            {/* LEFT SIDE - BRANDING */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">

                {/* Background Design */}
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl"></div>
                <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>

                {/* Logo */}
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold tracking-tight">
                        LMS<span className="text-orange-500">.</span>
                    </h2>
                </div>

                {/* Brand Content */}
                <div className="relative z-10 max-w-xl">

                    <span className="mb-6 inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-semibold tracking-[3px] text-orange-400">
                        SMART FINANCIAL MANAGEMENT
                    </span>

                    <h1 className="text-5xl font-bold leading-tight xl:text-6xl">
                        Manage Loans.
                        <br />
                        <span className="text-orange-500">
                            Build Your Future.
                        </span>
                    </h1>

                    <p className="mt-7 max-w-md text-lg leading-8 text-slate-400">
                        A smarter way to manage loan applications,
                        approvals and repayments — all in one place.
                    </p>

                    {/* Features */}
                    <div className="mt-12 space-y-5">

                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                                ✓
                            </div>
                            <p className="text-sm text-slate-300">
                                Simple Loan Application Management
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                                ✓
                            </div>
                            <p className="text-sm text-slate-300">
                                Secure Approval Workflows
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                                ✓
                            </div>
                            <p className="text-sm text-slate-300">
                                Efficient Repayment Tracking
                            </p>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 border-t border-slate-800 pt-6">
                    <p className="text-sm text-slate-500">
                        © 2026 Loan Management System. All rights reserved.
                    </p>
                </div>

            </div>

            {/* RIGHT SIDE - AUTHENTICATION */}
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 px-6 py-10 lg:w-1/2 lg:bg-white">

                {/* Mobile Logo */}
                <div className="mb-10 lg:hidden">
                    <h2 className="text-3xl font-bold text-slate-950">
                        LMS<span className="text-orange-500">.</span>
                    </h2>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-md">

                    {showLogin ? (
                        <Login
                            onSwitch={() => setShowLogin(false)}
                        />
                    ) : (
                        <Signup
                            onSwitch={() => setShowLogin(true)}
                        />
                    )}

                </div>

                {/* Mobile Footer */}
                <div className="mt-12 text-center lg:hidden">
                    <p className="text-xs text-slate-400">
                        © 2026 Loan Management System
                    </p>
                </div>

            </div>

        </div>
    );
}

export default App;
