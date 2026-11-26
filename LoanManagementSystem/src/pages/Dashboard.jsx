import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Landmark,
    Activity,
    Wallet,
    ArrowUpRight,
    TrendingUp,
    ShieldAlert,
    PieChart,
    CalendarCheck,
    CreditCard,
    FileSpreadsheet
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/common/PageHeader";
import Loading from "../components/common/Loading";
import StatusDonutChart from "../components/dashboard/StatusDonutChart";
import PortfolioBarChart from "../components/dashboard/PortfolioBarChart";
import MetricGauges from "../components/dashboard/MetricGauges";
import OfficerWorkloadTable from "../components/dashboard/OfficerWorkloadTable";

import { getDashboardSummary } from "../services/dashboardService";
import { getCurrentUser } from "../utils/auth";

const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = getCurrentUser();

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getDashboardSummary();
            setDashboardData(response);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load dashboard information."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const roleKey = (dashboardData?.roleKey || user?.role || "").toUpperCase();
    const isCustomer = roleKey === "CUSTOMER";
    const isStaff = ["ADMIN", "MANAGER", "OFFICER"].includes(roleKey);

    // Prepare chart data for Application Status Donut
    const totalApps = dashboardData?.totalApplications || 0;
    const applicationStatusData = [
        { label: "Approved", value: dashboardData?.approvedApplications || 0, color: "#ffffff" },
        { label: "Under Review", value: dashboardData?.applicationsUnderReview || 0, color: "#ec4899" },
        { label: "Docs Required", value: dashboardData?.applicationsAwaitingDocuments || 0, color: "#f472b6" },
        { label: "Pending", value: dashboardData?.pendingApplications || 0, color: "#db2777" },
        { label: "Rejected", value: dashboardData?.rejectedApplications || 0, color: "#9d174d" }
    ];

    // Compute key rates
    const disbursed = Number(dashboardData?.totalDisbursedAmount || 0);
    const collected = Number(dashboardData?.totalCollectedRepayments || 0);
    const outstanding = Number(dashboardData?.totalOutstandingAmount || 0);
    const approved = Number(dashboardData?.approvedApplications || 0);

    const recoveryRate = disbursed > 0 ? (collected / disbursed) * 100 : 0;
    const approvalRate = totalApps > 0 ? (approved / totalApps) * 100 : 0;

    return (
        <MainLayout user={user}>
            <div className="space-y-7">
                {/* Header with Role Pill */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black tracking-tight text-white">
                                Executive Overview
                            </h1>
                            <span className="inline-flex rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-pink-400">
                                {roleKey || "Authorized"}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">
                            Real-time portfolio metrics, risk analysis, and workflow status.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={fetchDashboard}
                            disabled={loading}
                            className="rounded-xl border border-white/10 bg-[#141414] px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
                        >
                            Refresh Metrics
                        </button>
                    </div>
                </div>

                {loading ? (
                    <Loading message="Compiling financial metrics and portfolio state..." />
                ) : error ? (
                    <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-5">
                        <p className="font-medium text-red-400">{error}</p>
                        <button
                            type="button"
                            onClick={fetchDashboard}
                            className="mt-3 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 transition hover:opacity-95"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        {/* 1. Primary Capital KPI Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Total Disbursed */}
                            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl transition hover:border-pink-500/30">
                                <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                                    <span>Total Capital Disbursed</span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-pink-500/20 bg-pink-500/10 text-pink-400">
                                        <Landmark size={18} />
                                    </div>
                                </div>
                                <h3 className="mt-3 text-2xl font-black text-white font-mono">
                                    PKR {formatAmount(disbursed)}
                                </h3>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Across {dashboardData?.totalLoans ?? 0} disbursed loans
                                </p>
                            </div>

                            {/* Total Outstanding */}
                            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl transition hover:border-pink-500/40">
                                <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                                    <span>Outstanding Portfolio Balance</span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white">
                                        <Wallet size={18} />
                                    </div>
                                </div>
                                <h3 className="mt-3 text-2xl font-black text-pink-400 font-mono">
                                    PKR {formatAmount(outstanding)}
                                </h3>
                                <p className="mt-1 text-xs text-zinc-500">
                                    {dashboardData?.activeLoans ?? 0} loans actively in repayment
                                </p>
                            </div>

                            {/* Total Collected */}
                            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl transition hover:border-pink-500/30">
                                <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                                    <span>Repayment Collections</span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-pink-500/20 bg-pink-500/10 text-pink-300">
                                        <TrendingUp size={18} />
                                    </div>
                                </div>
                                <h3 className="mt-3 text-2xl font-black text-white font-mono">
                                    PKR {formatAmount(collected)}
                                </h3>
                                <p className="mt-1 text-xs text-zinc-500">
                                    {dashboardData?.totalRepayments ?? 0} verified payments
                                </p>
                            </div>

                            {/* Applications Flow */}
                            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-xl transition hover:border-pink-500/30">
                                <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                                    <span>Active Pipeline Cases</span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-pink-500/20 bg-pink-500/10 text-pink-400">
                                        <FileText size={18} />
                                    </div>
                                </div>
                                <h3 className="mt-3 text-2xl font-black text-white font-mono">
                                    {totalApps}
                                </h3>
                                <p className="mt-1 text-xs text-zinc-500">
                                    {dashboardData?.pendingApplications ?? 0} awaiting review / decision
                                </p>
                            </div>
                        </div>

                        {/* 2. Performance & Health Gauges */}
                        <MetricGauges
                            recoveryRate={recoveryRate}
                            approvalRate={approvalRate}
                            activeCount={dashboardData?.activeLoans ?? 0}
                            closedCount={dashboardData?.closedLoans ?? 0}
                        />

                        {/* 3. Interactive Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Chart A: Application Status Donut */}
                            <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-xl shadow-black/40">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                                    <div>
                                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                                            <PieChart size={18} className="text-pink-400" />
                                            Application Lifecycle Distribution
                                        </h3>
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            Proportional breakdown of submitted applications by stage.
                                        </p>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-zinc-400 bg-white/5 px-2.5 py-1 rounded-lg">
                                        {totalApps} Total
                                    </span>
                                </div>

                                <StatusDonutChart
                                    data={applicationStatusData}
                                    total={totalApps}
                                />
                            </div>

                            {/* Chart B: Capital Flow Multi-Bar */}
                            <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-xl shadow-black/40">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                                    <div>
                                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                                            <Activity size={18} className="text-white" />
                                            Capital Portfolio Dynamics
                                        </h3>
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            Disbursed loans vs outstanding risk vs collected revenue.
                                        </p>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-pink-300 bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-lg">
                                        {recoveryRate.toFixed(1)}% Recovered
                                    </span>
                                </div>

                                <PortfolioBarChart
                                    disbursed={disbursed}
                                    outstanding={outstanding}
                                    collected={collected}
                                />
                            </div>
                        </div>

                        {/* 4. Officer Performance Matrix (Admin / Manager) */}
                        {dashboardData?.officerWorkload && dashboardData.officerWorkload.length > 0 && (
                            <OfficerWorkloadTable workload={dashboardData.officerWorkload} />
                        )}

                        {/* 5. Quick Navigation Action Hub */}
                        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-xl shadow-black/40 space-y-4">
                            <h3 className="text-base font-bold text-white">
                                Quick Management Navigation
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Link
                                    to="/loans/applications"
                                    className="group flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-pink-500/40 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 group-hover:scale-110 transition">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Applications</p>
                                            <p className="text-xs text-zinc-400">Review & approve cases</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-zinc-500 group-hover:text-white transition" />
                                </Link>

                                <Link
                                    to="/loans"
                                    className="group flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-pink-500/40 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-white/10 text-white group-hover:scale-110 transition">
                                            <Landmark size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Disbursed Loans</p>
                                            <p className="text-xs text-zinc-400">Schedule & balances</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-zinc-500 group-hover:text-white transition" />
                                </Link>

                                <Link
                                    to="/repayments"
                                    className="group flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-pink-500/40 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-pink-500/15 text-pink-300 group-hover:scale-110 transition">
                                            <CreditCard size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Repayments</p>
                                            <p className="text-xs text-zinc-400">Verify client receipts</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-zinc-500 group-hover:text-white transition" />
                                </Link>

                                <Link
                                    to="/reports"
                                    className="group flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-pink-500/40 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 group-hover:scale-110 transition">
                                            <FileSpreadsheet size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Financial Reports</p>
                                            <p className="text-xs text-zinc-400">CSV portfolio exports</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-zinc-500 group-hover:text-white transition" />
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </MainLayout>
    );
}

export default Dashboard;
