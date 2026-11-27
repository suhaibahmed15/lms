import { useState, useEffect } from "react";
import {
    Briefcase,
    Car,
    User,
    Home,
    Sparkles,
    ArrowRight,
    Calculator,
    CheckCircle2,
    ShieldAlert,
    TrendingUp,
    Calendar,
    Coins
} from "lucide-react";
import { getActiveLoanTypes } from "../../services/loanTypeService";

// Graceful defaults if backend is unreachable or requires auth for guests
const FALLBACK_LOAN_TYPES = [
    {
        id: 1,
        name: "Personal Loan",
        code: "PERS_LOAN",
        description: "Flexible, fast personal financing designed to cover education, medical needs, travel, or unexpected personal expenditures.",
        interestRate: 14.5,
        minAmount: 50000,
        maxAmount: 1500000,
        minTermMonths: 6,
        maxTermMonths: 48,
        requiresGuarantor: false,
        isActive: true
    },
    {
        id: 2,
        name: "Auto & Vehicle Loan",
        code: "AUTO_LOAN",
        description: "Turn your automotive dreams into reality with low financing rates for brand-new and certified pre-owned passenger vehicles.",
        interestRate: 11.75,
        minAmount: 200000,
        maxAmount: 6000000,
        minTermMonths: 12,
        maxTermMonths: 60,
        requiresGuarantor: true,
        isActive: true
    },
    {
        id: 3,
        name: "SME Commercial Business Loan",
        code: "BIZ_LOAN",
        description: "Empower commercial enterprise operations, inventory replenishment, machinery purchase, and strategic expansion.",
        interestRate: 10.5,
        minAmount: 500000,
        maxAmount: 15000000,
        minTermMonths: 12,
        maxTermMonths: 84,
        requiresGuarantor: true,
        isActive: true
    },
    {
        id: 4,
        name: "Home Mortgage Loan",
        code: "HOME_LOAN",
        description: "Long-term home purchase, residential property acquisition, construction, or structural remodeling with comfortable terms.",
        interestRate: 8.75,
        minAmount: 1000000,
        maxAmount: 30000000,
        minTermMonths: 24,
        maxTermMonths: 240,
        requiresGuarantor: true,
        isActive: true
    }
];

