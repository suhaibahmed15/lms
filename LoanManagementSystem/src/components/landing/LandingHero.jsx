import {
    Calculator,
    ArrowRight,
    TrendingUp,
    Clock,
    CheckCircle2,
    Sparkles,
    Landmark
} from "lucide-react";

export default function LandingHero({ onOpenApplyModal }) {
    const scrollToCalculator = (e) => {
        e.preventDefault();
        const calculatorEl = document.querySelector("#calculator");
        if (calculatorEl) {
            calculatorEl.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section
            id="hero"
            className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden bg-gradient-to-b from-[#fff7f9] via-[#ffffff] to-[#fff0f5] text-zinc-900"
        >
            {/* Background glowing pink orbs */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[850px] rounded-full bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.22),transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,113,133,0.18),transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.14),transparent_70%)] blur-3xl" />

            {/* Background grid pattern */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(244,114,182,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,114,182,0.06)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* Left Column: Hero Text & CTAs */}
                    <div className="lg:col-span-7 text-center lg:text-left space-y-7">
                        
                        {/* Eyebrow badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-100/70 px-3.5 py-1.5 text-xs font-bold text-pink-700 shadow-sm backdrop-blur-sm">
                            <Sparkles size={14} className="text-pink-600" />
                            <span>Institutional Banking & Credit Management</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-zinc-900 tracking-tight leading-[1.12]">
                            Make Your Financial Goals <br className="hidden sm:inline" />
                            <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                                a Reality.
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="max-w-2xl text-base sm:text-lg text-zinc-600 leading-relaxed mx-auto lg:mx-0">
                            Discover flexible loan options, calculate your estimated repayments, and take control of your financial future with confidence.
                        </p>

                        {/* Two CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                            <a
                                href="#calculator"
                                onClick={scrollToCalculator}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-500/25 hover:from-pink-600 hover:to-rose-600 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <Calculator size={18} />
                                <span>Calculate Your Loan</span>
                            </a>

                            <button
                                onClick={onOpenApplyModal}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-pink-200 bg-white px-7 py-3.5 text-sm font-semibold text-zinc-800 shadow-sm hover:border-pink-400 hover:bg-pink-50/70 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            >
                                <span>Apply for a Loan</span>
                                <ArrowRight size={18} className="text-pink-600" />
                            </button>
                        </div>

                        {/* Key Trust Pillars */}
                        <div className="pt-6 border-t border-pink-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-100/80 text-pink-600 border border-pink-200">
                                    <CheckCircle2 size={16} />
                                </div>
                                <div className="text-xs">
                                    <p className="font-semibold text-zinc-900">Instant Estimate</p>
                                    <p className="text-zinc-500">Zero sign-in needed</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-100/80 text-pink-600 border border-pink-200">
                                    <TrendingUp size={16} />
                                </div>
                                <div className="text-xs">
                                    <p className="font-semibold text-zinc-900">Competitive Rates</p>
                                    <p className="text-zinc-500">Fixed & transparent APR</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-100/80 text-pink-600 border border-pink-200">
                                    <Clock size={16} />
                                </div>
                                <div className="text-xs">
                                    <p className="font-semibold text-zinc-900">Fast Decisioning</p>
                                    <p className="text-zinc-500">Digital loan review</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Visual Fintech Preview Card */}
                    <div className="lg:col-span-5 relative">
                        <div className="relative mx-auto max-w-md rounded-3xl border border-pink-200/90 bg-white/95 p-6 sm:p-7 shadow-2xl shadow-pink-500/10 backdrop-blur-xl">
                            
                            {/* Card Header */}
                            <div className="flex items-center justify-between border-b border-pink-100 pb-4 mb-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100/80 text-pink-600 border border-pink-200">
                                        <Landmark size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-900">LMS Smart Calculator</h4>
                                        <p className="text-[11px] text-zinc-500">Live Financial Preview</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-pink-100/70 px-2.5 py-0.5 text-[11px] font-semibold text-pink-700 border border-pink-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                                    Active Facility
                                </span>
                            </div>

                            {/* Sample calculation preview */}
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-pink-100 bg-pink-50/40 p-4">
                                    <div className="flex justify-between text-xs text-zinc-600 mb-1 font-medium">
                                        <span>Sample Principal Amount</span>
                                        <span className="font-bold text-zinc-900">PKR 500,000</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-pink-100 overflow-hidden">
                                        <div className="h-full w-2/3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="rounded-2xl border border-pink-100 bg-pink-50/40 p-3">
                                        <span className="text-zinc-500 block mb-1">Selected Tenure</span>
                                        <span className="text-sm font-bold text-zinc-900">24 Months</span>
                                    </div>
                                    <div className="rounded-2xl border border-pink-100 bg-pink-50/40 p-3">
                                        <span className="text-zinc-500 block mb-1">Annual Rate</span>
                                        <span className="text-sm font-bold text-pink-600">12.5% APR</span>
                                    </div>
                                </div>

                                {/* Highlighted Estimated EMI */}
                                <div className="rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 via-white to-rose-50/60 p-4 text-center shadow-inner">
                                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-500 block mb-1">
                                        Estimated Monthly Installment (EMI)
                                    </span>
                                    <div className="text-2xl sm:text-3xl font-extrabold text-pink-600 tracking-tight">
                                        PKR 23,656
                                        <span className="text-xs font-normal text-zinc-500 ml-1">/ month</span>
                                    </div>
                                    <div className="mt-2 text-[11px] text-zinc-500 flex items-center justify-center gap-1 font-medium">
                                        <span>Total Interest: PKR 67,744</span>
                                        <span>•</span>
                                        <span>Total: PKR 567,744</span>
                                    </div>
                                </div>

                                <button
                                    onClick={scrollToCalculator}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-pink-50 border border-pink-200 py-2.5 text-xs font-semibold text-zinc-800 hover:border-pink-300 transition-colors cursor-pointer shadow-sm"
                                >
                                    <Calculator size={14} className="text-pink-600" />
                                    <span>Try Interactive Calculator Below</span>
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
