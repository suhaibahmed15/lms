import { useState } from "react";

export default function StatusDonutChart({ data = [], total = 0 }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const radius = 70;
    const strokeWidth = 22;
    const circumference = 2 * Math.PI * radius;

    let accumulatedAngle = 0;

    const validTotal = total > 0 ? total : data.reduce((acc, d) => acc + (d.value || 0), 0);

    return (
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between p-2">
            <div className="relative flex items-center justify-center shrink-0">
                <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="transparent"
                        stroke="#fce7f3"
                        strokeWidth={strokeWidth}
                    />

                    {validTotal > 0 && data.map((item, idx) => {
                        const sliceFraction = item.value / validTotal;
                        const dashLength = sliceFraction * circumference;
                        const dashOffset = -accumulatedAngle;
                        accumulatedAngle += dashLength;

                        const isHovered = hoveredIndex === idx;

                        return (
                            <circle
                                key={item.label}
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                                strokeDasharray={`${dashLength} ${circumference}`}
                                strokeDashoffset={dashOffset}
                                className="transition-all duration-300 cursor-pointer"
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                        );
                    })}
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-2xl font-black text-zinc-900 font-mono">
                        {hoveredIndex !== null ? data[hoveredIndex].value : validTotal}
                    </span>
                    <span className="text-xs text-zinc-500 font-semibold">
                        {hoveredIndex !== null ? data[hoveredIndex].label : "Applications"}
                    </span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex-1 w-full space-y-2">
                {data.map((item, idx) => {
                    const percentage = validTotal > 0 ? ((item.value / validTotal) * 100).toFixed(1) : "0.0";
                    const isHovered = hoveredIndex === idx;

                    return (
                        <div
                            key={item.label}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className={`flex items-center justify-between p-2.5 rounded-2xl transition cursor-pointer ${
                                isHovered ? "bg-pink-100/60" : "hover:bg-pink-50"
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <span
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-semibold text-zinc-700">{item.label}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-zinc-900 font-mono">{item.value}</span>
                                <span className="text-xs text-zinc-500 font-mono font-medium w-12 text-right">{percentage}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
