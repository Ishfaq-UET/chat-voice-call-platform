import { IconArrowLeft, IconPhone } from '@/Components/Admin/AdminIcons';
import AdminPersonCell from '@/Components/Admin/AdminPersonCell';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

type CallDetail = {
    id: number;
    status: string;
    type?: string;
    agora_channel?: string | null;
    rate_per_minute: number | string;
    duration_seconds: number | null;
    total_charged: number | string;
    commission_amount: number | string;
    started_at?: string | null;
    answered_at?: string | null;
    ended_at?: string | null;
    created_at: string;
    male: { id: number; name: string; email: string; avatar_url?: string | null };
    female: { id: number; name: string; email: string; avatar_url?: string | null };
};

function formatDuration(seconds: number | null | undefined) {
    const s = Number(seconds ?? 0);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m} min ${rem} sec`;
}

export default function AdminCallShow({ call }: PageProps<{ call: CallDetail }>) {
    const rows = [
        ['Status', call.status],
        ['Type', call.type ?? 'audio'],
        ['Duration', formatDuration(call.duration_seconds)],
        ['Rate / minute', `$${Number(call.rate_per_minute).toFixed(2)}`],
        ['Total charged', `$${Number(call.total_charged ?? 0).toFixed(2)}`],
        ['Platform commission', `$${Number(call.commission_amount ?? 0).toFixed(2)}`],
        ['Creator earning', `$${(Number(call.total_charged ?? 0) - Number(call.commission_amount ?? 0)).toFixed(2)}`],
        ['Agora channel', call.agora_channel || '—'],
        ['Answered', call.answered_at ? new Date(call.answered_at).toLocaleString() : '—'],
        ['Started', call.started_at ? new Date(call.started_at).toLocaleString() : '—'],
        ['Ended', call.ended_at ? new Date(call.ended_at).toLocaleString() : '—'],
        ['Created', new Date(call.created_at).toLocaleString()],
    ] as const;

    return (
        <AdminLayout header={`Call #${call.id}`}>
            <Head title={`Call #${call.id}`} />
            <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 lg:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                                <IconPhone />
                            </span>
                            Call #{call.id}
                        </h1>
                        <p className="mt-1.5 text-sm text-slate-500">Full call billing and participant details.</p>
                    </div>
                    <Link href={route('admin.calls')} className="btn-ghost self-start px-4 py-2.5">
                        <IconArrowLeft />
                        Back to Calls
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {[call.male, call.female].map((person, i) => (
                        <div key={person.id} className="card-soft p-5">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                {i === 0 ? 'Member' : 'Creator'}
                            </p>
                            <div className="mt-3">
                                <AdminPersonCell
                                    name={person.name}
                                    email={person.email}
                                    avatarUrl={person.avatar_url}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card-soft overflow-hidden">
                    <dl className="divide-y divide-brand/10">
                        {rows.map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
                                <dt className="text-sm font-semibold text-slate-500">{label}</dt>
                                <dd className="text-sm font-bold capitalize text-ink">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </AdminLayout>
    );
}
