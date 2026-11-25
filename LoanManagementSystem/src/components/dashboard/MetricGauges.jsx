import { ArrowUpRight, TrendingUp, ShieldCheck, CheckCircle2 } from "lucide-react";

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
            <div className="rounded-2xl border border-white/10 bg-[#141414] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Recovery Rate</span>
                    <TrendingUp size={16} className="text-emerald-400" />
                </div>
                <div className="my-2">
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                        {recoveryRate.toFixed(1)}%
                    </span>
                    <p className="text-xs text-zinc-500 mt-0.5">Capital collected vs disbursed</p>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(recoveryRate, 100)}%` }}
                    />
                </div>
            </div>

            {/* Approval Rate */}
            <div className="rounded-2xl border border-white/10 bg-[#141414] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Approval Ratio</span>
                    <CheckCircle2 size={16} className="text-blue-400" />
                </div>
                <div className="my-2">
                    <span className="text-2xl font-extrabold text-blue-400 font-mono">
                        {approvalRate.toFixed(1)}%
                    </span>
                    <p className="text-xs text-zinc-500 mt-0.5">Approved vs submitted cases</p>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(approvalRate, 100)}%` }}
                    />
                </div>
            </div>

            {/* Loan Closure Rate */}
            <div className="rounded-2xl border border-white/10 bg-[#141414] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Portfolio Resolution</span>
                    <ShieldCheck size={16} className="text-orange-400" />
                </div>
                <div className="my-2">
                    <span className="text-2xl font-extrabold text-white font-mono">
                        {closedPercentage}%
                    </span>
                    <p className="text-xs text-zinc-500 mt-0.5">{closedCount} closed / {activeCount} active</p>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="bg-orange-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(Number(closedPercentage), 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
