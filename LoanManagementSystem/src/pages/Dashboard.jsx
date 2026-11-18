import { useCallback, useEffect, useState } from "react";
import {
    Users,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Landmark,
    Activity,
    Wallet
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/common/PageHeader";
import Loading from "../components/common/Loading";

import { getDashboardSummary } from "../services/dashboardService";
import { getCurrentUser } from "../utils/auth";

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

    const summaryCards = [
        {
            title: "Total Users",
            value: dashboardData?.totalUsers ?? 0,
            icon: <Users size={20} />,
            accent: "border-orange-500/25 bg-orange-500/15 text-orange-400"
        },
        {
            title: "Total Applications",
            value: dashboardData?.totalApplications ?? 0,
            icon: <FileText size={20} />,
            accent: "border-amber-500/25 bg-amber-500/15 text-amber-400"
        },
        {
            title: "Pending Applications",
            value: dashboardData?.pendingApplications ?? 0,
            icon: <Clock size={20} />,
            accent: "border-yellow-500/25 bg-yellow-500/15 text-yellow-400"
        },
        {
            title: "Approved Applications",
            value: dashboardData?.approvedApplications ?? 0,
            icon: <CheckCircle2 size={20} />,
            accent: "border-emerald-500/25 bg-emerald-500/15 text-emerald-400"
        },
        {
            title: "Rejected Applications",
            value: dashboardData?.rejectedApplications ?? 0,
            icon: <XCircle size={20} />,
            accent: "border-red-500/25 bg-red-500/15 text-red-400"
        },
        {
            title: "Total Loans",
            value: dashboardData?.totalLoans ?? 0,
            icon: <Landmark size={20} />,
            accent: "border-orange-500/25 bg-orange-500/15 text-orange-300"
        },
        {
            title: "Active Loans",
            value: dashboardData?.activeLoans ?? 0,
            icon: <Activity size={20} />,
            accent: "border-emerald-500/25 bg-emerald-500/15 text-emerald-400"
        },
        {
            title: "Outstanding Amount",
            value: `PKR ${Number(
                dashboardData?.totalOutstandingAmount ?? 0
            ).toLocaleString("en-PK")}`,
            icon: <Wallet size={20} />,
            accent: "border-orange-500/30 bg-gradient-to-br from-orange-600/25 to-orange-500/15 text-orange-400"
        }
    ];

    return (
        <MainLayout user={user}>
            <PageHeader
                title="Dashboard"
                description="Monitor your loan management operations."
                showButton={false}
            />

            {loading ? (
                <Loading message="Loading dashboard statistics..." />
            ) : error ? (
                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-5">
                    <p className="font-medium text-red-400">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchDashboard}
                        className="mt-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-500 hover:to-orange-400"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {summaryCards.map((card) => (
                            <div
                                key={card.title}
                                className="rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-xl shadow-black/40 transition hover:border-orange-500/30"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-zinc-400">
                                        {card.title}
                                    </p>

                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl border ${card.accent}`}
                                    >
                                        {card.icon}
                                    </div>
                                </div>

                                <h2 className="mt-5 break-words text-2xl font-bold text-white">
                                    {card.value}
                                </h2>
                            </div>
                        ))}
                    </div>

                    {/* Welcome Section */}
                    <div className="relative mt-7 overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-xl shadow-black/40">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />

                        <p className="text-xs font-semibold uppercase tracking-[2px] text-orange-400">
                            LMS Capital Overview
                        </p>

                        <h2 className="mt-2 text-lg font-bold text-white">
                            Welcome to Loan Management System
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                            Manage applications, monitor loan progress,
                            and track outstanding balances from one
                            centralized dashboard.
                        </p>
                    </div>
                </>
            )}
        </MainLayout>
    );
}

export default Dashboard;
