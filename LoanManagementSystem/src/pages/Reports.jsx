import { useCallback, useEffect, useState } from "react";
import {
    FileDown,
    FileText,
    RefreshCw,
    TrendingUp,
    PieChart,
    Wallet,
    Calendar,
    Layers,
    AlertTriangle,
    CreditCard,
    Landmark
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import { Button } from "../components/common";
import {
    getLoansReport,
    exportLoansCsv,
    getRepaymentsReport,
    exportRepaymentsCsv,
    getOutstandingReport,
    exportOutstandingCsv,
    getOverdueInstallmentsReport,
    exportOverdueInstallmentsCsv,
    getDisbursementsReport,
    exportDisbursementsCsv
} from "../services/reportService";
import { getCurrentUser } from "../utils/auth";
import { generateReportPdf } from "../utils/pdfGenerator";

const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

export default function Reports() {
    const user = getCurrentUser();

    const [activeTab, setActiveTab] = useState("loans"); // loans | repayments | outstanding | overdue | disbursements
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const fetchReport = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                statusKey: statusFilter || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined
            };

            let res;
            if (activeTab === "repayments") {
                res = await getRepaymentsReport(params);
            } else if (activeTab === "outstanding") {
                res = await getOutstandingReport(params);
            } else if (activeTab === "overdue") {
                res = await getOverdueInstallmentsReport(params);
            } else if (activeTab === "disbursements") {
                res = await getDisbursementsReport(params);
            } else {
                res = await getLoansReport(params);
            }

            const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
            setReportData(list);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load report data.");
            setReportData([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, statusFilter, fromDate, toDate]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleExportCsv = async () => {
        try {
            setExportLoading(true);
            const params = {
                statusKey: statusFilter || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined
            };

            let blob;
            let filename = `${activeTab}_report_${Date.now()}.csv`;

            if (activeTab === "repayments") {
                blob = await exportRepaymentsCsv(params);
            } else if (activeTab === "outstanding") {
                blob = await exportOutstandingCsv(params);
            } else if (activeTab === "overdue") {
                blob = await exportOverdueInstallmentsCsv(params);
            } else if (activeTab === "disbursements") {
                blob = await exportDisbursementsCsv(params);
            } else {
                blob = await exportLoansCsv(params);
            }

            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch {
            setError("Failed to download CSV export.");
        } finally {
            setExportLoading(false);
        }
    };

    const handleExportPdf = () => {
        if (!reportData || reportData.length === 0) return;

        const tabTitles = {
            loans: "Loans Portfolio Executive Audit",
            repayments: "Repayments & Collection Audit",
            outstanding: "Outstanding Credit Risk Exposure",
            overdue: "Delinquent & Overdue Installments",
            disbursements: "Capital Disbursements Report"
        };

        const title = tabTitles[activeTab] || "LMS Financial Audit Report";

        const columns = ["Reference / ID", "Borrower / Customer", "Date", "Amount / Due (PKR)", "Status / Balance"];
        const rows = reportData.map((row, idx) => [
            row.loanNumber || row.paymentReference || `#${row.id || idx + 1}`,
            row.borrowerName || row.customerName || "—",
            row.disbursedAt || row.paidAt || row.dueDate
                ? new Date(row.disbursedAt || row.paidAt || row.dueDate).toLocaleDateString()
                : "—",
            `PKR ${formatAmount(row.principalAmount || row.amount || row.totalDue || 0)}`,
            row.statusName || row.statusKey || row.status || (row.outstandingBalance != null ? `Bal: PKR ${formatAmount(row.outstandingBalance)}` : "Recorded")
        ]);

        const summaryKpis = [
            { label: `Total Volume (${activeTab})`, value: `PKR ${formatAmount(totalVolume)}` },
            { label: "Total Outstanding Exposure", value: `PKR ${formatAmount(totalBalance)}` },
            { label: "Total Filtered Records", value: `${reportData.length} Entries` }
        ];

        generateReportPdf({
            title,
            subtitle: `Official Lending Audit Report | Exported on ${new Date().toLocaleDateString()}`,
            columns,
            rows,
            summaryKpis,
            fileName: `${activeTab}_report_${Date.now()}.pdf`
        });
    };

    // Aggregate summary statistics
    const totalVolume = reportData.reduce((acc, curr) => acc + Number(curr.principalAmount || curr.amount || curr.totalDue || 0), 0);
    const totalBalance = reportData.reduce((acc, curr) => acc + Number(curr.outstandingBalance || curr.remainingDue || 0), 0);

    return (
        <MainLayout user={user}>
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                            <PieChart className="text-pink-500" size={24} />
                            Financial & Portfolio Reports
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            Disbursement metrics, repayment collection rates, and formal PDF/CSV exports across operational categories.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="primary"
                            icon={FileText}
                            onClick={handleExportPdf}
                            disabled={loading || reportData.length === 0}
                            className="bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 text-zinc-900 shadow-lg shadow-pink-500/25"
                        >
                            Export PDF
                        </Button>
                        <Button
                            variant="secondary"
                            icon={FileDown}
                            onClick={handleExportCsv}
                            loading={exportLoading}
                            disabled={loading || reportData.length === 0}
                        >
                            Export CSV
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={RefreshCw}
                            onClick={fetchReport}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* Report Type Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-pink-100 pb-3">
                    {[
                        { id: "loans", label: "Loans Portfolio", icon: Landmark },
                        { id: "repayments", label: "Repayments Collection", icon: CreditCard },
                        { id: "outstanding", label: "Outstanding Risk", icon: Wallet },
                        { id: "overdue", label: "Overdue Installments", icon: AlertTriangle },
                        { id: "disbursements", label: "Disbursements", icon: TrendingUp }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isCurrent = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => { setActiveTab(tab.id); setReportData([]); }}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                    isCurrent
                                        ? "bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 text-zinc-900 shadow-lg shadow-pink-500/25"
                                        : "text-zinc-500 hover:bg-pink-50/40 hover:text-zinc-900"
                                }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-pink-100 bg-white p-5">
                        <div className="flex items-center justify-between text-zinc-500 text-sm">
                            <span>Total Volume ({activeTab})</span>
                            <Wallet size={18} className="text-pink-400" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-zinc-900 font-mono">
                            PKR {formatAmount(totalVolume)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">{reportData.length} records in this view</p>
                    </div>

                    <div className="rounded-2xl border border-pink-100 bg-white p-5">
                        <div className="flex items-center justify-between text-zinc-500 text-sm">
                            <span>Outstanding Balance</span>
                            <TrendingUp size={18} className="text-pink-400" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-pink-400 font-mono">
                            PKR {formatAmount(totalBalance)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">Unpaid portfolio exposure</p>
                    </div>

                    <div className="rounded-2xl border border-pink-100 bg-white p-5">
                        <div className="flex items-center justify-between text-zinc-500 text-sm">
                            <span>Count</span>
                            <Calendar size={18} className="text-zinc-900" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-zinc-900 font-mono">
                            {reportData.length}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">Filtered data rows</p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="rounded-2xl border border-pink-100 bg-white p-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-zinc-500 mb-1">From Date</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full rounded-xl border border-pink-100 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                        />
                    </div>

                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-zinc-500 mb-1">To Date</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full rounded-xl border border-pink-100 bg-white px-3 py-2 text-sm text-zinc-900 outline-none"
                        />
                    </div>
                </div>

                {/* Dynamic Table */}
                <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-pink-100 bg-pink-50/30 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    <th className="px-5 py-4">Reference / ID</th>
                                    <th className="px-5 py-4">Customer / Borrower</th>
                                    <th className="px-5 py-4">Date</th>
                                    <th className="px-5 py-4">Amount / Due</th>
                                    <th className="px-5 py-4">Balance / Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pink-50 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-zinc-500">
                                            Generating report...
                                        </td>
                                    </tr>
                                ) : reportData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-zinc-500">
                                            No records found for the selected reporting parameters.
                                        </td>
                                    </tr>
                                ) : (
                                    reportData.map((row, idx) => (
                                        <tr key={row.id || idx} className="transition hover:bg-pink-50/30">
                                            <td className="px-5 py-4 font-mono font-medium text-zinc-900">
                                                {row.loanNumber || row.paymentReference || `#${row.id || idx + 1}`}
                                            </td>
                                            <td className="px-5 py-4 text-zinc-700 font-medium">
                                                {row.borrowerName || row.customerName || "—"}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-zinc-500">
                                                {row.disbursedAt || row.paidAt || row.dueDate
                                                    ? new Date(row.disbursedAt || row.paidAt || row.dueDate).toLocaleDateString()
                                                    : "—"}
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-zinc-900">
                                                PKR {formatAmount(row.principalAmount || row.amount || row.totalDue || 0)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-zinc-500/10 text-zinc-700 border border-zinc-500/20">
                                                    {row.statusName || row.statusKey || row.status || (row.outstandingBalance != null ? `Bal: PKR ${formatAmount(row.outstandingBalance)}` : "Recorded")}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
