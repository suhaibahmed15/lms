
import { useEffect, useState } from "react";

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

    useEffect(() => {
        const fetchDashboard = async () => {
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
        };

        fetchDashboard();
    }, []);

    const summaryCards = [
        {
            title: "Total Users",
            value: dashboardData?.totalUsers ?? 0,
            icon: "👥",
            color: "bg-blue-50 text-blue-700"
        },
        {
            title: "Total Applications",
            value: dashboardData?.totalApplications ?? 0,
            icon: "📄",
            color: "bg-purple-50 text-purple-700"
        },
        {
            title: "Pending Applications",
            value: dashboardData?.pendingApplications ?? 0,
            icon: "⏳",
            color: "bg-amber-50 text-amber-700"
        },
        {
            title: "Approved Applications",
            value: dashboardData?.approvedApplications ?? 0,
            icon: "✓",
            color: "bg-emerald-50 text-emerald-700"
        },
        {
            title: "Rejected Applications",
            value: dashboardData?.rejectedApplications ?? 0,
            icon: "✕",
            color: "bg-red-50 text-red-700"
        },
        {
            title: "Total Loans",
            value: dashboardData?.totalLoans ?? 0,
            icon: "🏦",
            color: "bg-indigo-50 text-indigo-700"
        },
        {
            title: "Active Loans",
            value: dashboardData?.activeLoans ?? 0,
            icon: "✓",
            color: "bg-teal-50 text-teal-700"
        },
        {
            title: "Outstanding Amount",
            value: `PKR ${Number(
                dashboardData?.totalOutstandingAmount ?? 0
            ).toLocaleString("en-PK")}`,
            icon: "💰",
            color: "bg-orange-50 text-orange-700"
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
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="font-medium text-red-700">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
                                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">

                                    <p className="text-sm font-medium text-gray-500">
                                        {card.title}
                                    </p>

                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${card.color}`}
                                    >
                                        {card.icon}
                                    </div>

                                </div>

                                <h2 className="mt-5 break-words text-2xl font-bold text-gray-900">
                                    {card.value}
                                </h2>
                            </div>
                        ))}

                    </div>

                    {/* Welcome Section */}
                    <div className="mt-7 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

                        <h2 className="text-lg font-bold text-gray-900">
                            Welcome to Loan Management System
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
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
