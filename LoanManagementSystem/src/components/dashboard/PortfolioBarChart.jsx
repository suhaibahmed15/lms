const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

export default function PortfolioBarChart({
    disbursed = 0,
    outstanding = 0,
    collected = 0
}) {
    const values = [
        { label: "Disbursed Capital", value: Number(disbursed) || 0, color: "from-pink-500 via-rose-500 to-pink-600", barBg: "bg-pink-500" },
        { label: "Outstanding Balance", value: Number(outstanding) || 0, color: "from-rose-400 to-rose-600", barBg: "bg-rose-500" },
        { label: "Collected Repayments", value: Number(collected) || 0, color: "from-emerald-400 to-emerald-600", barBg: "bg-emerald-500" }
    ];

    const maxValue = Math.max(...values.map((v) => v.value), 1);

    return (
        <div className="space-y-4 p-2">
            <div className="space-y-4">
                {values.map((item) => {
                    const percentage = Math.min(Math.round((item.value / maxValue) * 100), 100);

                    return (
                        <div key={item.label} className="space-y-1.5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-zinc-700">{item.label}</span>
                                <span className="font-bold text-zinc-900 font-mono">
                                    PKR {formatAmount(item.value)}
                                </span>
                            </div>

                            <div className="h-4 w-full rounded-full bg-pink-100 overflow-hidden p-0.5 border border-pink-200">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700 ease-out`}
                                    style={{ width: `${Math.max(percentage, 2)}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-2 border-t border-pink-100 flex justify-between text-xs text-zinc-500 font-medium">
                <span>0 PKR</span>
                <span>Peak: PKR {formatAmount(maxValue)}</span>
            </div>
        </div>
    );
}
