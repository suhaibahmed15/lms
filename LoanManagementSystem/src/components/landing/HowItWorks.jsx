import {
    Compass,
    Calculator,
    UserCheck,
    FileCheck2,
    ArrowRight,
    Sparkles
} from "lucide-react";

export default function HowItWorks({ onOpenApplyModal }) {
    const steps = [
        {
            number: "01",
            title: "Explore Loan Options",
            description: "Review our structured loan schemes, compare interest rates, and evaluate financing limits tailored for personal, vehicle, SME business, or mortgage needs.",
            icon: <Compass size={24} className="text-pink-400" />
        },
        {
            number: "02",
            title: "Calculate Estimated Installments",
            description: "Use our interactive financial calculator to experiment with loan amounts and repayment durations. Review your estimated monthly installment (EMI) with zero obligation.",
            icon: <Calculator size={24} className="text-white" />
        },
        {
            number: "03",
            title: "Create an Account or Log In",
            description: "Access your customer portal in two minutes. Verify your email and contact information securely to unlock formal application processing.",
            icon: <UserCheck size={24} className="text-pink-300" />
        },
        {
            number: "04",
            title: "Submit Your Loan Application",
            description: "Complete your online application with required documentation, register a guarantor if required by your scheme, and track credit review in real time.",
            icon: <FileCheck2 size={24} className="text-rose-400" />
        }
    ];

    return (
        <section id="how-it-works" className="relative py-24 bg-black border-t border-pink-500/20">
            {/* Ambient subtle glow */}
            <div className="pointer-events-none absolute top-12 right-10 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1 text-xs font-semibold text-pink-300">
                        <Sparkles size={13} />
                        <span>Simple 4-Step Customer Journey</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        How It Works
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-300">
                        From loan discovery to fund sanction, our transparent digital platform makes the borrowing experience clear, seamless, and completely manageable.
                    </p>
                </div>

                {/* 4-Step Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {steps.map((step, idx) => (
                        <div
                            key={step.number}
                            className="relative flex flex-col justify-between rounded-2xl border border-pink-500/20 bg-black/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-pink-500/50 hover:bg-black hover:shadow-lg hover:shadow-pink-950/30"
                        >
                            <div>
                                {/* Step Number & Icon */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-950 shadow-inner">
                                        {step.icon}
                                    </div>
                                    <span className="font-mono text-2xl font-black text-zinc-700 select-none">
                                        {step.number}
                                    </span>
                                </div>

                                {/* Step Title */}
                                <h3 className="text-base font-bold text-white mb-2">
                                    {step.title}
                                </h3>

                                {/* Step Description */}
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* Bottom visual indicator */}
                            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] font-semibold text-pink-400">
                                <span>Step {idx + 1} of 4</span>
                                {idx < 3 && <ArrowRight size={12} className="text-zinc-600" />}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA bar */}
                <div className="mt-14 rounded-2xl border border-pink-500/30 bg-gradient-to-r from-black via-pink-950/20 to-black p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-pink-950/20">
                    <div className="space-y-1 text-center sm:text-left">
                        <h4 className="text-lg font-bold text-white">
                            Ready to apply for your loan facility?
                        </h4>
                        <p className="text-xs text-zinc-400">
                            Create your verified account in minutes and track your application status anytime.
                        </p>
                    </div>

                    <button
                        onClick={onOpenApplyModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 px-6 py-3 text-xs font-bold text-white shadow-md shadow-pink-500/25 hover:from-pink-500 hover:to-rose-300 transition-all cursor-pointer shrink-0"
                    >
                        <span>Start Your Application</span>
                        <ArrowRight size={15} />
                    </button>
                </div>

            </div>
        </section>
    );
}
