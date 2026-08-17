import AdminPageBanner from '@/Components/Admin/AdminPageBanner';
import { AdminField, AdminInput, AdminSelect } from '@/Components/Admin/AdminField';
import { IconActivity, IconClock, IconPhone, IconSearch, IconWallet } from '@/Components/Admin/AdminIcons';
import AdminPersonCell from '@/Components/Admin/AdminPersonCell';
import AdminStatCard from '@/Components/Admin/AdminStatCard';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps, Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type CallRow = {
    id: number;
    status: string;
    type?: string;
    rate_per_minute: number | string;
    duration_seconds: number | null;
    total_charged: number | string;
    commission_amount: number | string;
    started_at?: string | null;
    ended_at?: string | null;
    created_at: string;
    male: { id: number; name: string; email: string; avatar_url?: string | null };
    female: { id: number; name: string; email: string; avatar_url?: string | null };
};

function formatDuration(seconds: number | null | undefined) {
    const s = Number(seconds ?? 0);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}m ${rem}s`;
}

export default function AdminCallsIndex({
    calls,
    filters,
    summary,
}: PageProps<{
    calls: Paginated<CallRow>;
    filters: { status?: string; q?: string };
    summary: {
        total: number;
        active: number;
        ringing: number;
        total_minutes: number;
        total_charged: number;
        total_commission: number;
    };
}>) {
    const [q, setQ] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const search = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('admin.calls'), { q: q || undefined, status: status || undefined }, { preserveState: true });
    };

    return (
        <AdminLayout header="Calls">
            <Head title="Admin Calls" />
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 lg:px-6">
                <AdminPageBanner
                    eyebrow={
                        <>
                            <IconPhone />
                            Voice calls
                        </>
                    }
                    title="Calls"
                    description="Monitor audio and video calls with Agora channel, duration, and payments."
                    meta={`${summary.total} calls · ${summary.total_minutes} min billed · $${Number(summary.total_charged).toFixed(2)} charged`}
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminStatCard label="Total calls" value={summary.total} icon={IconPhone} />
                    <AdminStatCard
                        label="Live / ringing"
                        value={summary.active + summary.ringing}
                        icon={IconActivity}
                        tone="bg-emerald-50 text-emerald-700"
                    />
                    <AdminStatCard
                        label="Total minutes"
                        value={summary.total_minutes}
                        icon={IconClock}
                        tone="bg-sky-50 text-sky-700"
                    />
                    <AdminStatCard
                        label="Commission"
                        value={`$${Number(summary.total_commission).toFixed(2)}`}
                        icon={IconWallet}
                        tone="bg-amber-50 text-amber-700"
                    />
                </div>

                <div className="overflow-hidden rounded-[28px] border border-brand/10 bg-white shadow-card">
                    <form onSubmit={search} className="grid gap-3 border-b border-brand/10 px-5 py-5 sm:grid-cols-[1fr_180px_auto] sm:px-6">
                        <AdminField label="Search users">
                            <AdminInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Member or creator name/email..." />
                        </AdminField>
                        <AdminField label="Status">
                            <AdminSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">All statuses</option>
                                <option value="ringing">Ringing</option>
                                <option value="active">Active</option>
                                <option value="ended">Ended</option>
                                <option value="rejected">Rejected</option>
                                <option value="missed">Missed</option>
                                <option value="failed">Failed</option>
                            </AdminSelect>
                        </AdminField>
                        <div className="flex items-end">
                            <button type="submit" className="btn-brand w-full px-5 py-2.5 lg:w-auto">
                                <IconSearch className="me-2" />
                                Filter
                            </button>
                        </div>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-brand/10 bg-canvas text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                    <th className="px-5 py-3.5">Call</th>
                                    <th className="px-5 py-3.5">Type</th>
                                    <th className="px-5 py-3.5">Member</th>
                                    <th className="px-5 py-3.5">Creator</th>
                                    <th className="px-5 py-3.5">Duration</th>
                                    <th className="px-5 py-3.5">Charged</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand/10">
                                {calls.data.map((call) => (
                                    <tr key={call.id} className="hover:bg-brand-soft/40">
                                        <td className="px-5 py-4 font-semibold text-ink">#{call.id}</td>
                                        <td className="px-5 py-4 capitalize text-slate-700">{call.type ?? 'audio'}</td>
                                        <td className="px-5 py-4">
                                            <AdminPersonCell
                                                name={call.male.name}
                                                email={call.male.email}
                                                avatarUrl={call.male.avatar_url}
                                                size="sm"
                                            />
                                        </td>
                                        <td className="px-5 py-4">
                                            <AdminPersonCell
                                                name={call.female.name}
                                                email={call.female.email}
                                                avatarUrl={call.female.avatar_url}
                                                size="sm"
                                            />
                                        </td>
                                        <td className="px-5 py-4 text-slate-700">{formatDuration(call.duration_seconds)}</td>
                                        <td className="px-5 py-4 font-semibold text-ink">
                                            ${Number(call.total_charged ?? 0).toFixed(2)}
                                            <div className="text-xs font-normal text-slate-400">
                                                rate ${Number(call.rate_per_minute).toFixed(2)}/min
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="chip bg-brand-soft text-brand capitalize">{call.status}</span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <Link href={route('admin.calls.show', call.id)} className="font-bold text-brand hover:underline">
                                                Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {calls.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                                            No calls found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
