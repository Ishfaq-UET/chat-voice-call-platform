import AdminPageBanner from '@/Components/Admin/AdminPageBanner';
import { AdminField, AdminInput, AdminSelect } from '@/Components/Admin/AdminField';
import { IconWallet } from '@/Components/Admin/AdminIcons';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps, Paginated, User } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type Item = {
    id: number;
    amount: number | string;
    status: string;
    bank_name?: string | null;
    bank_account?: string | null;
    bank_holder?: string | null;
    admin_notes?: string | null;
    payment_reference?: string | null;
    payment_method?: string | null;
    processed_at?: string | null;
    created_at: string;
    user: User & { phone?: string | null };
    processor?: { id: number; name: string } | null;
};

export default function AdminWithdrawals({
    withdrawals,
    filters = { status: 'pending' },
    counts = { pending: 0, paid: 0, rejected: 0, all: 0 },
}: PageProps<{
    withdrawals: Paginated<Item>;
    filters?: { status?: string };
    counts?: { pending: number; paid: number; rejected: number; all: number };
}>) {
    const [payId, setPayId] = useState<number | null>(null);
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const payForm = useForm({
        payment_reference: '',
        payment_method: 'bank_transfer',
        admin_notes: '',
    });

    const rejectForm = useForm({ admin_notes: '' });
    const status = filters.status ?? 'pending';

    const submitPay: FormEventHandler = (e) => {
        e.preventDefault();
        if (!payId) return;
        payForm.post(route('admin.withdrawals.approve', payId), {
            onSuccess: () => {
                setPayId(null);
                payForm.reset();
                payForm.setData('payment_method', 'bank_transfer');
            },
        });
    };

    const submitReject: FormEventHandler = (e) => {
        e.preventDefault();
        if (!rejectId) return;
        rejectForm.post(route('admin.withdrawals.reject', rejectId), {
            onSuccess: () => {
                setRejectId(null);
                rejectForm.reset();
            },
        });
    };

    const copyBank = async (w: Item) => {
        const text = [
            `Holder: ${w.bank_holder ?? ''}`,
            `Bank: ${w.bank_name ?? ''}`,
            `Account: ${w.bank_account ?? ''}`,
            `Amount: $${Number(w.amount).toFixed(2)}`,
            `User: ${w.user.name} (${w.user.email})`,
        ].join('\n');

        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(w.id);
            window.setTimeout(() => setCopiedId(null), 1800);
        } catch {
            // ignore
        }
    };

    return (
        <AdminLayout header="Withdrawals">
            <Head title="Admin Withdrawals" />
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 lg:px-6">
                <AdminPageBanner
                    eyebrow={
                        <>
                            <IconWallet />
                            Manual payouts
                        </>
                    }
                    title="Withdrawals"
                    description="Pay creators manually via bank transfer, then mark the request as paid with a payment reference."
                    meta={`${counts.pending} awaiting payment`}
                />

                <div className="rounded-2xl bg-brand-soft px-4 py-3 text-sm font-semibold text-brand">
                    Flow: creator requests → funds held from wallet → you send money outside the app → mark as paid here.
                </div>

                <div className="flex flex-wrap gap-2">
                    {([
                        ['pending', counts.pending],
                        ['paid', counts.paid],
                        ['rejected', counts.rejected],
                        ['all', counts.all],
                    ] as const).map(([s, count]) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => router.get(route('admin.withdrawals'), { status: s }, { preserveState: true })}
                            className={`rounded-2xl px-4 py-2 text-sm font-bold capitalize transition ${
                                status === s ? 'bg-brand text-white' : 'bg-white text-slate-600 ring-1 ring-brand/10'
                            }`}
                        >
                            {s} ({count})
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {withdrawals.data.map((w) => (
                        <div key={w.id} className="card-soft p-5 sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-lg font-extrabold text-ink">
                                        ${Number(w.amount).toFixed(2)}{' '}
                                        <span className="chip ms-2 bg-brand-soft text-brand capitalize">{w.status}</span>
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-ink">{w.user.name}</p>
                                    <p className="text-sm text-slate-500">
                                        {w.user.email}
                                        {w.user.phone ? ` · ${w.user.phone}` : ''}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Requested {new Date(w.created_at).toLocaleString()}
                                        {w.processed_at && ` · Processed ${new Date(w.processed_at).toLocaleString()}`}
                                        {w.processor && ` · by ${w.processor.name}`}
                                    </p>
                                </div>

                                {w.status === 'pending' && (
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => copyBank(w)}
                                            className="btn-ghost px-4 py-2"
                                        >
                                            {copiedId === w.id ? 'Copied' : 'Copy bank details'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRejectId(null);
                                                setPayId(w.id);
                                            }}
                                            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                                        >
                                            Mark manually paid
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPayId(null);
                                                setRejectId(w.id);
                                            }}
                                            className="btn-ghost px-4 py-2"
                                        >
                                            Reject & refund
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl bg-canvas px-3.5 py-3">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                        Account holder
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-ink">{w.bank_holder || '—'}</p>
                                </div>
                                <div className="rounded-2xl bg-canvas px-3.5 py-3">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Bank</p>
                                    <p className="mt-1 text-sm font-semibold text-ink">{w.bank_name || '—'}</p>
                                </div>
                                <div className="rounded-2xl bg-canvas px-3.5 py-3">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                        Account number
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-ink">{w.bank_account || '—'}</p>
                                </div>
                            </div>

                            {(w.payment_reference || w.payment_method || w.admin_notes) && (
                                <div className="mt-3 rounded-2xl bg-canvas px-4 py-3 text-sm text-slate-600">
                                    {w.payment_method && (
                                        <p>
                                            Method: <span className="font-semibold capitalize text-ink">{w.payment_method.replace('_', ' ')}</span>
                                        </p>
                                    )}
                                    {w.payment_reference && (
                                        <p>
                                            Reference: <span className="font-semibold text-ink">{w.payment_reference}</span>
                                        </p>
                                    )}
                                    {w.admin_notes && <p className="mt-1">{w.admin_notes}</p>}
                                </div>
                            )}

                            <div className="mt-3">
                                <Link href={route('admin.users.edit', w.user.id)} className="text-sm font-bold text-brand hover:underline">
                                    Open user profile
                                </Link>
                            </div>

                            {payId === w.id && (
                                <form onSubmit={submitPay} className="mt-4 grid gap-3 rounded-2xl border border-brand/15 bg-white p-4 sm:grid-cols-2">
                                    <AdminField label="Payment method">
                                        <AdminSelect
                                            value={payForm.data.payment_method}
                                            onChange={(e) => payForm.setData('payment_method', e.target.value)}
                                        >
                                            <option value="bank_transfer">Bank transfer</option>
                                            <option value="cash">Cash</option>
                                            <option value="other">Other</option>
                                        </AdminSelect>
                                    </AdminField>
                                    <AdminField label="Payment reference / txn ID">
                                        <AdminInput
                                            value={payForm.data.payment_reference}
                                            onChange={(e) => payForm.setData('payment_reference', e.target.value)}
                                            placeholder="e.g. bank transfer ID"
                                        />
                                    </AdminField>
                                    <div className="sm:col-span-2">
                                        <AdminField label="Notes (optional)">
                                            <AdminInput
                                                value={payForm.data.admin_notes}
                                                onChange={(e) => payForm.setData('admin_notes', e.target.value)}
                                                placeholder="Any payout notes for records"
                                            />
                                        </AdminField>
                                    </div>
                                    <div className="flex gap-2 sm:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={payForm.processing}
                                            className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                            Confirm paid
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPayId(null)}
                                            className="btn-ghost px-4 py-2.5"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {rejectId === w.id && (
                                <form onSubmit={submitReject} className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <AdminInput
                                        value={rejectForm.data.admin_notes}
                                        onChange={(e) => rejectForm.setData('admin_notes', e.target.value)}
                                        placeholder="Rejection reason (amount will be refunded)"
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

                    {withdrawals.data.length === 0 && (
                        <div className="rounded-[28px] border border-dashed border-brand/20 bg-white px-6 py-16 text-center text-slate-500">
                            No withdrawal requests in this filter.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
