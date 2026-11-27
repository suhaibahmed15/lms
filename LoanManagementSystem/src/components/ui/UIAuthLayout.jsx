import React from "react";
import {
    ShieldCheck,
    LockKeyhole,
    Sparkles,
    ChartNoAxesCombined
} from "lucide-react";

function UIAuthLayout({
    eyebrow,
    heading,
    description,
    children
}) {
    return (
        <div className="relative isolate flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-gradient-to-br from-pink-50 via-white to-rose-50 px-4 py-8 sm:px-6 lg:px-10 text-zinc-900">

            {/* Aesthetic Light Glowing Ambient Highlights */}
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(244,114,182,0.18),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(251,113,133,0.14),transparent_60%)]" />

            {/* Main Layout */}
            <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-16">

                {/* LEFT CONTENT */}
                <div className="mx-auto flex w-full max-w-xl flex-col justify-center text-center lg:mx-0 lg:min-h-[580px] lg:text-left">

                    {/* Brand */}
                    <div className="mb-8 flex items-center justify-center lg:justify-start">
                        <img src="/logo.png" alt="LMS Loan Management System" className="h-14 w-auto max-w-[230px] object-contain drop-shadow-sm" />
                    </div>

                    {/* Heading */}
                    <div className="min-h-[190px] sm:min-h-[205px]">

                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-100/70 px-4 py-2">
                            <Sparkles size={14} className="text-pink-600" />
                            <span className="text-[10px] font-bold uppercase tracking-[2px] text-pink-700">
                                {eyebrow}
                            </span>
                        </div>

                        <h1 className="min-h-[100px] text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
                            {heading}
                        </h1>

                        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-zinc-600 sm:text-base lg:mx-0">
                            {description}
                        </p>

                    </div>

                    {/* Features */}
                    <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-3 lg:grid-cols-1">

                        <div className="flex items-center gap-3.5 rounded-2xl border border-pink-200/80 bg-white/90 p-4 shadow-sm shadow-pink-500/5 backdrop-blur-md">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100/80 text-pink-600">
                                <ChartNoAxesCombined size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-900">
                                    Smart Loan Management
                                </p>
                                <p className="text-xs text-zinc-500">
                                    Manage your loan activities easily.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5 rounded-2xl border border-pink-200/80 bg-white/90 p-4 shadow-sm shadow-pink-500/5 backdrop-blur-md">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100/80 text-pink-600">
                                <LockKeyhole size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-900">
                                    Secure Account Access
                                </p>
                                <p className="text-xs text-zinc-500">
                                    Your account access stays protected.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5 rounded-2xl border border-pink-200/80 bg-white/90 p-4 shadow-sm shadow-pink-500/5 backdrop-blur-md">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100/80 text-pink-600">
                                <ShieldCheck size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-900">
                                    Transparent Experience
                                </p>
                                <p className="text-xs text-zinc-500">
                                    Keep track of your applications.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* RIGHT FORM CARD */}
                <div className="relative mx-auto flex w-full max-w-xl items-center">

                    <div className="pointer-events-none absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-pink-400/20 via-pink-300/10 to-rose-400/20 blur-xl" />

                    <div className="relative w-full overflow-hidden rounded-3xl border border-pink-200/90 bg-white/95 shadow-2xl shadow-pink-500/10 backdrop-blur-2xl">

                        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-pink-200/30 blur-[90px]" />

                        <div className="relative z-10 p-6 sm:p-9 lg:p-10">
                            {children}
                        </div>

                    </div>
                </div>

            </div>

            {/* Footer */}
            <footer className="relative z-10 mt-8 w-full text-center text-xs text-zinc-500 lg:absolute lg:bottom-4 lg:left-0 lg:mt-0 font-medium">
                © {new Date().getFullYear()} LMS Capital. All rights reserved.
            </footer>

        </div>
    );
}

export default UIAuthLayout;
