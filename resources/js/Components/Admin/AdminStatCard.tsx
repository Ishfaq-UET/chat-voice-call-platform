import { ComponentType, ReactNode, SVGProps } from 'react';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export default function AdminStatCard({
    label,
    value,
    icon: Icon,
    tone = 'bg-violet-50 text-brand',
}: {
    label: string;
    value: ReactNode;
    icon: IconType;
    tone?: string;
}) {
    return (
        <div className="card-soft p-4">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${tone}`}>
                    <Icon />
                </span>
            </div>
            <p className="mt-2 text-xl font-extrabold text-ink">{value}</p>
        </div>
    );
}
