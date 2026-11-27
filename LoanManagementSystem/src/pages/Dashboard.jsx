import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FileText,
    Landmark,
    Activity,
    Wallet,
    ArrowUpRight,
    TrendingUp,
    PieChart,
    CreditCard,
    FileSpreadsheet
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
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

    // Prepare chart data for Application Status Donut
    const totalApps = dashboardData?.totalApplications || 0;
    const applicationStatusData = [
        { label: "Approved", value: dashboardData?.approvedApplications || 0, color: "#10b981" },
        { label: "Under Review", value: dashboardData?.applicationsUnderReview || 0, color: "#ec4899" },
        { label: "Docs Required", value: dashboardData?.applicationsAwaitingDocuments || 0, color: "#f472b6" },
        { label: "Pending", value: dashboardData?.pendingApplications || 0, color: "#db2777" },
        { label: "Rejected", value: dashboardData?.rejectedApplications || 0, color: "#e11d48" }
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
                            <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                                Executive Overview
                            </h1>
                            <span className="inline-flex rounded-full border border-pink-200 bg-pink-100/70 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-pink-700">
                                {roleKey || "Authorized"}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-500">
                            Real-time portfolio metrics, risk analysis, and workflow status.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={fetchDashboard}
                            disabled={loading}
                            className="rounded-xl border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-pink-50 hover:text-pink-600"
                        >
                            Refresh Metrics
                        </button>
                    </div>
                </div>

                {loading ? (
                    <Loading message="Compiling financial metrics and portfolio state..." />
                ) : error ? (
                    <div className="rounded-2xl border border-red-500/25 bg-red-50 p-5">
                        <p className="font-medium text-red-600">{error}</p>
                        <button
                            type="button"
                            onClick={fetchDashboard}
                            className="mt-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 transition hover:opacity-95"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        {/* 1. Primary Capital KPI Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Total Disbursed */}
                            <div className="relative overflow-hidden rounded-3xl border border-pink-200/80 bg-white p-5 shadow-lg shadow-pink-500/5 transition hover:border-pink-300">
                                <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
                                    <span>Total Capital Disbursed</span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-pink-200 bg-pink-50 text-pink-600">
                                        <Landmark size={18} />
                                    </div>
                                </div>
                                <h3 className="mt-3 text-2xl font-black text-zinc-900 font-mono">
                                    PKR {formatAmount(disbursed)}
                                </h3>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Across {dashboardData?.totalLoans ?? 0} disbursed loans
                                </p>
                            </div>

                            {/* Total Outstanding */}
                            <div className="relative overflow-hidden rounded-3xl border border-pink-200/80 bg-white p-5 shadow-lg shadow-pink-500/5 transition hover:border-pink-300">
                                <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
                                    <span>Outstanding Portfolio</span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600">
                                        <Wallet size={18} />
                                    </div>
                                </div>
                                <h3 className="mt-3 text-2xl font-black text-rose-600 font-mono">
                                    PKR {formatAmount(outstanding)}
                                </h3>
                                <p className="mt-1 text-xs text-zinc-500">
                                    {dashboardData?.activeLoans ?? 0} loans actively in repayment
                                </p>
                            </div>

                            {/* Total Collected */}
                            <div className="relative overflow-hidden rounded-3xl border border-pink-200/80 bg-white p-5 shadow-lg shadow-pink-500/5 transition hover:border-pink-300">
                                <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
                                    <span>Repayment Collections</span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                                        <TrendingUp size={18} />
                                    </div>
                                </div>
                                <h3 className="mt-3 text-2xl font-black text-emerald-600 font-mono">
                                    PKR {formatAmount(collected)}
                                </h3>
                                <p className="mt-1 text-xs text-zinc-500">
                                    {dashboardData?.totalRepayments ?? 0} verified payments
                                </p>
                            </div>

                            {/* Applications Flow */}
                            <div className="relative overflow-hidden rounded-3xl border border-pink-200/80 bg-white p-5 shadow-lg shadow-pink-500/5 transition hover:border-pink-300">
                                <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
                                    <span>Active Pipeline Cases</span>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-pink-200 bg-pink-50 text-pink-600">
                                        <FileText size={18} />
                                    </div>
                                </div>
                                <h3 className="mt-3 text-2xl font-black text-pink-600 font-mono">
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
                            <div className="rounded-3xl border border-pink-200/80 bg-white p-6 shadow-lg shadow-pink-500/5">
                                <div className="flex items-center justify-between border-b border-pink-100 pb-4 mb-4">
                                    <div>
                                        <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                                            <PieChart size={18} className="text-pink-600" />
                                            Application Lifecycle Distribution
                                        </h3>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            Proportional breakdown of submitted applications by stage.
                                        </p>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-zinc-700 bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-lg">
                                        {totalApps} Total
                                    </span>
                                </div>

                                <StatusDonutChart
                                    data={applicationStatusData}
                                    total={totalApps}
                                />
                            </div>

                            {/* Chart B: Capital Flow Multi-Bar */}
                            <div className="rounded-3xl border border-pink-200/80 bg-white p-6 shadow-lg shadow-pink-500/5">
                                <div className="flex items-center justify-between border-b border-pink-100 pb-4 mb-4">
                                    <div>
                                        <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                                            <Activity size={18} className="text-pink-600" />
                                            Capital Portfolio Dynamics
                                        </h3>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            Disbursed loans vs outstanding risk vs collected revenue.
                                        </p>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-pink-700 bg-pink-100/70 border border-pink-200 px-2.5 py-1 rounded-lg">
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
                        <div className="rounded-3xl border border-pink-200/80 bg-white p-6 shadow-lg shadow-pink-500/5 space-y-4">
                            <h3 className="text-base font-bold text-zinc-900">
                                Quick Management Navigation
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Link
                                    to="/loans/applications"
                                    className="group flex items-center justify-between p-4 rounded-2xl border border-pink-100 bg-pink-50/30 hover:bg-pink-50 hover:border-pink-300 transition shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-pink-100 text-pink-600 group-hover:scale-110 transition">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">Applications</p>
                                            <p className="text-xs text-zinc-500">Review & approve cases</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-zinc-400 group-hover:text-pink-600 transition" />
                                </Link>

                                <Link
                                    to="/loans"
                                    className="group flex items-center justify-between p-4 rounded-2xl border border-pink-100 bg-pink-50/30 hover:bg-pink-50 hover:border-pink-300 transition shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-pink-100 text-pink-600 group-hover:scale-110 transition">
                                            <Landmark size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">Disbursed Loans</p>
                                            <p className="text-xs text-zinc-500">Schedule & balances</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-zinc-400 group-hover:text-pink-600 transition" />
                                </Link>

                                <Link
                                    to="/repayments"
                                    className="group flex items-center justify-between p-4 rounded-2xl border border-pink-100 bg-pink-50/30 hover:bg-pink-50 hover:border-pink-300 transition shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-pink-100 text-pink-600 group-hover:scale-110 transition">
                                            <CreditCard size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">Repayments</p>
                                            <p className="text-xs text-zinc-500">Verify client receipts</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-zinc-400 group-hover:text-pink-600 transition" />
                                </Link>

                                <Link
                                    to="/reports"
                                    className="group flex items-center justify-between p-4 rounded-2xl border border-pink-100 bg-pink-50/30 hover:bg-pink-50 hover:border-pink-300 transition shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-pink-100 text-pink-600 group-hover:scale-110 transition">
                                            <FileSpreadsheet size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">Financial Reports</p>
                                            <p className="text-xs text-zinc-500">CSV portfolio exports</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-zinc-400 group-hover:text-pink-600 transition" />
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
