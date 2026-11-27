import {
    Scale,
    Clock,
    Lock,
    FileSpreadsheet,
    Users2,
    Sparkles,
    ShieldCheck
} from "lucide-react";

export default function WhyChooseUs() {
    const pillars = [
        {
            title: "Transparent Pricing & Disclosed APR",
            description: "No hidden administrative charges or surprise compounding fees. Every installment, interest allocation, and repayment date is computed transparently using standard banking amortization.",
            icon: <Scale size={24} className="text-pink-600" />
        },
        {
            title: "Digital-First Application Workflow",
            description: "Say goodbye to bulky paperwork. Submit loan applications online, attach necessary identification and income verification documents, and link guarantors with ease.",
            icon: <Clock size={24} className="text-rose-500" />
        },
        {
            title: "Role-Based Security & Audit Logging",
            description: "Protected by enterprise-grade cryptographic standards and strict role-based access control. All credit assessments, approvals, and repayment logs maintain immutable audit records.",
            icon: <Lock size={24} className="text-pink-600" />
        },
        {
            title: "Flexible Tenures & Custom Facilities",
            description: "Whether you require short-term working capital or a multi-year residential mortgage, our facilities provide adaptable installment cycles tailored to your cash flow capabilities.",
            icon: <FileSpreadsheet size={24} className="text-rose-500" />
        },
        {
            title: "Dedicated Loan Officers",
            description: "Your applications are reviewed by certified credit officers who provide direct feedback, requested clarifications, and transparent assessment notes.",
            icon: <Users2 size={24} className="text-pink-600" />
        },
        {
            title: "Real-Time Payment Tracking",
            description: "Monitor your principal balance reduction, record offline or digital payments, and download certified payment receipts and amortization statements on demand.",
            icon: <ShieldCheck size={24} className="text-rose-500" />
        }
    ];

    return (
        <section id="why-choose-us" className="relative py-24 bg-white border-t border-pink-100 text-zinc-900">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-100/70 px-3.5 py-1 text-xs font-bold text-pink-700 shadow-sm">
                        <Sparkles size={13} className="text-pink-600" />
                        <span>Why Borrow With LMS</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                        Built on Integrity, Security, and Clarity
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-600">
                        We believe responsible lending begins with transparent numbers, objective credit evaluation, and respect for our borrowers' financial health.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pillars.map((pillar) => (
                        <div
                            key={pillar.title}
                            className="group rounded-3xl border border-pink-200/80 bg-white p-6 shadow-sm shadow-pink-500/5 transition-all duration-300 hover:border-pink-400 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-200 bg-pink-50/70 mb-5 group-hover:border-pink-400 transition-colors">
                                {pillar.icon}
                            </div>
                            <h3 className="text-base font-bold text-zinc-900 mb-2">
                                {pillar.title}
                            </h3>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                                {pillar.description}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
