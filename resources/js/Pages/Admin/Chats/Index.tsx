import AdminPageBanner from '@/Components/Admin/AdminPageBanner';
import { AdminField, AdminInput } from '@/Components/Admin/AdminField';
import { IconChat, IconImage, IconMic, IconSearch } from '@/Components/Admin/AdminIcons';
import AdminPersonCell from '@/Components/Admin/AdminPersonCell';
import AdminStatCard from '@/Components/Admin/AdminStatCard';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps, Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type ConversationRow = {
    id: number;
    last_message_at?: string | null;
    messages_count: number;
    voice_count: number;
    image_count: number;
    text_count: number;
    total_charged?: number | string | null;
    total_commission?: number | string | null;
    male: { id: number; name: string; email: string; avatar_url?: string | null };
    female: { id: number; name: string; email: string; avatar_url?: string | null };
};

export default function AdminChatsIndex({
    conversations,
    filters,
    summary,
}: PageProps<{
    conversations: Paginated<ConversationRow>;
    filters: { q?: string };
    summary: {
        conversations: number;
        messages: number;
        voice_notes: number;
        images: number;
        chat_revenue: number;
    };
}>) {
    const [q, setQ] = useState(filters.q ?? '');

    const search = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('admin.chats'), { q: q || undefined }, { preserveState: true });
    };

    return (
        <AdminLayout header="Chats & voices">
            <Head title="Admin Chats" />
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 lg:px-6">
                <AdminPageBanner
                    eyebrow={
                        <>
                            <IconChat />
                            Messaging
                        </>
                    }
                    title="Chats & voices"
                    description="Browse every conversation, including text, voice notes, and images with charges."
                    meta={`${summary.conversations} chats · ${summary.voice_notes} voice notes · $${Number(summary.chat_revenue).toFixed(2)} charged`}
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminStatCard label="Conversations" value={summary.conversations} icon={IconChat} />
                    <AdminStatCard label="Messages" value={summary.messages} icon={IconChat} tone="bg-sky-50 text-sky-700" />
                    <AdminStatCard label="Voice notes" value={summary.voice_notes} icon={IconMic} tone="bg-fuchsia-50 text-fuchsia-700" />
                    <AdminStatCard label="Images" value={summary.images} icon={IconImage} tone="bg-amber-50 text-amber-700" />
                </div>

                <div className="overflow-hidden rounded-[28px] border border-brand/10 bg-white shadow-card">
                    <form onSubmit={search} className="flex flex-col gap-3 border-b border-brand/10 px-5 py-5 sm:flex-row sm:items-end sm:px-6">
                        <div className="min-w-0 flex-1">
                            <AdminField label="Search users">
                                <AdminInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Member or creator..." />
                            </AdminField>
                        </div>
                        <button type="submit" className="btn-brand px-5 py-2.5">
                            <IconSearch className="me-2" />
                            Search
                        </button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-brand/10 bg-canvas text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                    <th className="px-5 py-3.5">Member</th>
                                    <th className="px-5 py-3.5">Creator</th>
                                    <th className="px-5 py-3.5">Messages</th>
                                    <th className="px-5 py-3.5">Charged</th>
                                    <th className="px-5 py-3.5">Last activity</th>
                                    <th className="px-5 py-3.5 text-right">Open</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand/10">
                                {conversations.data.map((c) => (
                                    <tr key={c.id} className="hover:bg-brand-soft/40">
                                        <td className="px-5 py-4">
                                            <AdminPersonCell
                                                name={c.male.name}
                                                email={c.male.email}
                                                avatarUrl={c.male.avatar_url}
                                                size="sm"
                                            />
                                        </td>
                                        <td className="px-5 py-4">
                                            <AdminPersonCell
                                                name={c.female.name}
                                                email={c.female.email}
                                                avatarUrl={c.female.avatar_url}
                                                size="sm"
                                            />
                                        </td>
                                        <td className="px-5 py-4 text-slate-700">
                                            {c.messages_count}
                                            <div className="text-xs text-slate-400">
                                                {c.text_count} text · {c.voice_count} voice · {c.image_count} image
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-ink">
                                            ${Number(c.total_charged ?? 0).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {c.last_message_at ? new Date(c.last_message_at).toLocaleString() : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <Link href={route('admin.chats.show', c.id)} className="font-bold text-brand hover:underline">
                                                View chat
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {conversations.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                                            No conversations found.
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
