import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatPkr = (amt) =>
    Number(amt || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-PK", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    } catch {
        return "—";
    }
};

/**
 * Generate a Formal Loan Facility Agreement & Amortization Contract Document
 */
export const generateLoanAgreementPdf = (loan, schedules = [], options = {}) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);

    const primaryColor = [18, 24, 38]; // Dark Charcoal/Navy
    const accentColor = [234, 88, 12]; // Orange Accent (#ea580c)
    const textDark = [30, 41, 59];
    const textMuted = [100, 116, 139];
    const borderGray = [226, 232, 240];

    let currentY = margin;

    // -------------------------------------------------------------------------
    // 1. Header & Institution Banner
    // -------------------------------------------------------------------------
    doc.setFillColor(...primaryColor);
    doc.rect(margin, currentY, contentWidth, 68, "F");

    // Decorative Orange Accent Stripe
    doc.setFillColor(...accentColor);
    doc.rect(margin, currentY + 65, contentWidth, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("LMS CAPITAL FINANCING", margin + 18, currentY + 28);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text("Consumer & Commercial Credit Division | Official Loan Agreement & Sanction Letter", margin + 18, currentY + 44);

    // Right-aligned Reference details
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    const refNo = `REF: AGR-${loan?.loanNumber || "NEW"}`;
    const issueDate = `Issue Date: ${formatDate(loan?.disbursedAt || new Date())}`;
    doc.text(refNo, pageWidth - margin - 18, currentY + 28, { align: "right" });
    doc.text(issueDate, pageWidth - margin - 18, currentY + 44, { align: "right" });

    currentY += 85;

    // -------------------------------------------------------------------------
    // 2. Borrower & Credit Facility Summary Cards (Two Columns)
    // -------------------------------------------------------------------------
    const colWidth = (contentWidth - 14) / 2;
    const boxHeight = 88;

    // Left Box: Borrower Info
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...borderGray);
    doc.roundedRect(margin, currentY, colWidth, boxHeight, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text("BORROWER INFORMATION", margin + 12, currentY + 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...textDark);
    doc.text(`Full Name:`, margin + 12, currentY + 36);
    doc.setFont("helvetica", "bold");
    doc.text(`${loan?.borrowerName || "Valued Customer"}`, margin + 70, currentY + 36);

    doc.setFont("helvetica", "normal");
    doc.text(`Borrower ID:`, margin + 12, currentY + 52);
    doc.text(`#USR-${loan?.borrowerUserId || "101"}`, margin + 70, currentY + 52);

    doc.text(`Loan Account:`, margin + 12, currentY + 68);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accentColor);
    doc.text(`${loan?.loanNumber || "—"}`, margin + 70, currentY + 68);

    // Right Box: Facility Information
    const col2X = margin + colWidth + 14;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...borderGray);
    doc.roundedRect(col2X, currentY, colWidth, boxHeight, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text("CREDIT FACILITY DETAILS", col2X + 12, currentY + 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...textDark);
    doc.text(`Loan Type:`, col2X + 12, currentY + 36);
    doc.setFont("helvetica", "bold");
    doc.text(`${loan?.loanTypeName || loan?.loanType || "Commercial / Personal Loan"}`, col2X + 75, currentY + 36);

    doc.setFont("helvetica", "normal");
    doc.text(`Facility Status:`, col2X + 12, currentY + 52);
    doc.setFont("helvetica", "bold");
    const stName = (loan?.statusName || "ACTIVE").toUpperCase();
    doc.setTextColor(stName.includes("ACTIVE") ? 16 : 220, stName.includes("ACTIVE") ? 149 : 38, 38);
    doc.text(`${stName}`, col2X + 75, currentY + 52);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDark);
    doc.text(`Repayment Cycle:`, col2X + 12, currentY + 68);
    doc.text(`Monthly Installment (EMI)`, col2X + 85, currentY + 68);

    currentY += boxHeight + 14;

    // -------------------------------------------------------------------------
    // 3. Financial Breakdown Bar (Principal, Interest, Total, Monthly EMI)
    // -------------------------------------------------------------------------
    const principal = Number(loan?.principalAmount || 0);
    const totalPayable = Number(loan?.totalPayableAmount || 0);
    const totalInterest = Math.max(0, totalPayable - principal);
    const monthlyEmi = Number(loan?.monthlyInstallment || (loan?.termMonths ? totalPayable / loan.termMonths : 0));

    const statBoxWidth = (contentWidth - 18) / 4;
    const statBoxHeight = 44;

    const stats = [
        { label: "PRINCIPAL SANCTIONED", value: `PKR ${formatPkr(principal)}` },
        { label: `INTEREST (${loan?.interestRate || 0}%)`, value: `PKR ${formatPkr(totalInterest)}` },
        { label: "TOTAL PAYABLE", value: `PKR ${formatPkr(totalPayable)}` },
        { label: `TENURE (${loan?.termMonths || 0} MOS)`, value: `PKR ${formatPkr(monthlyEmi)}/mo` }
    ];

    stats.forEach((s, idx) => {
        const bx = margin + (idx * (statBoxWidth + 6));
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(...borderGray);
        doc.roundedRect(bx, currentY, statBoxWidth, statBoxHeight, 3, 3, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...textMuted);
        doc.text(s.label, bx + 8, currentY + 14);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...primaryColor);
        doc.text(s.value, bx + 8, currentY + 32);
    });

    currentY += statBoxHeight + 14;

    // -------------------------------------------------------------------------
    // 4. Terms, Grace Period & Overdue Penalty Clause
    // -------------------------------------------------------------------------
    doc.setFillColor(255, 247, 237); // Light amber
    doc.setDrawColor(254, 215, 170);
    doc.roundedRect(margin, currentY, contentWidth, 54, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(194, 65, 12); // Amber 800
    doc.text("TERMS, REPAYMENT SCHEDULE & OVERDUE PENALTY CLAUSE", margin + 10, currentY + 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(124, 45, 18);
    doc.text(
        "1. Installments must be paid on or before the designated Due Date. A standard grace period of 7 calendar days is granted.\n" +
        "2. If payment is delayed beyond 7 days, an overdue surcharge penalty of 2.0% per month shall accrue on the delinquent amount.\n" +
        "3. Continued default exceeding 60 days constitutes technical breach, entitling the lender to accelerate the entire debt.",
        margin + 10,
        currentY + 27,
        { maxWidth: contentWidth - 20, lineHeightFactor: 1.35 }
    );

    currentY += 62;

    // -------------------------------------------------------------------------
    // 5. Complete Amortization Schedule Table
    // -------------------------------------------------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text("AMORTIZATION & INSTALLMENT SCHEDULE PLAN", margin, currentY);
    currentY += 6;

    const tableRows = (schedules || []).map((s) => {
        const pDue = Number(s.principalDue ?? s.principalAmount ?? 0);
        const iDue = Number(s.interestDue ?? s.interestAmount ?? 0);
        const tDue = Number(s.totalDue ?? s.totalAmount ?? (pDue + iDue));
        const paid = Number(s.paidAmount || 0);

        return [
            s.installmentNumber || "—",
            formatDate(s.dueDate),
            `PKR ${formatPkr(pDue)}`,
            `PKR ${formatPkr(iDue)}`,
            `PKR ${formatPkr(tDue)}`,
            `PKR ${formatPkr(paid)}`,
            (s.statusName || s.statusKey || "Pending").toUpperCase()
        ];
    });

    autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [["#", "Due Date", "Principal Due", "Interest Due", "Total Due", "Paid Amount", "Status"]],
        body: tableRows.length > 0 ? tableRows : [["—", "—", "PKR 0.00", "PKR 0.00", "PKR 0.00", "PKR 0.00", "SCHEDULE NOT GENERATED"]],
        theme: "grid",
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 7.5,
            fontStyle: "bold",
            halign: "center"
        },
        styles: {
            fontSize: 7.5,
            cellPadding: 4,
            textColor: textDark,
            lineColor: [226, 232, 240],
            lineWidth: 0.5
        },
        columnStyles: {
            0: { halign: "center", cellWidth: 26 },
            1: { halign: "center", cellWidth: 70 },
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right", fontStyle: "bold" },
            5: { halign: "right" },
            6: { halign: "center" }
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },
        didDrawPage: (data) => {
            // Footer on every page
            const str = `Page ${doc.internal.getNumberOfPages()} | LMS Capital Financing Limited — Legally Binding Loan Agreement`;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(...textMuted);
            doc.text(str, margin, pageHeight - 20);

            const timestamp = `System Generated: ${new Date().toUTCString()}`;
            doc.text(timestamp, pageWidth - margin, pageHeight - 20, { align: "right" });
        }
    });

    // -------------------------------------------------------------------------
    // 6. Signatures & Official Seals Block (Ensured on final page)
    // -------------------------------------------------------------------------
    let finalY = doc.lastAutoTable.finalY + 24;

    // If remaining space on the page is less than 120pt, add new page
    if (finalY + 110 > pageHeight - 35) {
        doc.addPage();
        finalY = margin + 20;
    }

    doc.setDrawColor(...borderGray);
    doc.line(margin, finalY, pageWidth - margin, finalY);
    finalY += 16;

    const sigColWidth = (contentWidth - 40) / 3;

    // 1. Borrower Signature
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryColor);
    doc.text("BORROWER ACKNOWLEDGEMENT", margin, finalY);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(...textMuted);
    doc.text("I accept all financial terms and schedules.", margin, finalY + 12);

    doc.setDrawColor(148, 163, 184);
    doc.line(margin, finalY + 44, margin + sigColWidth, finalY + 44);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(loan?.borrowerName || "Borrower Signature", margin, finalY + 56);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Authorized Signature & Date", margin, finalY + 66);

    // 2. Official Seal / Verification Stamp (Middle)
    const stampX = margin + sigColWidth + 20;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(...accentColor);
    doc.roundedRect(stampX, finalY, sigColWidth, 68, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...accentColor);
    doc.text("OFFICIAL VERIFICATION SEAL", stampX + (sigColWidth / 2), finalY + 16, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...textDark);
    doc.text("LMS CAPITAL FINANCING", stampX + (sigColWidth / 2), finalY + 30, { align: "center" });
    doc.text("CREDIT SANCTION DIVISION", stampX + (sigColWidth / 2), finalY + 40, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 149, 193);
    doc.text("DIGITALLY SIGNED & VERIFIED", stampX + (sigColWidth / 2), finalY + 54, { align: "center" });

    // 3. Authorized Loan Officer Signature (Right)
    const offX = pageWidth - margin - sigColWidth;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryColor);
    doc.text("LOAN OFFICER SANCTION", offX, finalY);

    // Calligraphic style simulated for officer signature
    doc.setFont("times", "bolditalic");
    doc.setFontSize(13);
    doc.setTextColor(30, 58, 138); // Deep Navy Ink
    doc.text(options.officerName || "Muhammad Ovais", offX + 10, finalY + 32);

    doc.setDrawColor(148, 163, 184);
    doc.line(offX, finalY + 44, offX + sigColWidth, finalY + 44);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(options.officerName || "Muhammad Ovais", offX, finalY + 56);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Senior Loan & Credit Officer (Branch Credit Head)", offX, finalY + 66);

    // Trigger download
    const fileName = `Loan_Agreement_${loan?.loanNumber || "LMS"}.pdf`;
    doc.save(fileName);
    return fileName;
};

