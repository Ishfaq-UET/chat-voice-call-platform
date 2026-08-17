type Slice = {
    label: string;
    value: number;
    color: string;
};

function polar(cx: number, cy: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
    const [x1, y1] = polar(cx, cy, r, end);
    const [x2, y2] = polar(cx, cy, r, start);
    const large = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2} L ${cx} ${cy} Z`;
}

export default function AdminPieChart({
    slices,
    formatValue,
}: {
    slices: Slice[];
    formatValue?: (value: number) => string;
}) {
    const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
    let cursor = 0;

    const paths = slices.map((slice) => {
        const angle = (slice.value / total) * 360;
        const start = cursor;
        const end = cursor + Math.max(angle, slice.value > 0 ? 0.8 : 0);
        cursor += angle;
        return { ...slice, start, end };
    });

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
            <svg viewBox="0 0 120 120" className="h-36 w-36 shrink-0" role="img">
                {total === 0 || slices.every((s) => s.value === 0) ? (
                    <circle cx="60" cy="60" r="48" fill="#eef2ff" />
                ) : (
                    paths.map((slice) => (
                        <path
                            key={slice.label}
                            d={arcPath(60, 60, 48, slice.start, slice.end)}
                            fill={slice.color}
                        />
                    ))
                )}
                <circle cx="60" cy="60" r="24" fill="white" />
            </svg>
            <div className="space-y-2">
                {slices.map((slice) => (
                    <div key={slice.label} className="flex items-center justify-between gap-6 text-sm">
                        <span className="inline-flex items-center gap-2 font-bold text-slate-600">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: slice.color }} />
                            {slice.label}
                        </span>
                        <span className="font-extrabold text-ink">
                            {formatValue ? formatValue(slice.value) : slice.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
