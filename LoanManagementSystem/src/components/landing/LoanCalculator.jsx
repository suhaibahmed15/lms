import { useState, useEffect, useMemo } from "react";
import {
    Calculator,
    RotateCcw,
    ArrowRight,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    Calendar,
    Percent,
    ShieldAlert
} from "lucide-react";
import { getActiveLoanTypes } from "../../services/loanTypeService";

// Fallback loan types in case of network issue or backend requiring auth for public visitors
const DEFAULT_LOAN_TYPES = [
    {
        id: 1,
        name: "Personal Loan",
        code: "PERS_LOAN",
        description: "Quick personal financing for medical, travel, education, or emergency personal needs.",
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
        description: "Competitive automotive financing for new and certified pre-owned passenger vehicles.",
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
        description: "Empower business operations, capital asset acquisition, and working capital needs.",
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
        description: "Long-term home purchase, residential property construction, or property renovation financing.",
        interestRate: 8.75,
        minAmount: 1000000,
        maxAmount: 30000000,
        minTermMonths: 24,
        maxTermMonths: 240,
        requiresGuarantor: true,
        isActive: true
    }
];

export default function LoanCalculator({ onOpenApplyModal, selectedTypeFromParent = null }) {
    const [loanTypes, setLoanTypes] = useState(DEFAULT_LOAN_TYPES);
    const [loading, setLoading] = useState(true);
    const [selectedTypeId, setSelectedTypeId] = useState("");
    
    // Calculator state
    const [amount, setAmount] = useState(500000);
    const [tenureMonths, setTenureMonths] = useState(24);
    const [customRate, setCustomRate] = useState(null); // null means use scheme's default rate

    // Fetch active loan types on mount
    useEffect(() => {
        let isMounted = true;
        const fetchTypes = async () => {
            try {
                setLoading(true);
                const response = await getActiveLoanTypes();
                const records = Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response)
                        ? response
                        : [];

                if (isMounted && records.length > 0) {
                    setLoanTypes(records);
                    // Select first active scheme if not already set
                    setSelectedTypeId(String(records[0].id));
                    setAmount(records[0].minAmount ? Math.max(records[0].minAmount, 250000) : 500000);
                    setTenureMonths(records[0].minTermMonths ? Math.max(records[0].minTermMonths, 12) : 24);
                }
            } catch (err) {
                // Graceful fallback to default fintech products
                if (isMounted) {
                    setLoanTypes(DEFAULT_LOAN_TYPES);
                    setSelectedTypeId(String(DEFAULT_LOAN_TYPES[0].id));
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchTypes();
        return () => { isMounted = false; };
    }, []);

    // Sync when user clicks "Calculate" on a specific card in LoanTypesSection
    useEffect(() => {
        if (selectedTypeFromParent) {
            setSelectedTypeId(String(selectedTypeFromParent.id));
            const minAmt = Number(selectedTypeFromParent.minAmount) || 50000;
            const maxAmt = Number(selectedTypeFromParent.maxAmount) || 5000000;
            setAmount(Math.min(Math.max(500000, minAmt), maxAmt));
            const minTerm = Number(selectedTypeFromParent.minTermMonths) || 6;
            const maxTerm = Number(selectedTypeFromParent.maxTermMonths) || 60;
            setTenureMonths(Math.min(Math.max(24, minTerm), maxTerm));
            setCustomRate(null);
        }
    }, [selectedTypeFromParent]);

    // Active selected loan type
    const activeLoanType = useMemo(() => {
        return loanTypes.find((lt) => String(lt.id) === String(selectedTypeId)) || loanTypes[0] || DEFAULT_LOAN_TYPES[0];
    }, [loanTypes, selectedTypeId]);

    // Derived min/max constraints
    const minAmount = activeLoanType?.minAmount ?? 50000;
    const maxAmount = activeLoanType?.maxAmount ?? 5000000;
    const minTenure = activeLoanType?.minTermMonths ?? 6;
    const maxTenure = activeLoanType?.maxTermMonths ?? 60;
    const effectiveRate = customRate !== null ? Number(customRate) : (Number(activeLoanType?.interestRate) || 12.0);

    // Ensure amount and tenure are within bounds when loan type changes
    const handleLoanTypeChange = (newTypeId) => {
        setSelectedTypeId(newTypeId);
        setCustomRate(null);
        const newType = loanTypes.find((lt) => String(lt.id) === String(newTypeId));
        if (newType) {
            const minA = Number(newType.minAmount) || 50000;
            const maxA = Number(newType.maxAmount) || 5000000;
            const minT = Number(newType.minTermMonths) || 6;
            const maxT = Number(newType.maxTermMonths) || 60;

            setAmount((prev) => Math.min(Math.max(prev, minA), maxA));
            setTenureMonths((prev) => Math.min(Math.max(prev, minT), maxT));
        }
    };

    // Calculate EMI, Total Interest, Total Repayment
    const { emi, totalRepayment, totalInterest, principalRatio, interestRatio } = useMemo(() => {
        const P = Math.max(0, Number(amount) || 0);
        const N = Math.max(1, Number(tenureMonths) || 1);
        const annualRate = Math.max(0, Number(effectiveRate) || 0);

        if (P <= 0) {
            return { emi: 0, totalRepayment: 0, totalInterest: 0, principalRatio: 100, interestRatio: 0 };
        }

        let calculatedEmi = 0;
        let calculatedRepayment = 0;
        let calculatedInterest = 0;

        if (annualRate === 0) {
            // Zero-interest handling
            calculatedEmi = P / N;
            calculatedRepayment = P;
            calculatedInterest = 0;
        } else {
            // Standard Equated Monthly Installment (EMI) Formula:
            // EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
            const r = annualRate / (12 * 100);
            const factor = Math.pow(1 + r, N);
            calculatedEmi = (P * r * factor) / (factor - 1);
            calculatedRepayment = calculatedEmi * N;
            calculatedInterest = Math.max(0, calculatedRepayment - P);
        }

        const total = Math.max(calculatedRepayment, P);
        const pRatio = total > 0 ? (P / total) * 100 : 100;
        const iRatio = total > 0 ? (calculatedInterest / total) * 100 : 0;

        return {
            emi: Math.round(calculatedEmi),
            totalRepayment: Math.round(calculatedRepayment),
            totalInterest: Math.round(calculatedInterest),
            principalRatio: Math.round(pRatio),
            interestRatio: Math.round(iRatio)
        };
    }, [amount, tenureMonths, effectiveRate]);

    const handleReset = () => {
        if (activeLoanType) {
            const minA = Number(activeLoanType.minAmount) || 50000;
            const maxA = Number(activeLoanType.maxAmount) || 5000000;
            const defaultAmt = Math.min(Math.max(500000, minA), maxA);
            setAmount(defaultAmt);
            const minT = Number(activeLoanType.minTermMonths) || 6;
            const maxT = Number(activeLoanType.maxTermMonths) || 60;
            setTenureMonths(Math.min(Math.max(24, minT), maxT));
            setCustomRate(null);
        }
    };

    const formatCurrency = (val) => {
        return Number(val || 0).toLocaleString("en-PK", {
            maximumFractionDigits: 0
        });
    };

    return (
        <section id="calculator" className="relative py-20 bg-black border-t border-pink-500/20">
            {/* Ambient background glows */}
            <div className="pointer-events-none absolute top-10 left-1/4 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1 text-xs font-semibold text-pink-300">
                        <Calculator size={13} />
                        <span>Interactive Loan Repayment Estimator</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Calculate Your Monthly Installment
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-300">
                        Customize your borrowing amount, scheme, and tenure to visualize your exact repayment schedule with zero obligation.
                    </p>
                </div>

                {/* Main Calculator Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Form: Inputs & Sliders (7 cols) */}
                    <div className="lg:col-span-7 rounded-2xl border border-pink-500/20 bg-black/80 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-7">
                        
                        {/* 1. Loan Scheme Selector */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                                Select Loan Product Facility
                            </label>
                            <select
                                value={selectedTypeId}
                                onChange={(e) => handleLoanTypeChange(e.target.value)}
                                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm font-medium text-white focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors"
                            >
                                {loanTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name} — {type.interestRate}% APR (PKR {formatCurrency(type.minAmount)} to {formatCurrency(type.maxAmount)})
                                    </option>
                                ))}
                            </select>

                            {activeLoanType?.description && (
                                <p className="mt-2 text-xs text-zinc-400">
                                    {activeLoanType.description}
                                </p>
                            )}
                        </div>

                        {/* 2. Loan Amount Slider & Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                                    Desired Loan Amount (PKR)
                                </label>
                                <div className="flex items-center gap-1 rounded-xl border border-pink-500/30 bg-black px-3 py-1.5 font-mono text-sm font-bold text-pink-400">
                                    <span className="text-xs text-zinc-400">PKR</span>
                                    <input
                                        type="number"
                                        min={minAmount}
                                        max={maxAmount}
                                        step="10000"
                                        value={amount}
                                        onChange={(e) => {
                                            const v = Number(e.target.value);
                                            setAmount(v);
                                        }}
                                        className="w-32 bg-transparent text-right font-mono font-bold text-pink-400 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <input
                                type="range"
                                min={minAmount}
                                max={maxAmount}
                                step="10000"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full accent-pink-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                            />

                            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                                <span>Min: PKR {formatCurrency(minAmount)}</span>
                                <span>Max: PKR {formatCurrency(maxAmount)}</span>
                            </div>
                        </div>

                        {/* 3. Loan Tenure Slider & Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                                    Loan Tenure / Duration
                                </label>
                                <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-black px-3 py-1.5 font-mono text-sm font-bold text-white">
                                    <input
                                        type="number"
                                        min={minTenure}
                                        max={maxTenure}
                                        value={tenureMonths}
                                        onChange={(e) => setTenureMonths(Number(e.target.value))}
                                        className="w-16 bg-transparent text-right font-mono font-bold text-white focus:outline-none"
                                    />
                                    <span className="text-xs text-zinc-400">Months</span>
                                    <span className="text-xs text-pink-400/90 ml-1">
                                        ({(tenureMonths / 12).toFixed(1)} yrs)
                                    </span>
                                </div>
                            </div>

                            <input
                                type="range"
                                min={minTenure}
                                max={maxTenure}
                                step="1"
                                value={tenureMonths}
                                onChange={(e) => setTenureMonths(Number(e.target.value))}
                                className="w-full accent-pink-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                            />

                            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                                <span>Min: {minTenure} Months</span>
                                <span>Max: {maxTenure} Months</span>
                            </div>
                        </div>

                        {/* 4. Interest Rate & Scheme Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="rounded-xl border border-white/10 bg-black/60 p-3.5">
                                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                                    <span>Configured Interest Rate (APR)</span>
                                    <Percent size={14} className="text-pink-400" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-extrabold text-pink-400 font-mono">
                                        {effectiveRate.toFixed(2)}%
                                    </span>
                                    <span className="text-xs text-zinc-400">Per Annum (Reducing Balance)</span>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/60 p-3.5">
                                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                                    <span>Guarantor Policy</span>
                                    <ShieldAlert size={14} className="text-pink-400" />
                                </div>
                                <div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        activeLoanType?.requiresGuarantor
                                            ? "bg-pink-500/15 text-pink-300 border border-pink-500/30"
                                            : "bg-white/10 text-white border border-white/20"
                                    }`}>
                                        {activeLoanType?.requiresGuarantor ? "Guarantor Required" : "No Guarantor Needed"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reset button */}
                        <div className="flex items-center justify-end pt-2 border-t border-white/10">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <RotateCcw size={13} />
                                <span>Reset to Default Values</span>
                            </button>
                        </div>

                    </div>

                    {/* Right Summary Card (5 cols) */}
                    <div className="lg:col-span-5 rounded-2xl border border-pink-500/30 bg-gradient-to-b from-black/95 via-zinc-950/90 to-black/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-pink-950/30 space-y-6">
                        
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-pink-400">
                                    Estimated Monthly Repayment
                                </span>
                                <span className="text-[11px] font-mono text-zinc-400">
                                    {tenureMonths} installments
                                </span>
                            </div>
                            <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-pink-400 tracking-tight">
                                PKR {formatCurrency(emi)}
                                <span className="text-xs font-normal text-zinc-400 ml-1">/ month</span>
                            </div>
                            <p className="mt-1 text-xs text-zinc-400">
                                Calculated with standard reducing balance amortization.
                            </p>
                        </div>

                        {/* Visual Breakdown Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-white font-medium">Payment Breakdown</span>
                                <span className="text-zinc-400">{principalRatio}% Principal • {interestRatio}% Interest</span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden flex">
                                <div
                                    style={{ width: `${principalRatio}%` }}
                                    className="bg-gradient-to-r from-pink-600 to-pink-500 h-full transition-all duration-300"
                                    title={`Principal: ${principalRatio}%`}
                                />
                                <div
                                    style={{ width: `${interestRatio}%` }}
                                    className="bg-white h-full transition-all duration-300"
                                    title={`Interest: ${interestRatio}%`}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-pink-500" />
                                    Principal Loan Amount
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-white" />
                                    Total Interest
                                </span>
                            </div>
                        </div>

                        {/* Breakdown Metrics Grid */}
                        <div className="rounded-xl border border-white/10 bg-black/60 p-4 space-y-3 text-xs">
                            <div className="flex justify-between items-center text-zinc-300">
                                <span className="text-zinc-400">Principal Sanction Amount:</span>
                                <span className="font-mono font-semibold text-white">PKR {formatCurrency(amount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-300">
                                <span className="text-zinc-400">Total Interest Charge:</span>
                                <span className="font-mono font-semibold text-pink-400">PKR {formatCurrency(totalInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-300 pt-2 border-t border-white/10">
                                <span className="font-semibold text-white">Total Amount Payable:</span>
                                <span className="font-mono font-bold text-pink-400 text-sm">PKR {formatCurrency(totalRepayment)}</span>
                            </div>
                        </div>

                        {/* Action CTA */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => onOpenApplyModal(activeLoanType)}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-500/25 hover:from-pink-500 hover:to-rose-300 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                            >
                                <span>Apply for this Loan</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>

                        {/* Mandatory Disclaimer */}
                        <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 flex items-start gap-2.5 text-[11px] text-zinc-400 leading-relaxed">
                            <AlertCircle size={15} className="text-pink-400 shrink-0 mt-0.5" />
                            <span>
                                <strong>Disclaimer:</strong> All figures provided by this calculator are illustrative estimates based on standard amortization formulas and do not constitute a formal loan offer or approval. Sanctioned amounts, interest rates, and final terms depend on credit appraisal and underwriting criteria.
                            </span>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}
