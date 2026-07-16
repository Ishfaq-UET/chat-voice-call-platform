import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Head, Link } from '@inertiajs/react';

type Conversation = {
    id: number;
    last_message_at?: string | null;
    male: User;
    female: User;
    messages?: { body?: string | null; type: string }[];
};

export default function ChatIndex({
    conversations,
    auth,
}: PageProps<{ conversations: Conversation[] }>) {
    const user = auth.user!;

    return (
        <AuthenticatedLayout>
            <Head title="Chat" />
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                <h1 className="text-3xl font-extrabold text-ink">Messages</h1>
                <p className="mt-1 text-sm text-slate-500">Your conversations with creators and members</p>

                <div className="card-soft mt-6 divide-y divide-brand/5 overflow-hidden">
                    {conversations.map((c) => {
                        const other = user.role === 'male' ? c.female : c.male;
                        const last = c.messages?.[0];
                        return (
                            <Link
                                key={c.id}
                                href={route('chat.show', c.id)}
                                className="flex items-center gap-3 px-4 py-4 transition hover:bg-brand-soft/40"
                            >
                                <div className="relative">
                                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-brand-soft font-extrabold text-brand">
                                        {other.avatar_url ? (
                                            <img
                                                src={other.avatar_url}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            other.name.charAt(0)
                                        )}
                                    </div>
                                    {other.is_online && (
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between gap-2">
                                        <p className="font-extrabold text-ink">{other.name}</p>
                                        <p className="text-xs font-medium text-slate-400">
                                            {c.last_message_at
                                                ? new Date(c.last_message_at).toLocaleString()
                                                : ''}
                                        </p>
                                    </div>
                                    <p className="truncate text-sm text-slate-500">
                                        {last?.type === 'voice'
                                            ? 'Voice message'
                                            : last?.type === 'image'
                                              ? 'Photo'
                                              : last?.body || 'No messages yet'}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                    {conversations.length === 0 && (
                        <p className="px-4 py-12 text-center text-slate-500">No conversations yet.</p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
