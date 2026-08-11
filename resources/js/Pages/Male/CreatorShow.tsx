import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FemaleProfile, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

type Creator = {
    id: number;
    name: string;
    bio?: string | null;
    avatar_url?: string | null;
    is_online?: boolean;
    online_at?: string | null;
    verification_status?: string;
    created_at?: string;
    female_profile?: FemaleProfile | null;
};

export default function CreatorShow({
    creator,
    walletBalance,
}: PageProps<{ creator: Creator; walletBalance: number }>) {
    const profile = creator.female_profile;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-3">
                    <Link href={route('home')} className="text-sm font-medium text-slate-500 hover:text-ink">
                        ← Back to Discover
                    </Link>
                    <p className="text-sm font-semibold text-coral">Balance ${Number(walletBalance).toFixed(2)}</p>
                </div>
            }
        >
            <Head title={creator.name} />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                    <div className="grid md:grid-cols-2">
                        <div className="relative aspect-[4/5] bg-slate-100 md:aspect-auto md:min-h-[520px]">
                            {creator.avatar_url ? (
                                <img
                                    src={creator.avatar_url}
                                    alt={creator.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full min-h-[320px] items-center justify-center bg-gradient-to-br from-rose-100 to-slate-100 font-display text-7xl font-bold text-coral">
                                    {creator.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-between p-6 sm:p-8">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                            creator.is_online
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        {creator.is_online ? 'Online now' : 'Offline'}
                                    </span>
                                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-coral">
                                        Face verified
                                    </span>
                                </div>

                                <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
                                    {creator.name}
                                </h1>
                                <p className="mt-4 text-base leading-relaxed text-slate-600">
                                    {creator.bio || 'This creator hasn’t written a bio yet.'}
                                </p>

                                <div className="mt-8 grid grid-cols-3 gap-3">
                                    {[
                                        ['Chat msg', profile?.chat_price],
                                        ['Voice note', profile?.voice_price],
                                        ['Call / min', profile?.call_price_per_minute],
                                    ].map(([label, price]) => (
                                        <div key={String(label)} className="rounded-2xl bg-slate-50 p-4 text-center">
                                            <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                                {label}
                                            </p>
                                            <p className="mt-1 font-display text-xl font-bold text-ink">
                                                ${Number(price ?? 0).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <dl className="mt-8 space-y-2 text-sm text-slate-500">
                                    <div className="flex justify-between gap-4 border-b border-slate-100 py-2">
                                        <dt>Status</dt>
                                        <dd className="font-medium text-ink">
                                            {creator.is_online ? 'Available' : 'Away'}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-4 border-b border-slate-100 py-2">
                                        <dt>Member since</dt>
                                        <dd className="font-medium text-ink">{creator.created_at ?? '—'}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4 py-2">
                                        <dt>Verification</dt>
                                        <dd className="font-medium capitalize text-ink">
                                            {creator.verification_status}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href={route('chat.start', creator.id)}
                                    method="post"
                                    as="button"
                                    className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white hover:bg-coral-deep"
                                >
                                    Start chat
                                </Link>
                                <Link
                                    href={route('calls.start', creator.id)}
                                    method="post"
                                    data={{ type: 'audio' }}
                                    as="button"
                                    className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink-soft"
                                >
                                    Voice call
                                </Link>
                                <Link
                                    href={route('calls.start', creator.id)}
                                    method="post"
                                    data={{ type: 'video' }}
                                    as="button"
                                    className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
                                >
                                    Video call
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
