import { useState } from "react";
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    CheckCircle2,
    Sparkles,
    ShieldCheck
} from "lucide-react";

export default function ContactSection() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        topic: "General Inquiry",
        message: ""
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <section id="contact" className="relative py-24 bg-black border-t border-pink-500/20">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1 text-xs font-semibold text-pink-300">
                        <Phone size={13} />
                        <span>Credit Advisory & Support</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Get in Touch with Our Loan Specialists
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-300">
                        Have questions regarding financing terms, documentation requirements, or payment verification? Our credit team is here to assist.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Contact Information Cards (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="rounded-2xl border border-pink-500/20 bg-black/80 p-6 space-y-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <ShieldCheck size={20} className="text-pink-400" />
                                <span>LMS Credit Operations Desk</span>
                            </h3>

                            <div className="space-y-4 text-xs">
                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-950 text-pink-400">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Central Banking Tower</p>
                                        <p className="text-zinc-400 leading-relaxed">
                                            Level 14, Financial District Boulevard, Corporate Center, Suite 400
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-950 text-pink-300">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Direct Lending Hotline</p>
                                        <p className="font-mono text-zinc-300">+92 (21) 111-562-679</p>
                                        <p className="text-[11px] text-zinc-400">Toll-free across all regional networks</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-950 text-white">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Loan Advisory Email</p>
                                        <p className="font-mono text-zinc-300">credit.support@lmscapital.com</p>
                                        <p className="text-[11px] text-zinc-400">Response within 1 business day</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-950 text-rose-400">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Operating Banking Hours</p>
                                        <p className="text-zinc-300">Monday – Friday: 9:00 AM – 5:30 PM</p>
                                        <p className="text-zinc-400">Saturday: 9:00 AM – 1:30 PM (Customer Helpdesk)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Regulatory notice card */}
                        <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-xs text-zinc-400 leading-relaxed">
                            <p className="font-semibold text-zinc-300 mb-1">Notice to Borrowers:</p>
                            All credit products and loan disbursements are governed by standard banking statutory guidelines and credit appraisal policies. We never solicit sensitive account passwords or PINs.
                        </div>
                    </div>

                    {/* Right: Quick Inquiry Form (7 cols) */}
                    <div className="lg:col-span-7 rounded-2xl border border-pink-500/20 bg-black/80 p-6 sm:p-8 backdrop-blur-md shadow-xl">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white">Send Us a Direct Message</h3>
                            <p className="text-xs text-zinc-400 mt-1">
                                Need custom loan scheduling advice or clarification? Fill in your details below.
                            </p>
                        </div>

                        {submitted ? (
                            <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-6 text-center space-y-3 animate-in fade-in duration-300">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 mx-auto">
                                    <CheckCircle2 size={26} />
                                </div>
                                <h4 className="text-base font-bold text-white">Inquiry Received Successfully</h4>
                                <p className="text-xs text-zinc-300 max-w-md mx-auto">
                                    Thank you for contacting LMS. A designated loan officer will review your inquiry and follow up via email or phone within 24 business hours.
                                </p>
                                <button
                                    onClick={() => {
                                        setSubmitted(false);
                                        setFormData({ name: "", email: "", phone: "", topic: "General Inquiry", message: "" });
                                    }}
                                    className="mt-2 inline-flex text-xs font-semibold text-pink-400 hover:underline cursor-pointer"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                                            Your Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Asad Ali"
                                            className="w-full rounded-xl border border-white/15 bg-black px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="you@domain.com"
                                            className="w-full rounded-xl border border-white/15 bg-black px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                                            Phone / WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+92 300 1234567"
                                            className="w-full rounded-xl border border-white/15 bg-black px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                                            Inquiry Category
                                        </label>
                                        <select
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                            className="w-full rounded-xl border border-white/15 bg-black px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none transition-colors"
                                        >
                                            <option value="General Inquiry">General Inquiry</option>
                                            <option value="Personal Loan Scheme">Personal Loan Scheme</option>
                                            <option value="Auto Loan Scheme">Auto Loan Scheme</option>
                                            <option value="SME Commercial Facility">SME Commercial Facility</option>
                                            <option value="Mortgage Financing">Mortgage Financing</option>
                                            <option value="Repayment Verification">Repayment Verification</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                                        Message / Questions *
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Please describe your loan inquiry, desired tenure, or any specific documentation questions..."
                                        className="w-full rounded-xl border border-white/15 bg-black p-3.5 text-xs text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none transition-colors resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 px-6 py-3 text-xs font-bold text-white shadow-md shadow-pink-500/25 hover:from-pink-500 hover:to-rose-300 transition-all cursor-pointer"
                                >
                                    <Send size={14} />
                                    <span>Submit Your Message</span>
                                </button>
                            </form>
                        )}
                    </div>

                </div>

            </div>
        </section>
    );
}
