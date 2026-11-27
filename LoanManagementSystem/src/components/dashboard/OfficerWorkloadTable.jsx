import { UserCheck } from "lucide-react";

export default function OfficerWorkloadTable({ workload = [] }) {
    if (!workload || workload.length === 0) return null;

    return (
        <div className="rounded-3xl border border-pink-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                        <UserCheck size={18} className="text-pink-600" />
                        Loan Officer Performance & Workload
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                        Assigned applications and review throughput by officer.
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-pink-100 text-xs font-bold uppercase tracking-wider text-pink-900">
                            <th className="pb-3">Officer</th>
                            <th className="pb-3 text-center">Assigned</th>
                            <th className="pb-3 text-center">Reviewed</th>
                            <th className="pb-3 text-right">Completion Rate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                        {workload.map((item) => {
                            const percentage = item.assignedApplications > 0
                                ? Math.min(Math.round((item.reviewedApplications / item.assignedApplications) * 100), 100)
                                : 0;

                            return (
                                <tr key={item.officerId} className="transition hover:bg-pink-50/50">
                                    <td className="py-3 font-semibold text-zinc-900">
                                        {item.officerName || `Officer #${item.officerId}`}
                                    </td>
                                    <td className="py-3 text-center font-mono text-zinc-700 font-medium">
                                        {item.assignedApplications}
                                    </td>
                                    <td className="py-3 text-center font-mono font-bold text-emerald-600">
                                        {item.reviewedApplications}
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-24 bg-pink-100 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 h-full rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-mono font-bold text-zinc-900 w-10 text-right">
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
