import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

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
        <section id="faq" className="relative py-24 bg-gradient-to-b from-[#fff7f9] via-[#ffffff] to-[#fff0f5] border-t border-pink-100 text-zinc-900">
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center mb-16 space-y-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-100/70 px-3.5 py-1 text-xs font-bold text-pink-700 shadow-sm">
                        <HelpCircle size={13} className="text-pink-600" />
                        <span>Common Borrower Inquiries</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-600">
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
                                        ? "border-pink-300 bg-white shadow-lg shadow-pink-500/5"
                                        : "border-pink-100 bg-white hover:border-pink-200 shadow-sm"
                                }`}
                            >
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full flex items-center justify-between p-5 text-left transition-colors cursor-pointer"
                                >
                                    <span className="text-sm font-bold text-zinc-900 pr-4">
                                        {faq.q}
                                    </span>
                                    <span className={`shrink-0 rounded-full p-1 border border-pink-200 transition-transform duration-200 ${isOpen ? "rotate-180 bg-pink-50 text-pink-600" : "text-zinc-400"}`}>
                                        <ChevronDown size={16} />
                                    </span>
                                </button>
                                {isOpen && (
                                    <div className="px-5 pb-5 pt-1 border-t border-pink-50 text-xs text-zinc-600 leading-relaxed">
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
