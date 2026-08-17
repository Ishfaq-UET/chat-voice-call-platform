import AdminPageBanner from '@/Components/Admin/AdminPageBanner';
import AdminAvatar from '@/Components/Admin/AdminAvatar';
import AdminBarChart from '@/Components/Admin/AdminBarChart';
import AdminPieChart from '@/Components/Admin/AdminPieChart';
import {
    IconActivity,
    IconChat,
    IconClock,
    IconLedger,
    IconMic,
    IconMoney,
    IconOverview,
    IconPhone,
    IconRename,
    IconShield,
    IconTopUp,
    IconUsers,
    IconWallet,
} from '@/Components/Admin/AdminIcons';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ComponentType, SVGProps } from 'react';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type RecentCall = {
    id: number;
    status: string;
    duration_seconds?: number | null;
    total_charged?: number | string | null;
    male?: { name: string; avatar_url?: string | null } | null;
    female?: { name: string; avatar_url?: string | null } | null;
};

type RecentMessage = {
    id: number;
    type: string;
    body?: string | null;
    amount_charged?: number | string | null;
    sender?: { name: string; role: string; avatar_url?: string | null } | null;
};

type ChartSlice = { label: string; value: number; color: string };

type ActivityPoint = { label: string; calls: number; messages: number; revenue: number };

export default function AdminDashboard({
    stats,
    charts,
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
    charts: {
        activity: ActivityPoint[];
        users: ChartSlice[];
        revenue: ChartSlice[];
    };
    recentCalls?: RecentCall[];
    recentMessages?: RecentMessage[];
}>) {
    const cards: { label: string; value: string | number; href: string; icon: IconType; tone: string }[] = [
        { label: 'Users', value: stats.users, href: route('admin.users'), icon: IconUsers, tone: 'bg-violet-50 text-brand' },
        { label: 'Pending verifications', value: stats.pending_verifications, href: route('admin.verifications'), icon: IconShield, tone: 'bg-amber-50 text-amber-700' },
        { label: 'Name change requests', value: stats.pending_name_changes, href: route('admin.name-changes'), icon: IconRename, tone: 'bg-sky-50 text-sky-700' },
        { label: 'Pending withdrawals', value: stats.pending_withdrawals, href: route('admin.withdrawals'), icon: IconWallet, tone: 'bg-rose-50 text-rose-600' },
        { label: 'Pending top-ups', value: stats.pending_top_ups ?? 0, href: route('admin.top-ups'), icon: IconTopUp, tone: 'bg-emerald-50 text-emerald-700' },
        { label: 'Conversations', value: stats.conversations, href: route('admin.chats'), icon: IconChat, tone: 'bg-violet-50 text-brand' },
        { label: 'Voice notes', value: stats.voice_notes, href: route('admin.chats'), icon: IconMic, tone: 'bg-fuchsia-50 text-fuchsia-700' },
        { label: 'Calls', value: stats.calls, href: route('admin.calls'), icon: IconPhone, tone: 'bg-sky-50 text-sky-700' },
        { label: 'Active / ringing', value: stats.active_calls, href: route('admin.calls'), icon: IconActivity, tone: 'bg-emerald-50 text-emerald-700' },
        { label: 'Gross revenue', value: `$${Number(stats.revenue).toFixed(2)}`, href: route('admin.transactions'), icon: IconMoney, tone: 'bg-violet-50 text-brand' },
        { label: 'Call revenue', value: `$${Number(stats.call_revenue).toFixed(2)}`, href: route('admin.calls'), icon: IconLedger, tone: 'bg-amber-50 text-amber-700' },
        { label: 'Commission', value: `$${Number(stats.commission).toFixed(2)}`, href: route('admin.transactions'), icon: IconWallet, tone: 'bg-emerald-50 text-emerald-700' },
        { label: 'Call minutes', value: stats.call_minutes, href: route('admin.calls'), icon: IconClock, tone: 'bg-slate-100 text-slate-600' },
    ];

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
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={card.label}
                                href={card.href}
                                className="card-soft p-5 transition hover:-translate-y-0.5 hover:shadow-soft"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                                    <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${card.tone}`}>
                                        <Icon />
                                    </span>
                                </div>
                                <p className="mt-3 text-2xl font-extrabold text-ink">{card.value}</p>
                            </Link>
                        );
                    })}
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="card-soft p-5 lg:col-span-2">
                        <h2 className="font-extrabold text-ink">Last 7 days</h2>
                        <p className="mt-1 text-sm text-slate-500">Calls, messages, and fee revenue by day.</p>
                        <div className="mt-4">
                            <AdminBarChart
                                series={['Calls', 'Messages', 'Revenue']}
                                points={charts.activity.map((d) => ({
                                    label: d.label,
                                    values: [d.calls, d.messages, d.revenue],
                                }))}
                            />
                        </div>
                    </div>
                    <div className="card-soft p-5">
                        <h2 className="font-extrabold text-ink">Users</h2>
                        <p className="mt-1 text-sm text-slate-500">Members vs creators.</p>
                        <div className="mt-4">
                            <AdminPieChart slices={charts.users} />
                        </div>
                    </div>
                </div>

                <div className="card-soft p-5">
                    <h2 className="font-extrabold text-ink">Revenue mix</h2>
                    <p className="mt-1 text-sm text-slate-500">Fees collected from chat, voice, calls, and images.</p>
                    <div className="mt-4 max-w-xl">
                        <AdminPieChart
                            slices={charts.revenue.map((s) => ({
                                ...s,
                                value: Number(s.value),
                            }))}
                            formatValue={(v) => `$${v.toFixed(2)}`}
                        />
                    </div>
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
                                        <div className="flex min-w-0 items-center gap-2">
                                            <AdminAvatar name={call.male?.name ?? 'M'} src={call.male?.avatar_url} size="sm" />
                                            <AdminAvatar name={call.female?.name ?? 'C'} src={call.female?.avatar_url} size="sm" />
                                            <p className="truncate text-sm font-bold text-ink">
                                                {call.male?.name} → {call.female?.name}
                                            </p>
                                        </div>
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
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <AdminAvatar
                                                name={msg.sender?.name ?? 'User'}
                                                src={msg.sender?.avatar_url}
                                                size="sm"
                                            />
                                            <p className="truncate text-sm font-bold text-ink">
                                                {msg.sender?.name}{' '}
                                                <span className="text-xs font-semibold capitalize text-slate-400">
                                                    · {msg.type}
                                                </span>
                                            </p>
                                        </div>
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
