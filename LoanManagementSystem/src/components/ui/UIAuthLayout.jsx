
import React from "react";
import {
    ShieldCheck,
    LockKeyhole,
    Sparkles,
    ChartNoAxesCombined
} from "lucide-react";

const VIDEO_URL = "/videos/login_bg.mp4";

function UIAuthLayout({
    eyebrow,
    heading,
    description,
    children
}) {
    return (
        <div className="relative isolate flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#080808] px-4 py-8 sm:px-6 lg:px-10">

            {/* Video Background */}
            <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    src={VIDEO_URL}
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </div>

            {/* Background Overlays */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-black/65" />

            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-orange-950/40 via-black/40 to-black/80" />

            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,94,0,0.15),transparent_65%)]" />

            {/* Main Layout */}
            <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-16">

                {/* LEFT CONTENT - SAME POSITION */}
                <div className="mx-auto flex w-full max-w-xl flex-col justify-center text-center lg:mx-0 lg:min-h-[580px] lg:text-left">

                    {/* Brand */}
                    <div className="mb-8 flex items-center justify-center gap-3 lg:justify-start">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500/15 text-orange-400 shadow-lg shadow-orange-500/10">
                            <ShieldCheck size={27} />
                        </div>

                        <div>
                            <h2 className="text-xl font-extrabold tracking-wider text-white">
                                LMS <span className="text-orange-500">CAPITAL</span>
                            </h2>
                            <p className="text-xs tracking-widest text-zinc-400">
                                SMART LOAN MANAGEMENT
                            </p>
                        </div>
                    </div>

                    {/* Heading - FIXED HEIGHT */}
                    <div className="min-h-[190px] sm:min-h-[205px]">

                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-2">
                            <Sparkles size={14} className="text-orange-400" />
                            <span className="text-[10px] font-semibold uppercase tracking-[2px] text-orange-300">
                                {eyebrow}
                            </span>
                        </div>

                        <h1 className="min-h-[100px] text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
                            {heading}
                        </h1>

                        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-zinc-300 sm:text-base lg:mx-0">
                            {description}
                        </p>

                    </div>

                    {/* Features - SAME POSITION */}
                    <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-3 lg:grid-cols-1">

                        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                                <ChartNoAxesCombined size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    Smart Loan Management
                                </p>
                                <p className="text-xs text-zinc-400">
                                    Manage your loan activities easily.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                                <LockKeyhole size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    Secure Account Access
                                </p>
                                <p className="text-xs text-zinc-400">
                                    Your account access stays protected.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    Transparent Experience
                                </p>
                                <p className="text-xs text-zinc-400">
                                    Keep track of your applications.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* RIGHT FORM CARD - SAME POSITION */}
                <div className="relative mx-auto flex w-full max-w-xl items-center">

                    <div className="pointer-events-none absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-orange-500/20 via-transparent to-orange-500/10 blur-xl" />

                    <div className="relative w-full overflow-hidden rounded-3xl border border-white/15 bg-black/35 shadow-2xl shadow-black/50 backdrop-blur-2xl">

                        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/10 blur-[90px]" />

                        {/* Same top padding and heading position */}
                        <div className="relative z-10 p-5 sm:p-8 lg:p-9">
                            {children}
                        </div>

                    </div>
                </div>

            </div>

            {/* Footer */}
            <footer className="relative z-10 mt-8 w-full text-center text-xs text-zinc-500 lg:absolute lg:bottom-3 lg:left-0 lg:mt-0">
                © {new Date().getFullYear()} LMS Capital. All rights reserved.
            </footer>

        </div>
    );
}

export default UIAuthLayout;