/**
 * Generate a Standard Professional Executive Report PDF
 */
export const generateReportPdf = ({
    title = "Executive Report",
    subtitle = "Loan Management System Audit & Analytics",
    columns = [],
    rows = [],
    summaryKpis = [],
    fileName = "report.pdf"
}) => {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 36;
    const contentWidth = pageWidth - (margin * 2);

    const primaryColor = [18, 24, 38];
    const accentColor = [234, 88, 12];
    const borderGray = [226, 232, 240];

    let currentY = margin;

    // Header Banner
    doc.setFillColor(...primaryColor);
    doc.rect(margin, currentY, contentWidth, 54, "F");

    doc.setFillColor(...accentColor);
    doc.rect(margin, currentY + 51, contentWidth, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), margin + 16, currentY + 24);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(subtitle, margin + 16, currentY + 40);

    const generatedOn = `Generated: ${new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`;
    doc.text(generatedOn, pageWidth - margin - 16, currentY + 32, { align: "right" });

    currentY += 66;

    // Optional KPI summary strip
    if (summaryKpis && summaryKpis.length > 0) {
        const kpiWidth = (contentWidth - ((summaryKpis.length - 1) * 8)) / summaryKpis.length;
        const kpiHeight = 36;

        summaryKpis.forEach((kpi, idx) => {
            const kx = margin + (idx * (kpiWidth + 8));
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(...borderGray);
            doc.roundedRect(kx, currentY, kpiWidth, kpiHeight, 3, 3, "FD");

            doc.setFont("helvetica", "normal");
            doc.setFontSize(6.5);
            doc.setTextColor(100, 116, 139);
            doc.text(kpi.label.toUpperCase(), kx + 8, currentY + 12);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(...primaryColor);
            doc.text(String(kpi.value), kx + 8, currentY + 28);
        });

        currentY += kpiHeight + 14;
    }

    // Data Table
    autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [columns],
        body: rows.length > 0 ? rows : [columns.map(() => "—")],
        theme: "striped",
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 7.5,
            fontStyle: "bold"
        },
        styles: {
            fontSize: 7.5,
            cellPadding: 4,
            textColor: [30, 41, 59],
            lineColor: borderGray,
            lineWidth: 0.5
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },
        didDrawPage: (data) => {
            const pageStr = `Page ${doc.internal.getNumberOfPages()} | LMS Capital Financing Limited — Confidential Audit Report`;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);
            doc.text(pageStr, margin, pageHeight - 16);
        }
    });

    doc.save(fileName);
    return fileName;
};

export default {
    generateLoanAgreementPdf,
    generateReportPdf
};
