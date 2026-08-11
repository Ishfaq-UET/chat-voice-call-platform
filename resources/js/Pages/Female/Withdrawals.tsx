import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Paginated } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type Withdrawal = {
    id: number;
    amount: number | string;
    status: string;
    created_at: string;
    processed_at?: string | null;
    admin_notes?: string | null;
    payment_reference?: string | null;
    payment_method?: string | null;
    bank_name?: string | null;
    bank_account?: string | null;
    bank_holder?: string | null;
};

export default function Withdrawals({
    withdrawals,
    walletBalance,
    minWithdrawal,
    hasPending,
    bank,
}: PageProps<{
    withdrawals: Paginated<Withdrawal>;
    walletBalance: number;
    minWithdrawal: number;
    hasPending: boolean;
    bank: { bank_name?: string | null; bank_account?: string | null; bank_holder?: string | null };
}>) {
    const flash = usePage<PageProps>().props.flash;
    const form = useForm({ amount: Number(minWithdrawal) });
    const bankReady = Boolean(bank.bank_name && bank.bank_account && bank.bank_holder);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('female.withdrawals.store'));
    };

    const statusStyle = (status: string) => {
        if (status === 'paid') return 'bg-emerald-50 text-emerald-700';
        if (status === 'rejected') return 'bg-rose-50 text-rose-600';
        return 'bg-amber-50 text-amber-800';
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-extrabold text-ink">Withdrawals</h2>
                    <p className="text-sm text-slate-500">Request a manual bank payout from your earnings</p>
                </div>
            }
        >
            <Head title="Withdrawals" />
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
                {flash?.success && (
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="rounded-2xl bg-brand-soft px-4 py-3 text-sm font-semibold text-brand">
                    Payouts are manual. After you request a withdrawal, an admin transfers money to your bank
                    account and marks it as paid.
                </div>

                <div className="card-soft p-5 sm:p-6">
                    <p className="text-sm font-medium text-slate-500">Available balance</p>
                    <p className="mt-1 text-3xl font-extrabold text-ink">${Number(walletBalance).toFixed(2)}</p>
                    <p className="mt-1 text-sm text-slate-500">
                        Minimum withdrawal: ${Number(minWithdrawal).toFixed(2)}
                    </p>

                    <div className="mt-5 rounded-2xl bg-canvas px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Payout bank</p>
                                {bankReady ? (
                                    <p className="mt-1 text-sm font-semibold text-ink">
                                        {bank.bank_holder}
                                        <span className="mt-0.5 block text-xs font-medium text-slate-500">
                                            {bank.bank_name} · {bank.bank_account}
                                        </span>
                                    </p>
                                ) : (
                                    <p className="mt-1 text-sm text-rose-600">
                                        Bank details missing. Save them on your dashboard first.
                                    </p>
                                )}
                            </div>
                            <Link href={route('female.dashboard')} className="text-sm font-bold text-brand hover:underline">
                                Edit bank
                            </Link>
                        </div>
                    </div>

                    <form onSubmit={submit} className="mt-5 space-y-3">
                        <label className="block text-sm font-bold text-slate-700">
                            Amount to withdraw
                            <input
                                type="number"
                                step="0.01"
                                min={minWithdrawal}
                                max={walletBalance}
                                value={form.data.amount}
                                onChange={(e) => form.setData('amount', Number(e.target.value))}
                                disabled={hasPending || !bankReady}
                                className="mt-1 w-full rounded-2xl border-brand/15 text-sm focus:border-brand focus:ring-brand disabled:bg-slate-50"
                            />
                        </label>
                        {form.errors.amount && <p className="text-sm text-rose-600">{form.errors.amount}</p>}
                        {hasPending && (
                            <p className="text-sm font-semibold text-amber-700">
                                You already have a pending withdrawal awaiting manual payment.
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={form.processing || hasPending || !bankReady || walletBalance < minWithdrawal}
                            className="rounded-2xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-soft hover:bg-brand-deep disabled:opacity-40"
                        >
                            Request manual payout
                        </button>
                    </form>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-brand/10 bg-white shadow-card">
                    <div className="border-b border-brand/10 px-5 py-4">
                        <h3 className="font-extrabold text-ink">Request history</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-canvas text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Amount</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Details</th>
                                    <th className="px-5 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand/10">
                                {withdrawals.data.map((w) => (
                                    <tr key={w.id}>
                                        <td className="px-5 py-4 font-bold text-ink">
                                            ${Number(w.amount).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`chip capitalize ${statusStyle(w.status)}`}>
                                                {w.status === 'paid' ? 'Paid manually' : w.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500">
                                            {w.payment_reference && (
                                                <p>Ref: {w.payment_reference}</p>
                                            )}
                                            {w.admin_notes && <p>{w.admin_notes}</p>}
                                            {!w.payment_reference && !w.admin_notes && '—'}
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">
                                            {new Date(w.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {withdrawals.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                                            No withdrawal requests yet.
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
