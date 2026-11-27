import { useState } from "react";
import {
    Mail,
    Phone,
    MapPin,
    Send,
    CheckCircle2,
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
        <section id="contact" className="relative py-24 bg-white border-t border-pink-100 text-zinc-900">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-100/70 px-3.5 py-1 text-xs font-bold text-pink-700 shadow-sm">
                        <Phone size={13} className="text-pink-600" />
                        <span>Credit Advisory & Support</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                        Get in Touch with Our Loan Specialists
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-600">
                        Have questions regarding financing terms, documentation requirements, or payment verification? Our credit team is here to assist.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Contact Information Cards (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="rounded-3xl border border-pink-200/80 bg-white p-6 space-y-6 shadow-md shadow-pink-500/5">
                            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <ShieldCheck size={20} className="text-pink-600" />
                                <span>LMS Credit Operations Desk</span>
                            </h3>

                            <div className="space-y-4 text-xs">
                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-pink-200 bg-pink-50 text-pink-600">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900">Central Banking Tower</p>
                                        <p className="text-zinc-600 leading-relaxed mt-0.5">
                                            Level 14, Financial District Boulevard, Corporate Center, Suite 400
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-pink-200 bg-pink-50 text-pink-600">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900">Direct Telephone Assistance</p>
                                        <p className="text-zinc-600 font-mono mt-0.5">+92 (021) 111-LMS-CORP</p>
                                        <p className="text-[11px] text-zinc-500">Mon - Fri • 9:00 AM - 5:00 PM PKT</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-pink-200 bg-pink-50 text-pink-600">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900">Official Credit Support Email</p>
                                        <p className="text-zinc-600 font-mono mt-0.5">support@lms.local</p>
                                        <p className="text-[11px] text-zinc-500">Inquiries answered within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Interactive Contact Form (7 cols) */}
                    <div className="lg:col-span-7 rounded-3xl border border-pink-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-pink-500/5">
                        {submitted ? (
                            <div className="text-center py-12 space-y-4">
                                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-3xl bg-pink-100 text-pink-600">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900">Inquiry Received</h3>
                                <p className="text-sm text-zinc-600 max-w-md mx-auto">
                                    Thank you for reaching out. A loan assessment specialist has been assigned to your message and will contact you via email shortly.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSubmitted(false)}
                                    className="rounded-xl border border-pink-200 bg-white px-5 py-2 text-xs font-semibold text-zinc-800 hover:bg-pink-50 shadow-sm"
                                >
                                    Send Another Inquiry
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                                            Your Full Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/15"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="you@domain.com"
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/15"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+92 300 1234567"
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/15"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                                            Inquiry Topic
                                        </label>
                                        <select
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                            style={{ colorScheme: "light" }}
                                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/15"
                                        >
                                            <option value="General Inquiry">General Inquiry</option>
                                            <option value="Loan Application Status">Loan Application Status</option>
                                            <option value="Eligibility & Documentation">Eligibility & Documentation</option>
                                            <option value="Repayment Verification">Repayment Verification</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                                        Your Message
                                    </label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Describe your inquiry or question regarding our loan facilities..."
                                        className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/15"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/25 hover:from-pink-600 hover:to-rose-600 transition-all cursor-pointer"
                                >
                                    <Send size={16} />
                                    <span>Send Message to Credit Specialists</span>
                                </button>
                            </form>
                        )}
                    </div>

                </div>

            </div>
        </section>
    );
}
