import {
    Compass,
    Calculator,
    UserCheck,
    FileCheck2,
    Sparkles
} from "lucide-react";

export default function HowItWorks() {
    const steps = [
        {
            number: "01",
            title: "Explore Loan Options",
            description: "Review our structured loan schemes, compare interest rates, and evaluate financing limits tailored for personal, vehicle, SME business, or mortgage needs.",
            icon: <Compass size={24} className="text-pink-600" />
        },
        {
            number: "02",
            title: "Calculate Estimated Installments",
            description: "Use our interactive financial calculator to experiment with loan amounts and repayment durations. Review your estimated monthly installment (EMI) with zero obligation.",
            icon: <Calculator size={24} className="text-pink-600" />
        },
        {
            number: "03",
            title: "Create an Account or Log In",
            description: "Access your customer portal in two minutes. Verify your email and contact information securely to unlock formal application processing.",
            icon: <UserCheck size={24} className="text-pink-600" />
        },
        {
            number: "04",
            title: "Submit Your Loan Application",
            description: "Complete your online application with required documentation, register a guarantor if required by your scheme, and track credit review in real time.",
            icon: <FileCheck2 size={24} className="text-pink-600" />
        }
    ];

    return (
        <section id="how-it-works" className="relative py-24 bg-gradient-to-b from-[#fff7f9] via-pink-50/25 to-[#ffffff] border-t border-pink-100 text-zinc-900">
            {/* Ambient subtle glow */}
            <div className="pointer-events-none absolute top-12 right-10 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-100/70 px-3.5 py-1 text-xs font-bold text-pink-700 shadow-sm">
                        <Sparkles size={13} className="text-pink-600" />
                        <span>Simple 4-Step Customer Journey</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                        How It Works
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-600">
                        From loan discovery to fund sanction, our transparent digital platform makes the borrowing experience clear, seamless, and completely manageable.
                    </p>
                </div>

                {/* 4-Step Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className="relative flex flex-col justify-between rounded-3xl border border-pink-200/80 bg-white p-6 shadow-md shadow-pink-500/5 transition-all duration-300 hover:border-pink-400 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1"
                        >
                            <div>
                                {/* Step Number & Icon */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-200 bg-pink-50/70 shadow-sm">
                                        {step.icon}
                                    </div>
                                    <span className="font-mono text-2xl font-black text-pink-200">
                                        {step.number}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-zinc-900 mb-2">
                                    {step.title}
                                </h3>

                                <p className="text-xs text-zinc-600 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
