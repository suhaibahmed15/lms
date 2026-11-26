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
        { label: "Disbursed Capital", value: Number(disbursed) || 0, color: "from-pink-600 via-pink-500 to-rose-400", barBg: "bg-pink-500" },
        { label: "Outstanding Balance", value: Number(outstanding) || 0, color: "from-neutral-600 via-neutral-400 to-white", barBg: "bg-neutral-400" },
        { label: "Collected Repayments", value: Number(collected) || 0, color: "from-pink-500 to-pink-300", barBg: "bg-pink-400" }
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
                                <span className="font-medium text-zinc-300">{item.label}</span>
                                <span className="font-bold text-white font-mono">
                                    PKR {formatAmount(item.value)}
                                </span>
                            </div>

                            <div className="h-4 w-full rounded-full bg-white/[0.05] overflow-hidden p-0.5 border border-white/5">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700 ease-out`}
                                    style={{ width: `${Math.max(percentage, 2)}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-zinc-500">
                <span>0 PKR</span>
                <span>Peak: PKR {formatAmount(maxValue)}</span>
            </div>
        </div>
    );
}
