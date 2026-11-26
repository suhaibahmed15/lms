import { useState } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingHero from "../components/landing/LandingHero";
import LoanTypesSection from "../components/landing/LoanTypesSection";
import LoanCalculator from "../components/landing/LoanCalculator";
import HowItWorks from "../components/landing/HowItWorks";
import WhyChooseUs from "../components/landing/WhyChooseUs";
import FaqSection from "../components/landing/FaqSection";
import ContactSection from "../components/landing/ContactSection";
import LandingFooter from "../components/landing/LandingFooter";
import ApplyLoanModal from "../components/landing/ApplyLoanModal";
import "../components/landing/LandingPage.css";

export default function LandingPage() {
    const [applyModalOpen, setApplyModalOpen] = useState(false);
    const [selectedLoanTypeForModal, setSelectedLoanTypeForModal] = useState(null);
    const [selectedTypeForCalculator, setSelectedTypeForCalculator] = useState(null);

    const handleOpenApplyModal = (loanType = null) => {
        setSelectedLoanTypeForModal(loanType);
        setApplyModalOpen(true);
    };

    const handleCloseApplyModal = () => {
        setApplyModalOpen(false);
        setSelectedLoanTypeForModal(null);
    };

    const handleSelectForCalculator = (loanType) => {
        setSelectedTypeForCalculator(loanType);
    };

    return (
        <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
            {/* Top Navigation */}
            <LandingNavbar onOpenApplyModal={() => handleOpenApplyModal()} />

            {/* Main Content Sections */}
            <main className="flex-1">
                {/* 1. Hero Section */}
                <LandingHero onOpenApplyModal={() => handleOpenApplyModal()} />

                {/* 2. Available Loan Products Section */}
                <LoanTypesSection
                    onOpenApplyModal={(type) => handleOpenApplyModal(type)}
                    onSelectForCalculator={handleSelectForCalculator}
                />

                {/* 3. Interactive Loan Calculator */}
                <LoanCalculator
                    onOpenApplyModal={(type) => handleOpenApplyModal(type)}
                    selectedTypeFromParent={selectedTypeForCalculator}
                />

                {/* 4. Customer Journey / How It Works */}
                <HowItWorks onOpenApplyModal={() => handleOpenApplyModal()} />

                {/* 5. Why Choose Us / Trust Pillars */}
                <WhyChooseUs />

                {/* 6. Frequently Asked Questions */}
                <FaqSection />

                {/* 7. Contact Information & Direct Message */}
                <ContactSection />
            </main>

            {/* Professional Footer */}
            <LandingFooter onOpenApplyModal={() => handleOpenApplyModal()} />

            {/* Modern Apply Loan Popup Dialog */}
            <ApplyLoanModal
                isOpen={applyModalOpen}
                onClose={handleCloseApplyModal}
                selectedLoanType={selectedLoanTypeForModal}
            />
        </div>
    );
}
