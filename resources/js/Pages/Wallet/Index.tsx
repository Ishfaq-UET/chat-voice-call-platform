import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatMoney } from '@/lib/money';
import { PageProps, Paginated } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type Tx = {
    id: number;
    type: string;
    amount: number | string;
    balance_after: number | string;
    description?: string | null;
    created_at: string;
};

type PaymentMethod = {
    id: number;
    name: string;
    country_code: string;
    account_title: string;
    bank_name: string | null;
    account_number: string;
    extra_instructions: string | null;
};

type ManualRequest = {
    id: number;
    amount: number | string;
    payment_channel?: string | null;
    payment_channel_label?: string | null;
    sender_account_name?: string | null;
    sender_number?: string | null;
    receiver_account?: string | null;
    transaction_id: string;
    status: string;
    screenshot_url?: string | null;
    member_notes?: string | null;
    admin_notes?: string | null;
    created_at: string;
    reviewed_at?: string | null;
    payment_method?: { id: number; name: string } | null;
};

export default function WalletIndex({
    balance,
    transactions,
    paymentMethods = [],
    manualRequests = [],
    hasPendingManual = false,
}: PageProps<{
    balance: number;
    transactions: Paginated<Tx>;
    paymentMethods?: PaymentMethod[];
    manualRequests?: ManualRequest[];
    hasPendingManual?: boolean;
}>) {
    const flash = usePage<PageProps>().props.flash;
    const market = usePage<PageProps>().props.market;
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(paymentMethods[0]?.id ?? null);
    const selected = paymentMethods.find((m) => m.id === selectedId) ?? null;

    const manualForm = useForm<{
        payment_method_id: number | '';
        sender_account_name: string;
        sender_number: string;
        amount: number;
        transaction_id: string;
        screenshot: File | null;
        member_notes: string;
    }>({
        payment_method_id: paymentMethods[0]?.id ?? '',
        sender_account_name: '',
        sender_number: '',
        amount: 20,
        transaction_id: '',
        screenshot: null,
        member_notes: '',
    });

    const pickMethod = (id: number) => {
        setSelectedId(id);
        manualForm.setData('payment_method_id', id);
    };

    const submitManual: FormEventHandler = (e) => {
        e.preventDefault();
        manualForm.post(route('wallet.manual-top-up'), {
            forceFormData: true,
            onSuccess: () => {
                manualForm.reset();
                manualForm.setData({
                    payment_method_id: selectedId ?? paymentMethods[0]?.id ?? '',
                    sender_account_name: '',
                    sender_number: '',
                    amount: 20,
                    transaction_id: '',
                    screenshot: null,
                    member_notes: '',
                });
                if (preview) URL.revokeObjectURL(preview);
                setPreview(null);
            },
        });
    };

    const statusStyle = (status: string) => {
        if (status === 'approved') return 'bg-emerald-50 text-emerald-700';
        if (status === 'rejected') return 'bg-rose-50 text-rose-600';
        return 'bg-amber-50 text-amber-800';
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-extrabold text-ink">Wallet</h2>
                    <p className="text-sm text-slate-500">Balance, top-up & history</p>
                </div>
            }
        >
            <Head title="Wallet" />
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
                {flash?.success && (
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="card-soft p-5 sm:p-6">
                    <p className="text-sm font-medium text-slate-500">Current balance</p>
                    <p className="mt-1 text-3xl font-extrabold text-ink">{formatMoney(balance, market)}</p>
                </div>

                <div className="card-soft p-5 sm:p-6">
                    <h3 className="text-lg font-extrabold text-ink">Add money</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Pay using a local method for {market?.country_name ?? 'your country'}, then submit proof for admin
                        review.
                    </p>

                    {paymentMethods.length === 0 ? (
                        <div className="mt-5 rounded-2xl border border-dashed border-brand/20 bg-canvas px-4 py-8 text-center text-sm text-slate-500">
                            No payment methods are available for your country yet. Please contact support.
                        </div>
                    ) : (
                        <>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {paymentMethods.map((m) => {
                                    const isSelected = selectedId === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => pickMethod(m.id)}
                                            className={`rounded-2xl border p-4 text-left transition ${
                                                isSelected
                                                    ? 'border-brand bg-brand-soft ring-2 ring-brand/30'
                                                    : 'border-brand/15 bg-white hover:border-brand/40'
                                            }`}
                                        >
                                            <p className="font-extrabold text-ink">{m.name}</p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {m.bank_name || m.account_title}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            {selected && (
                                <div className="mt-6 space-y-4 border-t border-brand/10 pt-6">
                                    <div className="rounded-2xl bg-brand-soft px-4 py-4 text-sm text-brand">
                                        <p className="text-xs font-bold uppercase tracking-wide text-brand/70">
                                            Send payment to
                                        </p>
                                        <p className="mt-2 text-base font-extrabold text-ink">{selected.name}</p>
                                        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                                            <div>
                                                <dt className="text-[11px] font-bold uppercase tracking-wide text-brand/60">
                                                    Account title
                                                </dt>
                                                <dd className="font-semibold text-ink">{selected.account_title}</dd>
                                            </div>
                                            {selected.bank_name && (
                                                <div>
                                                    <dt className="text-[11px] font-bold uppercase tracking-wide text-brand/60">
                                                        Bank / wallet
                                                    </dt>
                                                    <dd className="font-semibold text-ink">{selected.bank_name}</dd>
                                                </div>
                                            )}
                                            <div className="sm:col-span-2">
                                                <dt className="text-[11px] font-bold uppercase tracking-wide text-brand/60">
                                                    Account number / IBAN
                                                </dt>
                                                <dd className="font-mono text-base font-extrabold text-ink">
                                                    {selected.account_number}
                                                </dd>
                                            </div>
                                        </dl>
                                        {selected.extra_instructions && (
                                            <p className="mt-3 whitespace-pre-wrap text-sm font-semibold text-brand">
                                                {selected.extra_instructions}
                                            </p>
                                        )}
                                    </div>

                                    {hasPendingManual && (
                                        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                                            You have a pending request. Wait for admin to verify it before submitting
                                            another.
                                        </div>
                                    )}

                                    <form onSubmit={submitManual} className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="text-sm font-bold text-slate-700">
                                                    Send from account
                                                </label>
                                                <input
                                                    type="text"
                                                    value={manualForm.data.sender_account_name}
                                                    onChange={(e) =>
                                                        manualForm.setData('sender_account_name', e.target.value)
                                                    }
                                                    disabled={hasPendingManual}
                                                    placeholder="Your account / title name"
                                                    className="mt-1 w-full rounded-2xl border-brand/15 text-sm focus:border-brand focus:ring-brand disabled:bg-slate-50"
                                                    required
                                                />
                                                {manualForm.errors.sender_account_name && (
                                                    <p className="mt-1 text-sm text-rose-600">
                                                        {manualForm.errors.sender_account_name}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-sm font-bold text-slate-700">
                                                    Send from number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={manualForm.data.sender_number}
                                                    onChange={(e) =>
                                                        manualForm.setData('sender_number', e.target.value)
                                                    }
                                                    disabled={hasPendingManual}
                                                    placeholder="Your wallet / account number"
                                                    className="mt-1 w-full rounded-2xl border-brand/15 text-sm focus:border-brand focus:ring-brand disabled:bg-slate-50"
                                                    required
                                                />
                                                {manualForm.errors.sender_number && (
                                                    <p className="mt-1 text-sm text-rose-600">
                                                        {manualForm.errors.sender_number}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="text-sm font-bold text-slate-700">Amount sent</label>
                                                <input
                                                    type="number"
                                                    min={5}
                                                    max={500}
                                                    step="0.01"
                                                    value={manualForm.data.amount}
                                                    onChange={(e) =>
                                                        manualForm.setData('amount', Number(e.target.value))
                                                    }
                                                    disabled={hasPendingManual}
                                                    className="mt-1 w-full rounded-2xl border-brand/15 text-sm focus:border-brand focus:ring-brand disabled:bg-slate-50"
                                                    required
                                                />
                                                {manualForm.errors.amount && (
                                                    <p className="mt-1 text-sm text-rose-600">
                                                        {manualForm.errors.amount}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-sm font-bold text-slate-700">
                                                    Transaction ID (TID)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={manualForm.data.transaction_id}
                                                    onChange={(e) =>
                                                        manualForm.setData('transaction_id', e.target.value)
                                                    }
                                                    disabled={hasPendingManual}
                                                    placeholder="Transaction / reference ID"
                                                    className="mt-1 w-full rounded-2xl border-brand/15 text-sm focus:border-brand focus:ring-brand disabled:bg-slate-50"
                                                    required
                                                />
                                                {manualForm.errors.transaction_id && (
                                                    <p className="mt-1 text-sm text-rose-600">
                                                        {manualForm.errors.transaction_id}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-slate-700">
                                                Payment screenshot
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                disabled={hasPendingManual}
                                                className="mt-1 block w-full text-sm"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] ?? null;
                                                    manualForm.setData('screenshot', file);
                                                    if (preview) URL.revokeObjectURL(preview);
                                                    setPreview(file ? URL.createObjectURL(file) : null);
                                                }}
                                                required={!hasPendingManual}
                                            />
                                            {manualForm.errors.screenshot && (
                                                <p className="mt-1 text-sm text-rose-600">
                                                    {manualForm.errors.screenshot}
                                                </p>
                                            )}
                                            {preview && (
                                                <img
                                                    src={preview}
                                                    alt="Payment screenshot preview"
                                                    className="mt-3 max-h-48 rounded-2xl object-cover ring-1 ring-brand/10"
                                                />
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-slate-700">Notes (optional)</label>
                                            <textarea
                                                value={manualForm.data.member_notes}
                                                onChange={(e) =>
                                                    manualForm.setData('member_notes', e.target.value)
                                                }
                                                disabled={hasPendingManual}
                                                rows={2}
                                                placeholder="Anything else the admin should know"
                                                className="mt-1 w-full rounded-2xl border-brand/15 text-sm focus:border-brand focus:ring-brand disabled:bg-slate-50"
                                            />
                                        </div>

                                        {manualForm.errors.payment_method_id && (
                                            <p className="text-sm text-rose-600">
                                                {manualForm.errors.payment_method_id}
                                            </p>
                                        )}
                                        {(manualForm.errors as Record<string, string>).manual && (
                                            <p className="text-sm text-rose-600">
                                                {(manualForm.errors as Record<string, string>).manual}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={manualForm.processing || hasPendingManual}
                                            className="rounded-2xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-soft hover:bg-brand-deep disabled:opacity-40"
                                        >
                                            Submit for admin review
                                        </button>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {manualRequests.length > 0 && (
                    <div className="overflow-hidden rounded-[28px] border border-brand/10 bg-white shadow-card">
                        <div className="border-b border-brand/10 px-5 py-4">
                            <h3 className="font-extrabold text-ink">Manual payment requests</h3>
                        </div>
                        <div className="divide-y divide-brand/10">
                            {manualRequests.map((r) => (
                                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                                    <div>
                                        <p className="font-bold text-ink">{formatMoney(r.amount, market)}</p>
                                        <p className="text-xs text-slate-500">
                                            {r.payment_method?.name ?? r.payment_channel_label ?? 'Manual'} · TID:{' '}
                                            {r.transaction_id}
                                        </p>
                                        {(r.sender_number || r.receiver_account) && (
                                            <p className="text-xs text-slate-400">
                                                {r.sender_number ? `From ${r.sender_number}` : ''}
                                                {r.sender_number && r.receiver_account ? ' → ' : ''}
                                                {r.receiver_account ? `To ${r.receiver_account}` : ''}
                                            </p>
                                        )}
                                        <p className="text-xs text-slate-400">
                                            {new Date(r.created_at).toLocaleString()}
                                        </p>
                                        {r.admin_notes && (
                                            <p className="mt-1 text-xs text-rose-600">{r.admin_notes}</p>
                                        )}
                                    </div>
                                    <span className={`chip capitalize ${statusStyle(r.status)}`}>{r.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="overflow-hidden rounded-[28px] border border-brand/10 bg-white shadow-card">
                    <div className="border-b border-brand/10 px-5 py-4">
                        <h3 className="font-extrabold text-ink">Transaction history</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-canvas text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Type</th>
                                    <th className="px-5 py-3">Amount</th>
                                    <th className="px-5 py-3">Balance</th>
                                    <th className="px-5 py-3">When</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand/10">
                                {transactions.data.map((tx) => (
                                    <tr key={tx.id}>
                                        <td className="px-5 py-3 capitalize">{tx.type.replace('_', ' ')}</td>
                                        <td className="px-5 py-3 font-semibold">{formatMoney(tx.amount, market)}</td>
                                        <td className="px-5 py-3">{formatMoney(tx.balance_after, market)}</td>
                                        <td className="px-5 py-3 text-slate-500">
                                            {new Date(tx.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                                            No transactions yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
