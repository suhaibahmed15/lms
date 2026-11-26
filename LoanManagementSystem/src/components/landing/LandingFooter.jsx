import { Link } from "react-router-dom";
import { ShieldCheck, ArrowUp, Lock, Phone, Mail, MapPin } from "lucide-react";

export default function LandingFooter({ onOpenApplyModal }) {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleNavClick = (e, targetId) => {
        e.preventDefault();
        const el = document.querySelector(targetId);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <footer className="bg-black border-t border-pink-500/20 text-zinc-400 text-xs">
            {/* Top Footer Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    
                    {/* Brand & Summary (2 cols) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="LMS Logo" className="h-11 w-auto max-w-[180px] object-contain drop-shadow" />
                        </div>
                        <p className="text-zinc-400 leading-relaxed max-w-sm">
                            Next-generation institutional credit management system delivering transparent loan calculations, structured reducing-balance amortization, and digital end-to-end loan administration.
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-2">
                            <Lock size={13} className="text-pink-400" />
                            <span>Enterprise 256-Bit SSL Encrypted Financial Platform</span>
                        </div>
                    </div>

                    {/* Quick Navigation (1 col) */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                            Quick Links
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#hero"
                                    onClick={(e) => handleNavClick(e, "#hero")}
                                    className="hover:text-pink-400 transition-colors"
                                >
                                    Home
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#loan-types"
                                    onClick={(e) => handleNavClick(e, "#loan-types")}
                                    className="hover:text-pink-400 transition-colors"
                                >
                                    Loan Products
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#calculator"
                                    onClick={(e) => handleNavClick(e, "#calculator")}
                                    className="hover:text-pink-400 transition-colors"
                                >
                                    Repayment Calculator
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#how-it-works"
                                    onClick={(e) => handleNavClick(e, "#how-it-works")}
                                    className="hover:text-pink-400 transition-colors"
                                >
                                    How It Works
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#why-choose-us"
                                    onClick={(e) => handleNavClick(e, "#why-choose-us")}
                                    className="hover:text-pink-400 transition-colors"
                                >
                                    Why Choose Us
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#faq"
                                    onClick={(e) => handleNavClick(e, "#faq")}
                                    className="hover:text-pink-400 transition-colors"
                                >
                                    FAQ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Loan Products (1 col) */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                            Financing Products
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#loan-types"
                                    onClick={(e) => handleNavClick(e, "#loan-types")}
                                    className="hover:text-pink-400 transition-colors"
                                >
                                    Personal Loans (14.5% APR)
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#loan-types"
                                    onClick={(e) => handleNavClick(e, "#loan-types")}
                                    className="hover:text-pink-400 transition-colors"
                                >
                                    Auto & Vehicle Loans (11.75% APR)
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#loan-types"
                                    onClick={(e) => handleNavClick(e, "#loan-types")}
                                    className="hover:text-pink-400 transition-colors"
                                >
                                    SME Commercial Facilities (10.5% APR)
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#loan-types"
                                    onClick={(e) => handleNavClick(e, "#loan-types")}
                                    className="hover:text-pink-400 transition-colors"
                                >
                                    Home Mortgages (8.75% APR)
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Portal Access (1 col) */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                            Account & Support
                        </h4>
                        <ul className="space-y-2.5">
                            <li>
                                <Link to="/login" className="text-pink-400 hover:text-pink-300 font-medium">
                                    Customer & Staff Sign In →
                                </Link>
                            </li>
                            <li>
                                <Link to="/login?mode=signup" className="hover:text-white transition-colors">
                                    Register New Account
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={onOpenApplyModal}
                                    className="text-left text-zinc-300 hover:text-pink-400 transition-colors cursor-pointer"
                                >
                                    Apply for Loan Facility
                                </button>
                            </li>
                            <li className="pt-2">
                                <a
                                    href="#contact"
                                    onClick={(e) => handleNavClick(e, "#contact")}
                                    className="hover:text-white transition-colors"
                                >
                                    Contact Credit Desk
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* Bottom Compliance Disclaimer & Copyright */}
            <div className="border-t border-white/10 bg-black/95 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div className="space-y-1">
                        <p className="text-[11px] text-zinc-500 max-w-3xl leading-relaxed">
                            <strong>Regulatory Notice:</strong> LMS is a software-enabled loan management and credit tracking platform. All installment estimates generated on this portal are indicative. Loan approvals are conditional upon identity verification, risk evaluation, and official execution of loan agreements.
                        </p>
                        <p className="text-[11px] text-zinc-600">
                            © {new Date().getFullYear()} LMS Loan Management System. All rights reserved.
                        </p>
                    </div>

                    <button
                        onClick={scrollToTop}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-950 text-zinc-400 hover:border-pink-500/40 hover:text-pink-400 transition-all cursor-pointer"
                        title="Back to top"
                        aria-label="Back to top"
                    >
                        <ArrowUp size={16} />
                    </button>
                </div>
            </div>
        </footer>
    );
}
