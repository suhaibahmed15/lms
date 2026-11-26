import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ShieldCheck,
    Menu,
    X,
    ArrowRight,
    LogIn,
    UserCheck,
    LayoutDashboard,
    Calculator,
    Layers,
    HelpCircle,
    PhoneCall
} from "lucide-react";
import { isAuthenticated, getCurrentUser, logoutUser } from "../../utils/auth";

export default function LandingNavbar({ onOpenApplyModal }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated());
    const currentUser = getCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        const handleAuthChange = () => {
            setIsLoggedIn(isAuthenticated());
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("auth_changed", handleAuthChange);
        window.addEventListener("storage", handleAuthChange);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("auth_changed", handleAuthChange);
            window.removeEventListener("storage", handleAuthChange);
        };
    }, []);

    const navLinks = [
        { label: "Home", href: "#hero" },
        { label: "Loan Types", href: "#loan-types" },
        { label: "Calculator", href: "#calculator" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "About Us", href: "#why-choose-us" },
        { label: "FAQ", href: "#faq" },
        { label: "Contact", href: "#contact" }
    ];

    const handleNavClick = (e, href) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
                scrolled
                    ? "bg-black/90 backdrop-blur-md border-b border-pink-500/25 shadow-lg shadow-pink-950/20 py-3.5"
                    : "bg-black/50 backdrop-blur-sm border-b border-white/10 py-5"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Brand / Logo */}
                    <a
                        href="#hero"
                        onClick={(e) => handleNavClick(e, "#hero")}
                        className="flex items-center gap-3 group cursor-pointer"
                    >
                        <img
                            src="/logo.png"
                            alt="LMS Loan Management System"
                            className="h-11 w-auto max-w-[180px] object-contain drop-shadow transition-transform group-hover:scale-105"
                        />
                    </a>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-pink-400 hover:bg-white/[0.06] rounded-lg transition-all"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Desktop Action CTAs */}
                    <div className="hidden md:flex items-center gap-3">
                        {isLoggedIn ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-slate-200 hover:border-pink-500/40 hover:text-white transition-all shadow-sm"
                                >
                                    <LayoutDashboard size={14} className="text-pink-400" />
                                    <span>Portal Dashboard</span>
                                </Link>
                                <button
                                    onClick={() => onOpenApplyModal()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 px-4 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/25 hover:from-pink-500 hover:to-rose-300 transition-all cursor-pointer"
                                >
                                    <span>Apply Now</span>
                                    <ArrowRight size={14} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/60 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-pink-500/40 hover:text-white transition-all shadow-sm"
                                >
                                    <LogIn size={14} className="text-slate-400" />
                                    <span>Login</span>
                                </Link>
                                <button
                                    onClick={() => onOpenApplyModal()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 px-4.5 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/25 hover:from-pink-500 hover:to-rose-300 hover:shadow-pink-500/40 transition-all cursor-pointer"
                                >
                                    <span>Apply Now</span>
                                    <ArrowRight size={14} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            onClick={() => onOpenApplyModal()}
                            className="rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                        >
                            Apply
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-lg border border-white/15 bg-black p-2 text-slate-300 hover:text-white focus:outline-none"
                            aria-label="Toggle navigation menu"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-b border-pink-500/20 bg-black/95 backdrop-blur-xl animate-in slide-in-from-top-4 duration-200">
                    <div className="px-4 pt-3 pb-6 space-y-2">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.06] hover:text-pink-400 transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}

                        <div className="pt-4 mt-2 border-t border-white/10 space-y-2.5">
                            {isLoggedIn ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                                    >
                                        <LayoutDashboard size={16} className="text-pink-400" />
                                        <span>Portal Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            onOpenApplyModal();
                                        }}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-pink-500/25"
                                    >
                                        <span>Apply for Loan</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                                    >
                                        <LogIn size={16} className="text-slate-400" />
                                        <span>Login to Account</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            onOpenApplyModal();
                                        }}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-pink-500/25"
                                    >
                                        <span>Apply Now</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
