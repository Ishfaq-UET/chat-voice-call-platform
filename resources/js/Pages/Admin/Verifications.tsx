import AdminPageBanner from '@/Components/Admin/AdminPageBanner';
import { AdminInput } from '@/Components/Admin/AdminField';
import ImageLightbox from '@/Components/Admin/ImageLightbox';
import { IconShield } from '@/Components/Admin/AdminIcons';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps, Paginated, User } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type VerificationUser = User & {
    phone?: string | null;
    bio?: string | null;
    created_at?: string;
    online_at?: string | null;
    female_profile?: {
        chat_price?: number | string;
        voice_price?: number | string;
        call_price_per_minute?: number | string;
    } | null;
    wallet?: { balance?: number | string } | null;
};

type RequestItem = {
    id: number;
    status: string;
    selfie_url?: string | null;
    id_photo_url?: string | null;
    rejection_reason?: string | null;
    created_at: string;
    reviewed_at?: string | null;
    user: VerificationUser;
    reviewer?: { id: number; name: string } | null;
};

export default function AdminVerifications({
    requests,
    filters = { status: 'pending' },
    counts = { pending: 0, approved: 0, rejected: 0, all: 0 },
}: PageProps<{
    requests: Paginated<RequestItem>;
    filters?: { status?: string };
    counts?: { pending: number; approved: number; rejected: number; all: number };
}>) {
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);
    const rejectForm = useForm({ rejection_reason: '' });
    const status = filters.status ?? 'pending';

    const submitReject: FormEventHandler = (e) => {
        e.preventDefault();
        if (!rejectId) return;
        rejectForm.post(route('admin.verifications.reject', rejectId), {
            onSuccess: () => {
                setRejectId(null);
                rejectForm.reset();
            },
        });
    };

    return (
        <AdminLayout header="Verifications">
            <Head title="Verifications" />
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 lg:px-6">
                <AdminPageBanner
                    eyebrow={
                        <>
                            <IconShield />
                            Identity review
                        </>
                    }
                    title="Verifications"
                    description="Review creator face verification submissions and browse history."
                    meta={`${counts.pending} pending`}
                />

                <div className="flex flex-wrap gap-2">
                    {([
                        ['pending', counts.pending],
                        ['approved', counts.approved],
                        ['rejected', counts.rejected],
                        ['all', counts.all],
                    ] as const).map(([s, count]) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => router.get(route('admin.verifications'), { status: s }, { preserveState: true })}
                            className={`rounded-2xl px-4 py-2 text-sm font-bold capitalize transition ${
                                status === s ? 'bg-brand text-white' : 'bg-white text-slate-600 ring-1 ring-brand/10'
                            }`}
                        >
                            {s} ({count})
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {requests.data.map((item) => {
                        const profile = item.user.female_profile;
                        const walletBalance = Number(item.user.wallet?.balance ?? 0);

                        return (
                            <div key={item.id} className="card-soft p-5 sm:p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex min-w-0 gap-4">
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-brand-soft ring-1 ring-brand/10">
                                            {item.user.avatar_url ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setLightbox({ url: item.user.avatar_url!, label: 'Profile photo' })
                                                    }
                                                    className="h-full w-full"
                                                >
                                                    <img
                                                        src={item.user.avatar_url}
                                                        alt={item.user.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </button>
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-lg font-extrabold text-brand">
                                                    {item.user.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-base font-extrabold text-ink">{item.user.name}</p>
                                            <p className="text-sm text-slate-500">{item.user.email}</p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <span className="chip bg-brand-soft text-brand capitalize">{item.status}</span>
                                                <span className="chip bg-canvas text-slate-600 capitalize">
                                                    {item.user.role}
                                                </span>
                                                {item.user.is_banned && (
                                                    <span className="chip bg-rose-50 text-rose-600">Banned</span>
                                                )}
                                                {item.user.is_online && (
                                                    <span className="chip bg-emerald-50 text-emerald-700">Online</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Link
                                            href={route('admin.users.edit', item.user.id)}
                                            className="btn-ghost px-4 py-2"
                                        >
                                            Edit user
                                        </Link>
                                        {item.user.role === 'female' && (
                                            <Link
                                                href={route('creators.show', item.user.id)}
                                                className="rounded-2xl border-2 border-brand/15 bg-white px-4 py-2 text-sm font-bold text-brand hover:bg-brand-soft"
                                            >
                                                View profile
                                            </Link>
                                        )}
                                        {item.status === 'pending' && (
                                            <>
                                                <Link
                                                    href={route('admin.verifications.approve', item.id)}
                                                    method="post"
                                                    as="button"
                                                    className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
                                                >
                                                    Approve
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setRejectId(item.id)}
                                                    className="btn-ghost px-4 py-2"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <Detail label="Phone" value={item.user.phone || '—'} />
                                    <Detail
                                        label="Joined"
                                        value={
                                            item.user.created_at
                                                ? new Date(item.user.created_at).toLocaleDateString()
                                                : '—'
                                        }
                                    />
                                    <Detail label="Wallet" value={`$${walletBalance.toFixed(2)}`} />
                                    <Detail
                                        label="Submitted"
                                        value={new Date(item.created_at).toLocaleString()}
                                    />
                                    {profile && (
                                        <>
                                            <Detail label="Chat price" value={`$${Number(profile.chat_price ?? 0).toFixed(2)}`} />
                                            <Detail label="Voice price" value={`$${Number(profile.voice_price ?? 0).toFixed(2)}`} />
                                            <Detail
                                                label="Call / min"
                                                value={`$${Number(profile.call_price_per_minute ?? 0).toFixed(2)}`}
                                            />
                                        </>
                                    )}
                                    {item.reviewed_at && (
                                        <Detail
                                            label="Reviewed"
                                            value={`${new Date(item.reviewed_at).toLocaleString()}${
                                                item.reviewer ? ` · ${item.reviewer.name}` : ''
                                            }`}
                                        />
                                    )}
                                </div>

                                {item.user.bio && (
                                    <p className="mt-4 rounded-2xl bg-canvas px-4 py-3 text-sm text-slate-600">
                                        {item.user.bio}
                                    </p>
                                )}

                                {item.rejection_reason && (
                                    <p className="mt-3 text-sm font-semibold text-rose-600">
                                        Rejection reason: {item.rejection_reason}
                                    </p>
                                )}

                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    {item.selfie_url && (
                                        <ZoomThumb
                                            src={item.selfie_url}
                                            label="Selfie"
                                            onOpen={() => setLightbox({ url: item.selfie_url!, label: 'Selfie' })}
                                        />
                                    )}
                                    {item.id_photo_url && (
                                        <ZoomThumb
                                            src={item.id_photo_url}
                                            label="ID photo"
                                            onOpen={() => setLightbox({ url: item.id_photo_url!, label: 'ID photo' })}
                                        />
                                    )}
                                </div>

                                {rejectId === item.id && (
                                    <form onSubmit={submitReject} className="mt-4 flex flex-col gap-2 sm:flex-row">
                                        <AdminInput
                                            value={rejectForm.data.rejection_reason}
                                            onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                            placeholder="Rejection reason"
                                            required
                                            className="flex-1"
                                        />
                                        <button
                                            type="submit"
                                            className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700"
                                        >
                                            Confirm
                                        </button>
                                    </form>
                                )}
                            </div>
                        );
                    })}

                    {requests.data.length === 0 && (
                        <div className="rounded-[28px] border border-dashed border-brand/20 bg-white px-6 py-16 text-center text-slate-500">
                            No verification requests in this filter.
                        </div>
                    )}
                </div>
            </div>

            <ImageLightbox
                url={lightbox?.url ?? null}
                label={lightbox?.label}
                onClose={() => setLightbox(null)}
            />
        </AdminLayout>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-canvas px-3.5 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
        </div>
    );
}

function ZoomThumb({ src, label, onOpen }: { src: string; label: string; onOpen: () => void }) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className="group relative overflow-hidden rounded-2xl bg-canvas text-left ring-1 ring-brand/10 transition hover:ring-brand/40"
        >
            <img src={src} alt={label} className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/70 to-transparent px-3 py-2.5">
                <span className="text-sm font-bold text-white">{label}</span>
                <span className="rounded-lg bg-white/20 px-2 py-1 text-[11px] font-bold text-white">Click to zoom</span>
            </div>
        </button>
    );
}
