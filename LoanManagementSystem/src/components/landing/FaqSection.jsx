import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            q: "Can I calculate my estimated loan repayment without registering or logging in?",
            a: "Yes! Our interactive loan calculator is completely open to the public without requiring an account or login. You can freely choose between our configured loan schemes, customize your desired principal amount and repayment tenure, and view instant monthly EMI and total interest estimates."
        },
        {
            q: "What are the eligibility requirements to apply for a loan?",
            a: "Applicants must hold a registered customer account, be at least 21 years old, possess a valid National ID / CNIC, and demonstrate verifiable income or business revenue commensurate with the requested loan tier. Specific documentation requirements may vary based on whether you apply as a salaried individual or business enterprise."
        },
        {
            q: "When is a guarantor required for my loan application?",
            a: "Guarantor requirements are defined by the specific loan product facility. Higher-capital facilities such as Auto/Vehicle Financing, Commercial SME Business Loans, and Home Mortgages require a verified guarantor with valid identification and contact credentials. Certain personal financing schemes do not require a guarantor."
        },
        {
            q: "How is the Equated Monthly Installment (EMI) calculated?",
            a: "Installments are calculated using standard reducing-balance amortization formulas. Each monthly repayment comprises an interest portion (assessed on the remaining unpaid principal) and a principal repayment portion. As the principal balance reduces over the loan tenure, the interest component decreases proportionally."
        },
        {
            q: "How long does the loan review and underwriting process take?",
            a: "Once you submit your application and upload required identification and income documents, your submission enters the official credit review queue. A designated credit assessment officer will examine your file and provide an approval, conditional request, or decision typically within 2 to 5 business days."
        },
        {
            q: "Can I make early or partial installment repayments?",
            a: "Yes. Borrowers can record repayments via bank transfer or direct bank deposit at any time. Once verified by our credit operations team, payments are credited immediately to accrued interest and outstanding principal, reducing your total financing liability."
        }
    ];

    const toggleFaq = (idx) => {
        setOpenIndex(openIndex === idx ? -1 : idx);
    };

    return (
        <section id="faq" className="relative py-24 bg-black border-t border-pink-500/20">
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center mb-16 space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1 text-xs font-semibold text-pink-300">
                        <HelpCircle size={13} />
                        <span>Common Borrower Inquiries</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-300">
                        Everything you need to know about our lending facilities, installment formulas, and application workflows.
                    </p>
                </div>

                {/* FAQ Accordion List */}
                <div className="space-y-4">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div
                                key={idx}
                                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                                    isOpen
                                        ? "border-pink-500/40 bg-black/95 shadow-lg shadow-pink-950/20"
                                        : "border-white/10 bg-black/60 hover:border-pink-500/30 hover:bg-black"
                                }`}
                            >
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer focus:outline-none"
                                    aria-expanded={isOpen}
                                >
                                    <span className="text-sm sm:text-base font-semibold text-white pr-4">
                                        {faq.q}
                                    </span>
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-950 transition-transform duration-200 ${isOpen ? "rotate-180 border-pink-500/40 text-pink-400" : "text-zinc-400"}`}>
                                        <ChevronDown size={16} />
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/10 pt-4 animate-in fade-in duration-200">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