export default function LoanTypesSection({ onOpenApplyModal, onSelectForCalculator }) {
    const [loanTypes, setLoanTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchTypes = async () => {
            try {
                setLoading(true);
                const res = await getActiveLoanTypes();
                const list = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res)
                    ? res
                    : Array.isArray(res?.data?.data)
                    ? res.data.data
                    : [];

                if (isMounted) {
                    if (list.length > 0) {
                        setLoanTypes(list);
                    } else {
                        setLoanTypes(FALLBACK_LOAN_TYPES);
                    }
                }
            } catch {
                if (isMounted) {
                    setLoanTypes(FALLBACK_LOAN_TYPES);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchTypes();
        return () => { isMounted = false; };
    }, []);

    const formatCurrency = (val) => {
        return Number(val || 0).toLocaleString("en-PK", {
            maximumFractionDigits: 0
        });
    };

    const getProductIcon = (item) => {
        const text = `${item.name} ${item.code}`.toLowerCase();
        if (text.includes("auto") || text.includes("car") || text.includes("vehicle")) {
            return <Car size={22} className="text-pink-600" />;
        }
        if (text.includes("biz") || text.includes("business") || text.includes("commercial")) {
            return <Briefcase size={22} className="text-rose-500" />;
        }
        if (text.includes("home") || text.includes("mortgage") || text.includes("property")) {
            return <Home size={22} className="text-pink-500" />;
        }
        return <User size={22} className="text-pink-600" />;
    };

    const handleCalculateClick = (loanType) => {
        if (onSelectForCalculator) {
            onSelectForCalculator(loanType);
        }
        const calcEl = document.querySelector("#calculator");
        if (calcEl) {
            calcEl.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section id="loan-types" className="relative py-24 bg-white border-t border-pink-100 text-zinc-900">
            {/* Background accent light */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.12),transparent_70%)] blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-100/70 px-3.5 py-1 text-xs font-bold text-pink-700 shadow-sm">
                        <Sparkles size={13} className="text-pink-600" />
                        <span>Tailored Financing Facilities</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                        Explore Our Loan Products
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-600">
                        Transparent, institutional-grade lending schemes configured with clear credit limits, competitive APR rates, and predictable repayment cycles.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loanTypes.map((type) => (
                        <div
                            key={type.id}
                            className="group relative flex flex-col justify-between rounded-3xl border border-pink-200/80 bg-white p-6 transition-all duration-300 hover:border-pink-400 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1"
                        >
                            <div>
                                {/* Icon & Code Badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-200 bg-pink-50/70 shadow-sm group-hover:border-pink-400 transition-colors">
                                        {getProductIcon(type)}
                                    </div>
                                    <span className="font-mono text-[11px] font-bold text-pink-700 bg-pink-100/70 px-2.5 py-1 rounded-lg border border-pink-200">
                                        {type.code || "LOAN"}
                                    </span>
                                </div>

                                {/* Name & Description */}
                                <h3 className="text-lg font-bold text-zinc-900 group-hover:text-pink-600 transition-colors">
                                    {type.name}
                                </h3>
                                <p className="mt-2 text-xs text-zinc-600 line-clamp-3 leading-relaxed min-h-[48px]">
                                    {type.description || "Structured financial facility with transparent repayment conditions and rapid online processing."}
                                </p>

                                {/* Financial Key Metrics */}
                                <div className="mt-5 space-y-2.5 rounded-2xl border border-pink-100 bg-pink-50/40 p-3.5 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                                            <TrendingUp size={13} className="text-pink-600" />
                                            Interest Rate
                                        </span>
                                        <span className="font-mono font-bold text-pink-600 text-sm">
                                            {type.interestRate}% p.a.
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-pink-100/80 pt-2">
                                        <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                                            <Coins size={13} className="text-zinc-500" />
                                            Sanction Limits
                                        </span>
                                        <span className="font-mono font-semibold text-zinc-800 text-[11px] text-right">
                                            PKR {formatCurrency(type.minAmount)} - {formatCurrency(type.maxAmount)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-pink-100/80 pt-2">
                                        <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                                            <Calendar size={13} className="text-zinc-500" />
                                            Max Tenure
                                        </span>
                                        <span className="font-mono font-semibold text-zinc-800 text-xs">
                                            {type.maxTermMonths} Months ({(type.maxTermMonths / 12).toFixed(1)} yrs)
                                        </span>
                                    </div>
                                </div>

                                {/* Guarantor Requirement Badge */}
                                <div className="mt-4 flex items-center justify-between">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                        type.requiresGuarantor
                                            ? "bg-pink-100 text-pink-700 border border-pink-200"
                                            : "bg-zinc-50 text-zinc-700 border border-zinc-200"
                                    }`}>
                                        {type.requiresGuarantor ? (
                                            <>
                                                <ShieldAlert size={12} />
                                                <span>Guarantor Mandatory</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={12} />
                                                <span>No Guarantor Needed</span>
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 pt-4 border-t border-pink-100 space-y-2">
                                <button
                                    type="button"
                                    onClick={() => onOpenApplyModal(type)}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 py-2.5 px-4 text-xs font-bold text-white shadow-md shadow-pink-500/25 hover:from-pink-600 hover:to-rose-600 transition-all cursor-pointer"
                                >
                                    <span>Apply Now</span>
                                    <ArrowRight size={14} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleCalculateClick(type)}
                                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-pink-200 bg-white py-2 px-3 text-xs font-semibold text-zinc-700 hover:bg-pink-50 hover:text-pink-600 transition-colors cursor-pointer shadow-sm"
                                >
                                    <Calculator size={13} className="text-pink-600" />
                                    <span>Calculate Installment</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
