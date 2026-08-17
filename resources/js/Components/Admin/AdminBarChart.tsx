type BarPoint = {
    label: string;
    values: number[];
};

const COLORS = ['#635bff', '#22c55e', '#f59e0b'];

export default function AdminBarChart({
    series,
    points,
}: {
    series: string[];
    points: BarPoint[];
}) {
    const maxes = series.map((_, s) => Math.max(1, ...points.map((p) => p.values[s] ?? 0)));
    const groupWidth = 28;
    const gap = 18;
    const width = Math.max(280, points.length * (groupWidth + gap) + 20);
    const height = 160;
    const chartH = 120;
    const barW = Math.max(6, Math.floor((groupWidth - 4) / Math.max(1, series.length)));

    return (
        <div>
            <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full" role="img">
                {points.map((point, i) => {
                    const x0 = 12 + i * (groupWidth + gap);
                    return (
                        <g key={point.label}>
                            {point.values.map((value, s) => {
                                const h = (value / maxes[s]) * chartH;
                                const x = x0 + s * (barW + 2);
                                const y = chartH - h + 8;
                                return (
                                    <rect
                                        key={`${point.label}-${s}`}
                                        x={x}
                                        y={y}
                                        width={barW}
                                        height={Math.max(h, value > 0 ? 3 : 0)}
                                        rx="3"
                                        fill={COLORS[s % COLORS.length]}
                                    />
                                );
                            })}
                            <text
                                x={x0 + groupWidth / 2}
                                y={height - 6}
                                textAnchor="middle"
                                className="fill-slate-400"
                                fontSize="10"
                                fontWeight="700"
                            >
                                {point.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <div className="mt-2 flex flex-wrap gap-3">
                {series.map((name, i) => (
                    <span key={name} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        {name}
                    </span>
                ))}
            </div>
        </div>
    );
}
