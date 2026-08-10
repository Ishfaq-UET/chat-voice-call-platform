import { AdminSelect } from '@/Components/Admin/AdminField';
import { IconArrowLeft, IconChat } from '@/Components/Admin/AdminIcons';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps, Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

type MessageRow = {
    id: number;
    type: string;
    body?: string | null;
    media_url?: string | null;
    amount_charged?: number | string | null;
    commission_amount?: number | string | null;
    created_at: string;
    sender: { id: number; name: string; role: string };
};

type ConversationDetail = {
    id: number;
    male: { id: number; name: string; email: string };
    female: { id: number; name: string; email: string };
    totals: { messages: number; charged: number; commission: number };
};

export default function AdminChatShow({
    conversation,
    messages,
    filters,
}: PageProps<{
    conversation: ConversationDetail;
    messages: Paginated<MessageRow>;
    filters: { type?: string };
}>) {
    return (
        <AdminLayout header={`Chat #${conversation.id}`}>
            <Head title={`Chat #${conversation.id}`} />
            <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 lg:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                                <IconChat />
                            </span>
                            {conversation.male.name} ↔ {conversation.female.name}
                        </h1>
                        <p className="mt-1.5 text-sm text-slate-500">
                            {conversation.totals.messages} messages · ${Number(conversation.totals.charged).toFixed(2)}{' '}
                            charged · ${Number(conversation.totals.commission).toFixed(2)} commission
                        </p>
                    </div>
                    <Link href={route('admin.chats')} className="btn-ghost self-start px-4 py-2.5">
                        <IconArrowLeft />
                        Back to Chats
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-sm font-bold text-slate-600">Filter type</label>
                    <AdminSelect
                        className="max-w-xs"
                        value={filters.type ?? ''}
                        onChange={(e) =>
                            router.get(
                                route('admin.chats.show', conversation.id),
                                { type: e.target.value || undefined },
                                { preserveState: true },
                            )
                        }
                    >
                        <option value="">All</option>
                        <option value="text">Text</option>
                        <option value="voice">Voice</option>
                        <option value="image">Image</option>
                    </AdminSelect>
                </div>

                <div className="space-y-3">
                    {messages.data.map((m) => (
                        <div key={m.id} className="card-soft p-4">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <p className="font-bold text-ink">
                                        {m.sender.name}{' '}
                                        <span className="text-xs font-semibold capitalize text-slate-400">
                                            ({m.sender.role}) · {m.type}
                                        </span>
                                    </p>
                                    <p className="text-xs text-slate-400">{new Date(m.created_at).toLocaleString()}</p>
                                </div>
                                <div className="text-right text-sm">
                                    <p className="font-semibold text-ink">${Number(m.amount_charged ?? 0).toFixed(2)}</p>
                                    <p className="text-xs text-slate-400">
                                        fee · ${Number(m.commission_amount ?? 0).toFixed(2)} commission
                                    </p>
                                </div>
                            </div>

                            {m.type === 'text' && m.body && (
                                <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-canvas px-4 py-3 text-sm text-slate-700">
                                    {m.body}
                                </p>
                            )}

                            {m.type === 'voice' && m.media_url && (
                                <audio controls className="mt-3 w-full max-w-md" src={m.media_url}>
                                    Your browser does not support audio.
                                </audio>
                            )}

                            {m.type === 'image' && m.media_url && (
                                <img
                                    src={m.media_url}
                                    alt="Chat image"
                                    className="mt-3 max-h-64 rounded-2xl object-cover ring-1 ring-brand/10"
                                />
                            )}
                        </div>
                    ))}

                    {messages.data.length === 0 && (
                        <div className="rounded-[28px] border border-dashed border-brand/20 bg-white px-6 py-16 text-center text-slate-500">
                            No messages in this filter.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
