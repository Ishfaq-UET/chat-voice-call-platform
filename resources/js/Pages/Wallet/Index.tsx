import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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
};

type PaymentMethod = 'stripe' | 'paypal' | 'manual';

export default function WalletIndex({
    balance,
    transactions,
    stripeEnabled,
    paypalEnabled = false,
    manualInstructions,
    manualChannels = {
        jazzcash: 'JazzCash',
        easypaisa: 'EasyPaisa',
        bank_transfer: 'Bank transfer',
        other: 'Other',
    },
    manualRequests = [],
    hasPendingManual = false,
}: PageProps<{
    balance: number;
    transactions: Paginated<Tx>;
    stripeEnabled: boolean;
    paypalEnabled?: boolean;
    manualInstructions: string;
    manualChannels?: Record<string, string>;
    manualRequests?: ManualRequest[];
    hasPendingManual?: boolean;
}>) {
    const flash = usePage<PageProps>().props.flash;
    const [preview, setPreview] = useState<string | null>(null);
    const [method, setMethod] = useState<PaymentMethod | null>(null);

    const stripeForm = useForm({ amount: 20 });
    const manualForm = useForm<{
        payment_channel: string;
        sender_account_name: string;
        sender_number: string;
        receiver_account: string;
        amount: number;
        transaction_id: string;
        screenshot: File | null;
        member_notes: string;
    }>({
        payment_channel: 'jazzcash',
        sender_account_name: '',
        sender_number: '',
        receiver_account: '',
        amount: 20,
        transaction_id: '',
        screenshot: null,
        member_notes: '',
    });

    const submitStripe: FormEventHandler = (e) => {
        e.preventDefault();
        stripeForm.post(route('wallet.top-up'));
    };

    const submitManual: FormEventHandler = (e) => {
        e.preventDefault();
        manualForm.post(route('wallet.manual-top-up'), {
            forceFormData: true,
            onSuccess: () => {
                manualForm.reset();
                manualForm.setData({
                    payment_channel: 'jazzcash',
                    sender_account_name: '',
                    sender_number: '',
                    receiver_account: '',
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

    const methods: {
        id: PaymentMethod;
        title: string;
        description: string;
        available: boolean;
        badge?: string;
    }[] = [
        {
            id: 'stripe',
            title: 'Stripe',
            description: 'Pay instantly with debit or credit card.',
            available: stripeEnabled,
            badge: stripeEnabled ? undefined : 'Unavailable',
        },
        {
            id: 'paypal',
            title: 'PayPal',
            description: 'Pay with your PayPal balance or linked card.',
            available: paypalEnabled,
            badge: paypalEnabled ? undefined : 'Coming soon',
        },
        {
            id: 'manual',
            title: 'Manual payment',
            description: 'JazzCash, EasyPaisa, or bank transfer — upload proof for admin review.',
            available: true,
        },
    ];

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
                    <p className="mt-1 text-3xl font-extrabold text-ink">${Number(balance).toFixed(2)}</p>
                </div>

                <div className="card-soft p-5 sm:p-6">
                    <h3 className="text-lg font-extrabold text-ink">Add money</h3>
                    <p className="mt-1 text-sm text-slate-500">Choose how you want to top up your wallet.</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {methods.map((m) => {
                            const selected = method === m.id;
                            return (
                                <button
                                    key={m.id}
                                    type="button"
                                    disabled={!m.available}
                                    onClick={() => setMethod(m.id)}
                                    className={`rounded-2xl border p-4 text-left transition ${
                                        selected
                                            ? 'border-brand bg-brand-soft ring-2 ring-brand/30'
                                            : m.available
                                              ? 'border-brand/15 bg-white hover:border-brand/40'
                                              : 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-70'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-extrabold text-ink">{m.title}</p>
                                        {m.badge && (
                                            <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                                {m.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">{m.description}</p>
                                </button>
                            );
                        })}
                    </div>

                    {method === 'stripe' && stripeEnabled && (
                        <form onSubmit={submitStripe} className="mt-6 space-y-4 border-t border-brand/10 pt-6">
                            <p className="text-sm text-slate-500">Enter the amount and continue to Stripe Checkout.</p>
                            <div>
                                <label className="text-sm font-bold text-slate-700">Amount (USD)</label>
                                <input
                                    type="number"
                                    min={5}
                                    max={500}
                                    step="1"
                                    value={stripeForm.data.amount}
                                    onChange={(e) => stripeForm.setData('amount', Number(e.target.value))}
                                    className="mt-1 w-full rounded-2xl border-brand/15 text-sm focus:border-brand focus:ring-brand"
                                    required
                                />
                                {stripeForm.errors.amount && (
                                    <p className="mt-1 text-sm text-rose-600">{stripeForm.errors.amount}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={stripeForm.processing}
                                className="rounded-2xl bg-ink px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-40"
                            >
                                Continue to Stripe
                            </button>
                        </form>
                    )}

                    {method === 'paypal' && (
                        <div className="mt-6 rounded-2xl border border-dashed border-brand/20 bg-canvas px-4 py-5 text-sm text-slate-600">
                            {paypalEnabled
                                ? 'PayPal checkout will open here once configured.'
                                : 'PayPal is not available yet. Please use Stripe or manual payment.'}
                        </div>
                    )}

                    {method === 'manual' && (
                        <div className="mt-6 space-y-4 border-t border-brand/10 pt-6">
                            <p className="text-sm text-slate-500">
                                Pay using JazzCash, EasyPaisa, or bank transfer, then submit the details below for admin
                                verification.
                            </p>

                            <div className="whitespace-pre-wrap rounded-2xl bg-brand-soft px-4 py-3 text-sm font-semibold text-brand">
                                {manualInstructions}
                            </div>

                            {hasPendingManual && (
                                <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                                    You have a pending request. Wait for admin to verify it before submitting another.
                                </div>
                            )}

                            <form onSubmit={submitManual} className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700">Payment method</label>
                                    <select
                                        value={manualForm.data.payment_channel}
                                        onChange={(e) => manualForm.setData('payment_channel', e.target.value)}
                                        disabled={hasPendingManual}
                                        className="mt-1 w-full rounded-2xl border-brand/15 text-sm focus:border-brand focus:ring-brand disabled:bg-slate-50"
                                        required
                                    >
                                        {Object.entries(manualChannels).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    {manualForm.errors.payment_channel && (
                                        <p className="mt-1 text-sm text-rose-600">{manualForm.errors.payment_channel}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700">Send from account</label>
                                        <input
                                            type="text"
                                            value={manualForm.data.sender_account_name}
                                            onChange={(e) =>
                                                manualForm.setData('sender_account_name', e.target.value)
                                            }
                                            disabled={hasPendingManual}
                                            placeholder="Account / title name"
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
                                        <label className="text-sm font-bold text-slate-700">Send from number</label>
                                        <input
                                            type="text"
                                            value={manualForm.data.sender_number}
                                            onChange={(e) => manualForm.setData('sender_number', e.target.value)}
                                            disabled={hasPendingManual}
                                            placeholder="Your JazzCash / EasyPaisa / account no."
                                            className="mt-1 w-full rounded-2xl border-brand/15 text-sm focus:border-brand focus:ring-brand disabled:bg-slate-50"
                                            required
                                        />
                                        {manualForm.errors.sender_number && (
                                            <p className="mt-1 text-sm text-rose-600">{manualForm.errors.sender_number}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700">Send to</label>
                                    <input
                                        type="text"
                                        value={manualForm.data.receiver_account}
                                        onChange={(e) => manualForm.setData('receiver_account', e.target.value)}
                                        disabled={hasPendingManual}
                                        placeholder="Platform account / number you paid to"
                                        className="mt-1 w-full rounded-2xl border-brand/15 text-sm focus:border-brand focus:ring-brand disabled:bg-slate-50"
                                        required
                                    />
                                    {manualForm.errors.receiver_account && (
                                        <p className="mt-1 text-sm text-rose-600">{manualForm.errors.receiver_account}</p>
                                    )}
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
                                            onChange={(e) => manualForm.setData('amount', Number(e.target.value))}
                                            disabled={hasPendingManual}
                                            className="mt-1 w-full rounded-2xl border-brand/15 text-sm focus:border-brand focus:ring-brand disabled:bg-slate-50"
                                            required
                                        />
                                        {manualForm.errors.amount && (
                                            <p className="mt-1 text-sm text-rose-600">{manualForm.errors.amount}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700">Transaction ID (TID)</label>
                                        <input
                                            type="text"
                                            value={manualForm.data.transaction_id}
                                            onChange={(e) => manualForm.setData('transaction_id', e.target.value)}
                                            disabled={hasPendingManual}
                                            placeholder="e.g. JazzCash / EasyPaisa TID"
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
                                    <label className="text-sm font-bold text-slate-700">Payment screenshot</label>
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
                                        <p className="mt-1 text-sm text-rose-600">{manualForm.errors.screenshot}</p>
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
                                        onChange={(e) => manualForm.setData('member_notes', e.target.value)}
                                        disabled={hasPendingManual}
                                        rows={2}
                                        placeholder="Anything else the admin should know"
                                        className="mt-1 w-full rounded-2xl border-brand/15 text-sm focus:border-brand focus:ring-brand disabled:bg-slate-50"
                                    />
                                    {manualForm.errors.member_notes && (
                                        <p className="mt-1 text-sm text-rose-600">{manualForm.errors.member_notes}</p>
                                    )}
                                </div>

                                {manualForm.errors.manual && (
                                    <p className="text-sm text-rose-600">{manualForm.errors.manual}</p>
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
                                        <p className="font-bold text-ink">${Number(r.amount).toFixed(2)}</p>
                                        <p className="text-xs text-slate-500">
                                            {r.payment_channel_label ?? r.payment_channel ?? 'Manual'} · TID:{' '}
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
                                        <td className="px-5 py-3 font-semibold">${Number(tx.amount).toFixed(2)}</td>
                                        <td className="px-5 py-3">${Number(tx.balance_after).toFixed(2)}</td>
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
