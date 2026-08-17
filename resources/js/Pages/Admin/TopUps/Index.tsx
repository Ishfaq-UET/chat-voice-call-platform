import AdminPageBanner from '@/Components/Admin/AdminPageBanner';
import { AdminField, AdminInput } from '@/Components/Admin/AdminField';
import ImageLightbox from '@/Components/Admin/ImageLightbox';
import { IconTopUp } from '@/Components/Admin/AdminIcons';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps, Paginated, User } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type TopUpRequest = {
    id: number;
    amount: number | string;
    payment_channel?: string | null;
    payment_channel_label?: string | null;
    sender_account_name?: string | null;
    sender_number?: string | null;
    receiver_account?: string | null;
    transaction_id: string;
    member_notes?: string | null;
    status: string;
    screenshot_url?: string | null;
    admin_notes?: string | null;
    created_at: string;
    reviewed_at?: string | null;
    user: User & { phone?: string | null; country_code?: string };
    reviewer?: { id: number; name: string } | null;
    payment_method?: {
        id: number;
        name: string;
        country_code: string;
        account_title: string;
        bank_name: string | null;
        account_number: string;
    } | null;
};

export default function AdminTopUpsIndex({
    requests,
    filters = { status: 'pending' },
    counts = { pending: 0, approved: 0, rejected: 0, all: 0 },
}: PageProps<{
    requests: Paginated<TopUpRequest>;
    filters?: { status?: string };
    counts?: { pending: number; approved: number; rejected: number; all: number };
}>) {
    const [approveId, setApproveId] = useState<number | null>(null);
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);

    const approveForm = useForm({
        credited_amount: '' as string | number,
        admin_notes: '',
    });
    const rejectForm = useForm({ admin_notes: '' });
    const status = filters.status ?? 'pending';

    const openApprove = (item: TopUpRequest) => {
        setRejectId(null);
        setApproveId(item.id);
        approveForm.setData({
            credited_amount: Number(item.amount),
            admin_notes: '',
        });
    };

    const submitApprove: FormEventHandler = (e) => {
        e.preventDefault();
        if (!approveId) return;
        approveForm.post(route('admin.top-ups.approve', approveId), {
            onSuccess: () => {
                setApproveId(null);
                approveForm.reset();
            },
        });
    };

    const submitReject: FormEventHandler = (e) => {
        e.preventDefault();
        if (!rejectId) return;
        rejectForm.post(route('admin.top-ups.reject', rejectId), {
            onSuccess: () => {
                setRejectId(null);
                rejectForm.reset();
            },
        });
    };

    return (
        <AdminLayout header="Top-up requests">
            <Head title="Manual Top-ups" />
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 lg:px-6">
                <AdminPageBanner
                    eyebrow={
                        <>
                            <IconTopUp />
                            Manual payments
                        </>
                    }
                    title="Top-up requests"
                    description="Review country payment methods, sender details, and screenshots, then credit the wallet."
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
                            onClick={() => router.get(route('admin.top-ups'), { status: s }, { preserveState: true })}
                            className={`rounded-2xl px-4 py-2 text-sm font-bold capitalize transition ${
                                status === s ? 'bg-brand text-white' : 'bg-white text-slate-600 ring-1 ring-brand/10'
                            }`}
                        >
                            {s} ({count})
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {requests.data.map((item) => (
                        <div key={item.id} className="card-soft p-5 sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <p className="text-lg font-extrabold text-ink">
                                        ${Number(item.amount).toFixed(2)}{' '}
                                        <span className="chip ms-2 bg-brand-soft text-brand capitalize">{item.status}</span>
                                        {item.payment_channel_label && (
                                            <span className="chip ms-2 bg-canvas text-slate-600">
                                                {item.payment_channel_label}
                                            </span>
                                        )}
                                        {item.payment_method?.country_code && (
                                            <span className="chip ms-2 bg-brand-soft text-brand">
                                                {item.payment_method.country_code}
                                            </span>
                                        )}
                                    </p>
                                    <p className="mt-1 font-semibold text-ink">{item.user.name}</p>
                                    <p className="text-sm text-slate-500">
                                        {item.user.email}
                                        {item.user.phone ? ` · ${item.user.phone}` : ''}
                                    </p>

                                    <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                                        <div className="rounded-xl bg-canvas px-3 py-2">
                                            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Send from account
                                            </dt>
                                            <dd className="mt-0.5 font-semibold text-ink">
                                                {item.sender_account_name || '—'}
                                            </dd>
                                        </div>
                                        <div className="rounded-xl bg-canvas px-3 py-2">
                                            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Send from number
                                            </dt>
                                            <dd className="mt-0.5 font-semibold text-ink font-mono">
                                                {item.sender_number || '—'}
                                            </dd>
                                        </div>
                                        <div className="rounded-xl bg-canvas px-3 py-2">
                                            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Send to
                                            </dt>
                                            <dd className="mt-0.5 font-semibold text-ink font-mono">
                                                {item.receiver_account || item.payment_method?.account_number || '—'}
                                            </dd>
                                        </div>
                                        <div className="rounded-xl bg-canvas px-3 py-2">
                                            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                TID
                                            </dt>
                                            <dd className="mt-0.5 font-mono font-bold text-brand">
                                                {item.transaction_id}
                                            </dd>
                                        </div>
                                    </dl>

                                    {item.member_notes && (
                                        <p className="mt-3 text-sm text-slate-600">
                                            <span className="font-bold text-ink">Member notes:</span> {item.member_notes}
                                        </p>
                                    )}

                                    <p className="mt-2 text-xs text-slate-400">
                                        Submitted {new Date(item.created_at).toLocaleString()}
                                        {item.reviewed_at &&
                                            ` · Reviewed ${new Date(item.reviewed_at).toLocaleString()}`}
                                        {item.reviewer && ` · by ${item.reviewer.name}`}
                                    </p>
                                    {item.admin_notes && (
                                        <p className="mt-2 text-sm text-slate-600">{item.admin_notes}</p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        href={route('admin.users.edit', item.user.id)}
                                        className="btn-ghost px-4 py-2"
                                    >
                                        Edit user
                                    </Link>
                                    {item.status === 'pending' && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => openApprove(item)}
                                                className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                                            >
                                                Approve & credit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setApproveId(null);
                                                    setRejectId(item.id);
                                                }}
                                                className="btn-ghost px-4 py-2"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {item.screenshot_url && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setLightbox({ url: item.screenshot_url!, label: 'Payment screenshot' })
                                    }
                                    className="group relative mt-4 block overflow-hidden rounded-2xl ring-1 ring-brand/10"
                                >
                                    <img
                                        src={item.screenshot_url}
                                        alt="Payment screenshot"
                                        className="max-h-72 w-full bg-canvas object-contain transition group-hover:scale-[1.01]"
                                    />
                                    <span className="absolute bottom-3 right-3 rounded-lg bg-ink/70 px-2.5 py-1 text-xs font-bold text-white">
                                        Click to zoom
                                    </span>
                                </button>
                            )}

                            {approveId === item.id && (
                                <form
                                    onSubmit={submitApprove}
                                    className="mt-4 grid gap-3 rounded-2xl border border-brand/15 p-4 sm:grid-cols-2"
                                >
                                    <AdminField label="Amount to credit" required>
                                        <AdminInput
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={approveForm.data.credited_amount}
                                            onChange={(e) =>
                                                approveForm.setData('credited_amount', Number(e.target.value))
                                            }
                                            required
                                        />
                                    </AdminField>
                                    <AdminField label="Notes (optional)">
                                        <AdminInput
                                            value={approveForm.data.admin_notes}
                                            onChange={(e) => approveForm.setData('admin_notes', e.target.value)}
                                            placeholder="Verified against JazzCash / bank statement"
                                        />
                                    </AdminField>
                                    <div className="flex gap-2 sm:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={approveForm.processing}
                                            className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                                        >
                                            Confirm credit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setApproveId(null)}
                                            className="btn-ghost px-4 py-2.5"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {rejectId === item.id && (
                                <form onSubmit={submitReject} className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <AdminInput
                                        value={rejectForm.data.admin_notes}
                                        onChange={(e) => rejectForm.setData('admin_notes', e.target.value)}
                                        placeholder="Rejection reason (invalid screenshot / wrong TID)"
                                        required
                                        className="flex-1"
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
                                    >
                                        Confirm reject
                                    </button>
                                </form>
                            )}
                        </div>
                    ))}

                    {requests.data.length === 0 && (
                        <div className="rounded-[28px] border border-dashed border-brand/20 bg-white px-6 py-16 text-center text-slate-500">
                            No top-up requests in this filter.
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
