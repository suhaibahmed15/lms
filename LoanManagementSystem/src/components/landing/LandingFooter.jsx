import { Lock } from "lucide-react";

export default function LandingFooter() {
    const handleNavClick = (e, targetId) => {
        e.preventDefault();
        const el = document.querySelector(targetId);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <footer className="bg-pink-50/60 border-t border-pink-100 text-zinc-600 text-xs">
            {/* Top Footer Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    
                    {/* Brand & Summary (2 cols) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="LMS Logo" className="h-11 w-auto max-w-[180px] object-contain drop-shadow-sm" />
                        </div>
                        <p className="text-zinc-600 leading-relaxed max-w-sm">
                            Next-generation institutional credit management system delivering transparent loan calculations, structured reducing-balance amortization, and digital end-to-end loan administration.
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-2 font-medium">
                            <Lock size={13} className="text-pink-600" />
                            <span>Enterprise 256-Bit SSL Encrypted Financial Platform</span>
                        </div>
                    </div>

                    {/* Quick Navigation (1 col) */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                            Quick Links
                        </h4>
                        <ul className="space-y-2 font-medium">
                            <li>
                                <a
                                    href="#hero"
                                    onClick={(e) => handleNavClick(e, "#hero")}
                                    className="hover:text-pink-600 transition-colors"
                                >
                                    Home
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#loan-types"
                                    onClick={(e) => handleNavClick(e, "#loan-types")}
                                    className="hover:text-pink-600 transition-colors"
                                >
                                    Loan Products
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#calculator"
                                    onClick={(e) => handleNavClick(e, "#calculator")}
                                    className="hover:text-pink-600 transition-colors"
                                >
                                    Repayment Calculator
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#how-it-works"
                                    onClick={(e) => handleNavClick(e, "#how-it-works")}
                                    className="hover:text-pink-600 transition-colors"
                                >
                                    How It Works
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Compliance (1 col) */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                            Governance
                        </h4>
                        <ul className="space-y-2 text-zinc-600 font-medium">
                            <li>Consumer Credit Regulations</li>
                            <li>Standard Amortization Framework</li>
                            <li>Data Protection & Privacy Policy</li>
                            <li>Statutory Grace Period Clauses</li>
                        </ul>
                    </div>

                    {/* Operational Support (1 col) */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                            Support Desk
                        </h4>
                        <p className="text-zinc-600 leading-relaxed font-medium">
                            Central Corporate Towers, Suite 400<br />
                            Financial Boulevard<br />
                            support@lms.local
                        </p>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-pink-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 font-medium">
                    <p>© {new Date().getFullYear()} LMS Capital Banking Corp. All rights reserved.</p>
                    <p className="text-[11px]">Strictly confidential & institutional grade banking software.</p>
                </div>
            </div>
        </footer>
    );
}
