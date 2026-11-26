import { UserCheck, CheckCircle2 } from "lucide-react";

export default function OfficerWorkloadTable({ workload = [] }) {
    if (!workload || workload.length === 0) return null;

    return (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-xl shadow-black/40 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <UserCheck size={18} className="text-pink-400" />
                        Loan Officer Performance & Workload
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Assigned applications and review throughput by officer.
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            <th className="pb-3">Officer</th>
                            <th className="pb-3 text-center">Assigned</th>
                            <th className="pb-3 text-center">Reviewed</th>
                            <th className="pb-3 text-right">Completion Rate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {workload.map((item) => {
                            const percentage = item.assignedApplications > 0
                                ? Math.min(Math.round((item.reviewedApplications / item.assignedApplications) * 100), 100)
                                : 0;

                            return (
                                <tr key={item.officerId} className="transition hover:bg-white/[0.02]">
                                    <td className="py-3 font-medium text-white">
                                        {item.officerName || `Officer #${item.officerId}`}
                                    </td>
                                    <td className="py-3 text-center font-mono text-zinc-300">
                                        {item.assignedApplications}
                                    </td>
                                    <td className="py-3 text-center font-mono font-semibold text-emerald-400">
                                        {item.reviewedApplications}
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-24 bg-white/5 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 h-full rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-mono font-bold text-white w-10 text-right">
                                                {percentage}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
