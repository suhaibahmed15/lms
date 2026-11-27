import { TrendingUp, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function MetricGauges({
    recoveryRate = 0,
    approvalRate = 0,
    activeCount = 0,
    closedCount = 0
}) {
    const totalLoans = activeCount + closedCount;
    const closedPercentage = totalLoans > 0 ? ((closedCount / totalLoans) * 100).toFixed(0) : 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Capital Recovery Rate */}
            <div className="rounded-3xl border border-pink-200/80 bg-white p-5 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider">
                    <span>Recovery Rate</span>
                    <TrendingUp size={16} className="text-pink-600" />
                </div>
                <div className="my-2">
                    <span className="text-2xl font-black text-pink-600 font-mono">
                        {recoveryRate.toFixed(1)}%
                    </span>
                    <p className="text-xs text-zinc-500 mt-0.5 font-medium">Capital collected vs disbursed</p>
                </div>
                <div className="w-full bg-pink-100 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(recoveryRate, 100)}%` }}
                    />
                </div>
            </div>

            {/* Approval Rate */}
            <div className="rounded-3xl border border-pink-200/80 bg-white p-5 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider">
                    <span>Approval Ratio</span>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <div className="my-2">
                    <span className="text-2xl font-black text-zinc-900 font-mono">
                        {approvalRate.toFixed(1)}%
                    </span>
                    <p className="text-xs text-zinc-500 mt-0.5 font-medium">Approved vs submitted cases</p>
                </div>
                <div className="w-full bg-pink-100 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(approvalRate, 100)}%` }}
                    />
                </div>
            </div>

            {/* Loan Closure Rate */}
            <div className="rounded-3xl border border-pink-200/80 bg-white p-5 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider">
                    <span>Portfolio Resolution</span>
                    <ShieldCheck size={16} className="text-pink-600" />
                </div>
                <div className="my-2">
                    <span className="text-2xl font-black text-zinc-900 font-mono">
                        {closedPercentage}%
                    </span>
                    <p className="text-xs text-zinc-500 mt-0.5 font-medium">{closedCount} closed / {activeCount} active</p>
                </div>
                <div className="w-full bg-pink-100 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-pink-500 to-rose-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(Number(closedPercentage), 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
