import AdminPageBanner from '@/Components/Admin/AdminPageBanner';
import { IconOverview } from '@/Components/Admin/AdminIcons';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

type RecentCall = {
    id: number;
    status: string;
    duration_seconds?: number | null;
    total_charged?: number | string | null;
    male?: { name: string } | null;
    female?: { name: string } | null;
};

type RecentMessage = {
    id: number;
    type: string;
    body?: string | null;
    amount_charged?: number | string | null;
    sender?: { name: string; role: string } | null;
};

export default function AdminDashboard({
    stats,
    recentCalls = [],
    recentMessages = [],
}: PageProps<{
    stats: {
        users: number;
        males: number;
        females: number;
        pending_verifications: number;
        pending_name_changes: number;
        pending_withdrawals: number;
        pending_top_ups: number;
        conversations: number;
        messages: number;
        voice_notes: number;
        calls: number;
        active_calls: number;
        revenue: number;
        commission: number;
        call_minutes: number;
        call_revenue: number;
    };
    recentCalls?: RecentCall[];
    recentMessages?: RecentMessage[];
}>) {
    const cards = [
        ['Users', stats.users, route('admin.users')],
        ['Pending verifications', stats.pending_verifications, route('admin.verifications')],
        ['Name change requests', stats.pending_name_changes, route('admin.name-changes')],
        ['Pending withdrawals', stats.pending_withdrawals, route('admin.withdrawals')],
        ['Pending top-ups', stats.pending_top_ups ?? 0, route('admin.top-ups')],
        ['Conversations', stats.conversations, route('admin.chats')],
        ['Voice notes', stats.voice_notes, route('admin.chats')],
        ['Calls', stats.calls, route('admin.calls')],
        ['Active / ringing', stats.active_calls, route('admin.calls')],
        ['Gross revenue', `$${Number(stats.revenue).toFixed(2)}`, route('admin.transactions')],
        ['Call revenue', `$${Number(stats.call_revenue).toFixed(2)}`, route('admin.calls')],
        ['Commission', `$${Number(stats.commission).toFixed(2)}`, route('admin.transactions')],
        ['Call minutes', stats.call_minutes, route('admin.calls')],
    ] as const;

    return (
        <AdminLayout header="Overview">
            <Head title="Admin" />
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 lg:px-6">
                <AdminPageBanner
                    eyebrow={
                        <>
                            <IconOverview />
                            Dashboard
                        </>
                    }
                    title="Overview"
                    description="Live snapshot of users, moderation queues, chats, calls, and money moving on the platform."
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map(([label, value, href]) => (
                        <Link key={label} href={href} className="card-soft p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
                            <p className="text-sm font-medium text-slate-500">{label}</p>
                            <p className="mt-2 text-2xl font-extrabold text-ink">{value}</p>
                        </Link>
                    ))}
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <div className="card-soft p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-extrabold text-ink">Recent calls</h2>
                            <Link href={route('admin.calls')} className="text-sm font-bold text-brand">
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentCalls.map((call) => (
                                <Link
                                    key={call.id}
                                    href={route('admin.calls.show', call.id)}
                                    className="block rounded-2xl bg-canvas px-4 py-3 transition hover:bg-brand-soft/50"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-bold text-ink">
                                            {call.male?.name} → {call.female?.name}
                                        </p>
                                        <span className="chip bg-white text-brand capitalize">{call.status}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        ${Number(call.total_charged ?? 0).toFixed(2)} ·{' '}
                                        {Math.floor(Number(call.duration_seconds ?? 0) / 60)}m
                                    </p>
                                </Link>
                            ))}
                            {recentCalls.length === 0 && <p className="text-sm text-slate-500">No calls yet.</p>}
                        </div>
                    </div>

                    <div className="card-soft p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-extrabold text-ink">Recent messages</h2>
                            <Link href={route('admin.chats')} className="text-sm font-bold text-brand">
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentMessages.map((msg) => (
                                <div key={msg.id} className="rounded-2xl bg-canvas px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-bold text-ink">
                                            {msg.sender?.name}{' '}
                                            <span className="text-xs font-semibold capitalize text-slate-400">
                                                · {msg.type}
                                            </span>
                                        </p>
                                        <span className="text-xs font-semibold text-slate-500">
                                            ${Number(msg.amount_charged ?? 0).toFixed(2)}
                                        </span>
                                    </div>
                                    {msg.type === 'text' && msg.body && (
                                        <p className="mt-1 truncate text-xs text-slate-500">{msg.body}</p>
                                    )}
                                </div>
                            ))}
                            {recentMessages.length === 0 && <p className="text-sm text-slate-500">No messages yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
