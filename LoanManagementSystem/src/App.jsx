import { useState } from "react";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

function App() {
    const [showLogin, setShowLogin] = useState(true);

    const activeBackground = showLogin
        ? "/images/dollar-wealth-bg.jpg"
        : "/images/dollar-vault-bg.jpg";

    return (
        <div className="relative flex min-h-dvh w-full min-w-[320px] flex-col overflow-x-hidden bg-zinc-950 font-sans text-zinc-100 lg:flex-row">
            {/* Full-Bleed Dollar Aesthetic Background Image */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <img
                    src={activeBackground}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full scale-105 object-cover object-center opacity-55 transition-all duration-700 ease-out"
                />
                {/* Luxury Obsidian + Emerald Vignette Overlays */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 via-emerald-950/65 to-zinc-950/95" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/75" />

                {/* Ambient Dollar Glow Orbs */}
                <div className="absolute -left-28 -top-28 h-80 w-80 animate-pulse rounded-full bg-emerald-500/15 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
                <div className="absolute -bottom-32 -right-24 h-80 w-80 animate-pulse rounded-full bg-amber-400/10 blur-3xl sm:h-[28rem] sm:w-[28rem]" />

                {/* Subtle Dollar Watermark Motifs */}
                <div className="absolute left-8 top-1/4 hidden select-none text-[14rem] font-black leading-none text-emerald-400/[0.03] xl:block">
                    $
                </div>
                <div className="absolute bottom-8 right-12 hidden select-none text-[12rem] font-black leading-none text-amber-400/[0.03] lg:block">
                    $
                </div>
            </div>

            {/* MOBILE & TABLET TOP BAR */}
            <header className="relative z-10 flex items-center justify-between border-b border-emerald-400/15 bg-zinc-950/60 px-4 py-3.5 backdrop-blur-xl sm:px-6 lg:hidden">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-br from-emerald-500/25 to-amber-500/20 text-base font-black text-amber-300 shadow-lg shadow-emerald-950/50">
                        $
                    </div>
                    <div>
                        <span className="text-lg font-extrabold tracking-tight text-white">
                            LMS
                            <span className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">
                                .CAPITAL
                            </span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                    USD VAULT
                </div>
            </header>

            {/* LEFT SIDE - LUXURY DOLLAR BRANDING SHOWCASE (DESKTOP) */}
            <aside className="relative z-10 hidden w-full flex-col justify-between p-10 lg:flex lg:w-[50%] xl:w-[54%] xl:p-14">
                {/* Top Brand Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-gradient-to-br from-emerald-500/30 via-emerald-900/40 to-amber-500/20 text-2xl font-black text-amber-300 shadow-xl shadow-emerald-950/60 backdrop-blur-md">
                            $
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-white">
                                LMS
                                <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-amber-300 bg-clip-text text-transparent">
                                    .CAPITAL
                                </span>
                            </h2>
                            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-emerald-300/70">
                                Private Lending Suite
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-zinc-900/70 px-3.5 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                        256-Bit Vault Security
                    </div>
                </div>

                {/* Hero Content */}
                <div className="my-auto max-w-xl py-8">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 backdrop-blur-md">
                        <svg
                            className="h-3.5 w-3.5 text-amber-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>
                        Smart Dollar Wealth Engine
                    </div>

                    <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-white xl:text-5xl 2xl:text-6xl">
                        {showLogin ? (
                            <>
                                Command Capital.
                                <br />
                                <span className="bg-gradient-to-r from-emerald-300 via-green-400 to-amber-300 bg-clip-text text-transparent">
                                    Multiply Wealth.
                                </span>
                            </>
                        ) : (
                            <>
                                Unlock Instant
                                <br />
                                <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-green-400 bg-clip-text text-transparent">
                                    Dollar Liquidity.
                                </span>
                            </>
                        )}
                    </h1>

                    <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-300 xl:text-lg">
                        {showLogin
                            ? "Precision loan origination, real-time USD underwriting, and automated repayment intelligence — engineered inside one high-trust vault."
                            : "Open your private lending portal in seconds. Experience frictionless approvals, transparent yields, and complete dollar-level control."}
                    </p>

                    {/* Glassmorphic KPI Cards */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-emerald-400/20 bg-zinc-950/55 p-4 backdrop-blur-xl transition duration-300 hover:border-emerald-400/40">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                                    Capital Deployed
                                </span>
                                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                                    +18.4%
                                </span>
                            </div>
                            <p className="mt-2 text-2xl font-extrabold tracking-tight text-white xl:text-3xl">
                                $2.48B
                                <span className="ml-1 text-sm font-semibold text-amber-300">
                                    USD
                                </span>
                            </p>
                        </div>

                        <div className="rounded-2xl border border-amber-400/20 bg-zinc-950/55 p-4 backdrop-blur-xl transition duration-300 hover:border-amber-400/40">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                                    Approval Speed
                                </span>
                                <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                                    LIVE
                                </span>
                            </div>
                            <p className="mt-2 text-2xl font-extrabold tracking-tight text-white xl:text-3xl">
                                0.4s
                                <span className="ml-1.5 text-sm font-medium text-emerald-300">
                                    Instant
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Feature List */}
                    <div className="mt-7 space-y-3.5">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/15 text-emerald-300">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m4.5 12.75 6 6 9-13.5"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-zinc-200">
                                Streamlined Loan Origination & Instant Credit Scoring
                            </p>
                        </div>

                        <div className="flex items-center gap-3.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/15 text-amber-300">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-zinc-200">
                                Bank-Grade Approval Workflows & Treasury Compliance
                            </p>
                        </div>

                        <div className="flex items-center gap-3.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/15 text-emerald-300">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-zinc-200">
                                Real-Time USD Repayment Schedules & Yield Analytics
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-zinc-400">
                    <p>© 2026 LMS Capital. All rights reserved.</p>
                    <div className="flex items-center gap-4 text-zinc-400">
                        <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            USD Ledger Online
                        </span>
                        <span>ISO 27001</span>
                    </div>
                </div>
            </aside>

            {/* RIGHT SIDE - GLASSMORPHIC AUTHENTICATION STAGE */}
            <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:w-[50%] lg:px-10 xl:w-[46%] xl:px-14">
                {/* Compact Mobile KPI Banner */}
                <div className="mb-4 flex w-full max-w-md items-center justify-between rounded-2xl border border-emerald-400/20 bg-zinc-950/60 px-4 py-2.5 backdrop-blur-xl sm:max-w-lg lg:hidden">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-300">
                            $2.48B+
                        </span>
                        <span className="text-xs text-zinc-400">
                            Capital Managed
                        </span>
                    </div>
                    <span className="h-3.5 w-px bg-white/10" />
                    <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="text-xs font-medium text-emerald-300">
                            Instant Approvals
                        </span>
                    </div>
                </div>

                {/* Auth Glass Card */}
                <div className="w-full max-w-md rounded-3xl border border-emerald-400/20 bg-zinc-950/75 p-5 shadow-2xl shadow-black/80 ring-1 ring-amber-400/10 backdrop-blur-2xl sm:max-w-lg sm:p-8 lg:max-w-md xl:max-w-lg">
                    {/* Top Segmented Mode Switcher */}
                    <div className="mb-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-zinc-900/80 p-1">
                        <button
                            type="button"
                            onClick={() => setShowLogin(true)}
                            className={`rounded-xl py-2.5 text-xs font-bold tracking-wide transition-all duration-200 sm:text-sm ${
                                showLogin
                                    ? "bg-gradient-to-r from-emerald-500 to-amber-400 text-zinc-950 shadow-md shadow-emerald-500/20"
                                    : "text-zinc-400 hover:text-white"
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowLogin(false)}
                            className={`rounded-xl py-2.5 text-xs font-bold tracking-wide transition-all duration-200 sm:text-sm ${
                                !showLogin
                                    ? "bg-gradient-to-r from-emerald-500 to-amber-400 text-zinc-950 shadow-md shadow-emerald-500/20"
                                    : "text-zinc-400 hover:text-white"
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Active Form */}
                    {showLogin ? (
                        <Login onSwitch={() => setShowLogin(false)} />
                    ) : (
                        <Signup onSwitch={() => setShowLogin(true)} />
                    )}
                </div>

                {/* Mobile Footer */}
                <footer className="mt-6 text-center lg:hidden">
                    <p className="text-xs text-zinc-400">
                        © 2026 LMS Capital • Bank-Grade USD Encryption
                    </p>
                </footer>
            </main>
        </div>
    );
}

export default App;
