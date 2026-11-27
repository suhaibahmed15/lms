import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, LogIn, UserPlus, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export default function ApplyLoanModal({ isOpen, onClose, selectedLoanType = null }) {
    const navigate = useNavigate();

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleLoginClick = () => {
        onClose();
        navigate("/login");
    };

    const handleRegisterClick = () => {
        onClose();
        navigate("/login?mode=signup");
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop with blur */}
            <div
                className="fixed inset-0 bg-pink-950/25 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Dialog Card */}
            <div
                className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-pink-200/90 bg-white p-6 sm:p-8 text-left shadow-2xl shadow-pink-500/10 backdrop-blur-xl transition-all animate-in zoom-in-95 duration-200 text-zinc-900"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative background glow */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-pink-100/50 blur-3xl" />
                <div className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-rose-100/50 blur-3xl" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-xl p-2 text-zinc-400 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                    aria-label="Close dialog"
                >
                    <X size={20} />
                </button>

                {/* Header Icon & Title */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25">
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-pink-600">
                            <span>Instant Access Portal</span>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-zinc-900">
                            Ready to Get Started?
                        </h3>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-zinc-600 leading-relaxed mt-2 mb-6">
                    To apply for a loan, please access your account or create a new one. Your progress and document assessments will be stored securely.
                </p>

                {/* Selected scheme pill if available */}
                {selectedLoanType && (
                    <div className="mb-6 rounded-2xl border border-pink-200 bg-pink-50/50 p-3.5 flex items-center justify-between text-xs">
                        <div>
                            <span className="text-zinc-500 block font-medium">Selected Financing Product:</span>
                            <span className="font-bold text-zinc-900 text-sm">{selectedLoanType.name}</span>
                        </div>
                        <span className="font-mono font-bold text-pink-600 bg-white px-2.5 py-1 rounded-lg border border-pink-200 shadow-sm">
                            {selectedLoanType.interestRate}% APR
                        </span>
                    </div>
                )}

                {/* Two Action Choice Cards */}
                <div className="space-y-3">
                    {/* Choice 1: Existing Customer */}
                    <button
                        onClick={handleLoginClick}
                        className="group flex w-full items-center justify-between rounded-2xl border border-pink-200/80 bg-white p-4 text-left transition-all hover:border-pink-400 hover:bg-pink-50/50 hover:shadow-md cursor-pointer"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100/80 text-pink-600 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-rose-500 group-hover:text-white transition-all shadow-sm">
                                <LogIn size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-zinc-900 group-hover:text-pink-600 transition-colors">
                                    Already Have an Account?
                                </p>
                                <p className="text-xs text-zinc-500">
                                    Log in to continue your loan application.
                                </p>
                            </div>
                        </div>
                        <ArrowRight size={18} className="text-zinc-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
                    </button>

                    {/* Choice 2: New Customer */}
                    <button
                        onClick={handleRegisterClick}
                        className="group flex w-full items-center justify-between rounded-2xl border border-pink-200/80 bg-white p-4 text-left transition-all hover:border-pink-400 hover:bg-pink-50/50 hover:shadow-md cursor-pointer"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100/80 text-pink-600 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-rose-500 group-hover:text-white transition-all shadow-sm">
                                <UserPlus size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-zinc-900 group-hover:text-pink-600 transition-colors">
                                    New Customer?
                                </p>
                                <p className="text-xs text-zinc-500">
                                    Create a free customer account in two minutes.
                                </p>
                            </div>
                        </div>
                        <ArrowRight size={18} className="text-zinc-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
                    </button>
                </div>

                {/* Footer security note */}
                <div className="mt-6 pt-4 border-t border-pink-100 flex items-center justify-center gap-2 text-xs text-zinc-500 font-medium">
                    <ShieldCheck size={14} className="text-pink-500" />
                    <span>256-Bit Encrypted Institutional Banking Security</span>
                </div>
            </div>
        </div>
    );
}
