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

    // Fetch live active loan types from API
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

                if (isMounted && list.length > 0) {
                    setLoanTypes(list);
                    if (!selectedTypeFromParent) {
                        setSelectedTypeId(list[0].id);
                        setAmount(Math.max(list[0].minAmount, Math.min(500000, list[0].maxAmount)));
                        setTenureMonths(Math.min(24, list[0].maxTermMonths || 24));
                    }
                }
            } catch {
                if (isMounted) {
                    setLoanTypes(DEFAULT_LOAN_TYPES);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchTypes();
        return () => { isMounted = false; };
    }, [selectedTypeFromParent]);

    // React to parent selection when user clicks "Calculate" on Loan Types cards
    useEffect(() => {
        if (selectedTypeFromParent) {
            setSelectedTypeId(selectedTypeFromParent.id);
            const defaultAmt = Math.max(
                selectedTypeFromParent.minAmount || 50000,
                Math.min(500000, selectedTypeFromParent.maxAmount || 500000)
            );
            setAmount(defaultAmt);
            setTenureMonths(Math.min(24, selectedTypeFromParent.maxTermMonths || 24));
            setCustomRate(null);
        } else if (!selectedTypeId && loanTypes.length > 0) {
            setSelectedTypeId(loanTypes[0].id);
        }
    }, [selectedTypeFromParent, loanTypes, selectedTypeId]);

    // Identify active selected loan type object
    const activeLoanType = useMemo(() => {
        return loanTypes.find((t) => String(t.id) === String(selectedTypeId)) || loanTypes[0];
    }, [loanTypes, selectedTypeId]);

    const effectiveRate = customRate !== null ? customRate : (activeLoanType?.interestRate ?? 12.0);
    const minAmount = activeLoanType?.minAmount ?? 50000;
    const maxAmount = activeLoanType?.maxAmount ?? 10000000;
    const minTenure = activeLoanType?.minTermMonths ?? 6;
    const maxTenure = activeLoanType?.maxTermMonths ?? 60;

    // Handle loan type switch
    const handleLoanTypeChange = (typeId) => {
        setSelectedTypeId(typeId);
        const selected = loanTypes.find((t) => String(t.id) === String(typeId));
        if (selected) {
            setAmount(Math.max(selected.minAmount, Math.min(amount, selected.maxAmount)));
            setTenureMonths(Math.max(selected.minTermMonths || 6, Math.min(tenureMonths, selected.maxTermMonths || 60)));
            setCustomRate(null);
        }
    };

    // Calculate Standard Reducing Balance Equated Monthly Installment (EMI)
    const { emi, totalInterest, totalRepayment, principalRatio, interestRatio } = useMemo(() => {
        const P = Math.max(Number(amount) || 0, 0);
        const N = Math.max(Number(tenureMonths) || 1, 1);
        const annualRate = Number(effectiveRate) || 0;

        if (P <= 0) {
            return { emi: 0, totalInterest: 0, totalRepayment: 0, principalRatio: 100, interestRatio: 0 };
        }

        // Case: 0% Interest Rate
        if (annualRate <= 0) {
            const zeroEmi = P / N;
            return {
                emi: Math.round(zeroEmi),
                totalInterest: 0,
                totalRepayment: P,
                principalRatio: 100,
                interestRatio: 0
            };
        }

        // Standard Reducing Balance Amortization Formula:
        // EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
        const monthlyRate = annualRate / 12 / 100;
        const compoundFactor = Math.pow(1 + monthlyRate, N);
        const emiCalculated = (P * monthlyRate * compoundFactor) / (compoundFactor - 1);

        const totalPayable = emiCalculated * N;
        const totalInt = totalPayable - P;

        const pRatio = Math.round((P / totalPayable) * 100);
        const iRatio = 100 - pRatio;

        return {
            emi: Math.round(emiCalculated),
            totalInterest: Math.round(totalInt),
            totalRepayment: Math.round(totalPayable),
            principalRatio: Math.max(0, Math.min(100, pRatio)),
            interestRatio: Math.max(0, Math.min(100, iRatio))
        };
    }, [amount, tenureMonths, effectiveRate]);

    const handleReset = () => {
        if (activeLoanType) {
            setAmount(Math.max(activeLoanType.minAmount, Math.min(500000, activeLoanType.maxAmount)));
            setTenureMonths(Math.min(24, activeLoanType.maxTermMonths || 24));
            setCustomRate(null);
        }
    };

    const formatCurrency = (val) => {
        return Number(val || 0).toLocaleString("en-PK", {
            maximumFractionDigits: 0
        });
    };

    return (
        <section id="calculator" className="relative py-24 bg-gradient-to-b from-[#fff7f9] via-[#ffffff] to-[#fff0f5] border-t border-pink-100 text-zinc-900">
            {/* Ambient background glows */}
            <div className="pointer-events-none absolute top-10 left-1/4 h-96 w-96 rounded-full bg-pink-200/30 blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-rose-200/25 blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-100/70 px-3.5 py-1 text-xs font-bold text-pink-700 shadow-sm">
                        <Calculator size={13} className="text-pink-600" />
                        <span>Interactive Loan Repayment Estimator</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                        Calculate Your Monthly Installment
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-600">
                        Customize your borrowing amount, scheme, and tenure to visualize your exact repayment schedule with zero obligation.
                    </p>
                </div>

                {/* Main Calculator Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Form: Inputs & Sliders (7 cols) */}
                    <div className="lg:col-span-7 rounded-3xl border border-pink-200/90 bg-white p-6 sm:p-8 backdrop-blur-md shadow-xl shadow-pink-500/5 space-y-7">
                        
                        {/* 1. Loan Scheme Selector */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                                Select Loan Product Facility
                            </label>
                            <select
                                value={selectedTypeId}
                                onChange={(e) => handleLoanTypeChange(e.target.value)}
                                style={{ colorScheme: "light" }}
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/15 transition-colors"
                            >
                                {loanTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name} — {type.interestRate}% APR (PKR {formatCurrency(type.minAmount)} to {formatCurrency(type.maxAmount)})
                                    </option>
                                ))}
                            </select>

                            {activeLoanType?.description && (
                                <p className="mt-2 text-xs text-zinc-500">
                                    {activeLoanType.description}
                                </p>
                            )}
                        </div>

                        {/* 2. Loan Amount Slider & Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Desired Loan Amount (PKR)
                                </label>
                                <div className="flex items-center gap-1 rounded-xl border border-pink-200 bg-pink-50/60 px-3 py-1.5 font-mono text-sm font-bold text-pink-600 shadow-sm">
                                    <span className="text-xs text-zinc-500">PKR</span>
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
                                        className="w-32 bg-transparent text-right font-mono font-bold text-pink-600 focus:outline-none"
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
                                className="w-full accent-pink-500 h-2 bg-pink-100 rounded-lg cursor-pointer"
                            />

                            <div className="flex justify-between text-[11px] text-zinc-500 font-mono font-medium">
                                <span>Min: PKR {formatCurrency(minAmount)}</span>
                                <span>Max: PKR {formatCurrency(maxAmount)}</span>
                            </div>
                        </div>

                        {/* 3. Loan Tenure Slider & Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                                    Loan Tenure / Duration
                                </label>
                                <div className="flex items-center gap-1 rounded-xl border border-pink-200 bg-pink-50/60 px-3 py-1.5 font-mono text-sm font-bold text-zinc-900 shadow-sm">
                                    <input
                                        type="number"
                                        min={minTenure}
                                        max={maxTenure}
                                        value={tenureMonths}
                                        onChange={(e) => setTenureMonths(Number(e.target.value))}
                                        className="w-16 bg-transparent text-right font-mono font-bold text-zinc-900 focus:outline-none"
                                    />
                                    <span className="text-xs text-zinc-500">Months</span>
                                    <span className="text-xs text-pink-600 font-semibold ml-1">
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
                                className="w-full accent-pink-500 h-2 bg-pink-100 rounded-lg cursor-pointer"
                            />

                            <div className="flex justify-between text-[11px] text-zinc-500 font-mono font-medium">
                                <span>Min: {minTenure} Months</span>
                                <span>Max: {maxTenure} Months</span>
                            </div>
                        </div>

                        {/* 4. Interest Rate & Scheme Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="rounded-2xl border border-pink-100 bg-pink-50/50 p-4">
                                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1 font-medium">
                                    <span>Configured Interest Rate (APR)</span>
                                    <Percent size={14} className="text-pink-600" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-extrabold text-pink-600 font-mono">
                                        {effectiveRate.toFixed(2)}%
                                    </span>
                                    <span className="text-xs text-zinc-500">p.a. (Reducing Balance)</span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-pink-100 bg-pink-50/50 p-4">
                                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1 font-medium">
                                    <span>Guarantor Policy</span>
                                    <ShieldAlert size={14} className="text-pink-600" />
                                </div>
                                <div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        activeLoanType?.requiresGuarantor
                                            ? "bg-pink-100 text-pink-700 border border-pink-200"
                                            : "bg-white text-zinc-700 border border-zinc-200 shadow-sm"
                                    }`}>
                                        {activeLoanType?.requiresGuarantor ? "Guarantor Required" : "No Guarantor Needed"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reset button */}
                        <div className="flex items-center justify-end pt-2 border-t border-pink-100">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-pink-600 transition-colors cursor-pointer"
                            >
                                <RotateCcw size={13} />
                                <span>Reset to Default Values</span>
                            </button>
                        </div>

                    </div>

                    {/* Right Summary Card (5 cols) */}
                    <div className="lg:col-span-5 rounded-3xl border border-pink-200/90 bg-white p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-pink-500/10 space-y-6">
                        
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-pink-600">
                                    Estimated Monthly Repayment
                                </span>
                                <span className="text-[11px] font-mono text-zinc-500 font-medium">
                                    {tenureMonths} installments
                                </span>
                            </div>
                            <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-pink-600 tracking-tight">
                                PKR {formatCurrency(emi)}
                                <span className="text-xs font-normal text-zinc-500 ml-1">/ month</span>
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">
                                Calculated with standard reducing balance amortization.
                            </p>
                        </div>

                        {/* Visual Breakdown Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-900 font-bold">Payment Breakdown</span>
                                <span className="text-zinc-500">{principalRatio}% Principal • {interestRatio}% Interest</span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-pink-100 overflow-hidden flex">
                                <div
                                    style={{ width: `${principalRatio}%` }}
                                    className="bg-gradient-to-r from-pink-500 to-rose-500 h-full transition-all duration-300"
                                    title={`Principal: ${principalRatio}%`}
                                />
                                <div
                                    style={{ width: `${interestRatio}%` }}
                                    className="bg-rose-300 h-full transition-all duration-300"
                                    title={`Interest: ${interestRatio}%`}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-pink-500" />
                                    Principal Loan Amount
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                                    Total Interest
                                </span>
                            </div>
                        </div>

                        {/* Breakdown Metrics Grid */}
                        <div className="rounded-2xl border border-pink-100 bg-pink-50/50 p-4 space-y-3 text-xs">
                            <div className="flex justify-between items-center text-zinc-700">
                                <span className="text-zinc-500 font-medium">Principal Sanction Amount:</span>
                                <span className="font-mono font-bold text-zinc-900">PKR {formatCurrency(amount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-700">
                                <span className="text-zinc-500 font-medium">Total Interest Charge:</span>
                                <span className="font-mono font-bold text-pink-600">PKR {formatCurrency(totalInterest)}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-700 pt-2 border-t border-pink-100">
                                <span className="font-bold text-zinc-900">Total Amount Payable:</span>
                                <span className="font-mono font-black text-pink-600 text-sm">PKR {formatCurrency(totalRepayment)}</span>
                            </div>
                        </div>

                        {/* Action CTA */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => onOpenApplyModal(activeLoanType)}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-500/25 hover:from-pink-600 hover:to-rose-600 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                            >
                                <span>Apply for this Loan</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>

                        {/* Mandatory Disclaimer */}
                        <div className="rounded-2xl border border-pink-200 bg-pink-50/60 p-4 flex items-start gap-2.5 text-[11px] text-zinc-600 leading-relaxed">
                            <AlertCircle size={15} className="text-pink-600 shrink-0 mt-0.5" />
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
