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
                className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Dialog Card */}
            <div
                className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-pink-500/25 bg-neutral-950/95 p-6 sm:p-8 text-left shadow-2xl shadow-pink-500/10 backdrop-blur-xl transition-all animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative background glow */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-pink-500/15 blur-3xl" />
                <div className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-rose-500/10 blur-3xl" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-xl p-2 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
                    aria-label="Close dialog"
                >
                    <X size={20} />
                </button>

                {/* Header Icon & Title */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-pink-500/30 bg-pink-500/15 text-pink-400 shadow-lg shadow-pink-500/10">
                        <ShieldCheck size={26} />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-pink-400">
                            <Sparkles size={13} />
                            <span>LMS Capital Access</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">
                            Ready to Get Started?
                        </h3>
                    </div>
                </div>

                <p className="text-sm text-neutral-300 mb-6 leading-relaxed">
                    To apply for a loan{selectedLoanType ? ` under our ${selectedLoanType.name} facility` : ""}, please access your account or create a new one.
                </p>

                {/* Selected scheme pill if provided */}
                {selectedLoanType && (
                    <div className="mb-6 rounded-xl border border-pink-500/25 bg-pink-500/10 px-3.5 py-2.5 text-xs text-pink-200 flex items-center justify-between">
                        <span>Selected Facility: <strong className="font-semibold text-white">{selectedLoanType.name}</strong></span>
                        <span className="font-mono font-medium text-pink-400">{selectedLoanType.interestRate}% APR</span>
                    </div>
                )}

                {/* Options Grid */}
                <div className="space-y-4">
                    {/* Option 1: Existing Customer / Login */}
                    <div className="group relative rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 transition-all hover:border-pink-500/40 hover:bg-neutral-900">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <span className="inline-block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    Already Have an Account?
                                </span>
                                <h4 className="text-base font-semibold text-white group-hover:text-pink-300 transition-colors">
                                    Sign In to Your Account
                                </h4>
                                <p className="text-xs text-neutral-400">
                                    Log in to continue your existing applications or manage your active loan facilities.
                                </p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 group-hover:border-pink-500/40 group-hover:text-pink-400">
                                <LogIn size={18} />
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                            <span className="text-xs text-neutral-400">Quick sign in with email & password</span>
                            <button
                                onClick={handleLoginClick}
                                className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700 hover:text-pink-300 transition-all shadow-sm cursor-pointer border border-neutral-700/60"
                            >
                                <span>Login</span>
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Option 2: New Customer / Register */}
                    <div className="group relative rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 via-neutral-900/80 to-neutral-900/50 p-4 transition-all hover:border-pink-500/60 hover:shadow-lg hover:shadow-pink-500/10">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <span className="inline-block text-xs font-semibold uppercase tracking-wider text-pink-400">
                                    New Customer?
                                </span>
                                <h4 className="text-base font-semibold text-white group-hover:text-pink-200 transition-colors">
                                    Create a New Account
                                </h4>
                                <p className="text-xs text-neutral-300">
                                    Register in 2 minutes to submit your loan application and track verification status.
                                </p>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-pink-500/40 bg-pink-500/20 text-pink-300">
                                <UserPlus size={18} />
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-pink-500/20 flex items-center justify-between">
                            <span className="text-xs text-neutral-400">Instant registration • No fee</span>
                            <button
                                onClick={handleRegisterClick}
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 px-4 py-2 text-xs font-bold text-white hover:opacity-95 transition-all shadow-md shadow-pink-500/25 cursor-pointer"
                            >
                                <span>Create Account</span>
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer security note */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-400">
                    <ShieldCheck size={14} className="text-pink-400" />
                    <span>256-Bit SSL Encrypted & Bank-Grade Security</span>
                </div>
            </div>
        </div>
    );
}
