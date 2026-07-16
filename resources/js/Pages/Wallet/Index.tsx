import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Paginated } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type Tx = {
    id: number;
    type: string;
    amount: number | string;
    balance_after: number | string;
    description?: string | null;
    created_at: string;
};

export default function WalletIndex({
    balance,
    transactions,
    stripeEnabled,
}: PageProps<{
    balance: number;
    transactions: Paginated<Tx>;
    stripeEnabled: boolean;
}>) {
    const form = useForm({ amount: 20 });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('wallet.top-up'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-800">Wallet</h2>}>
            <Head title="Wallet" />
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Current balance</p>
                    <p className="text-3xl font-semibold">${Number(balance).toFixed(2)}</p>
                    <p className="mt-2 text-sm text-slate-500">
                        {stripeEnabled ? 'Top up securely with Stripe.' : 'Demo mode: top-ups credit instantly (no Stripe keys set).'}
                    </p>
                    <form onSubmit={submit} className="mt-4 flex gap-3">
                        <input
                            type="number"
                            min={5}
                            max={500}
                            step="1"
                            value={form.data.amount}
                            onChange={(e) => form.setData('amount', Number(e.target.value))}
                            className="rounded-md border-slate-300 shadow-sm"
                        />
                        <button className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white" disabled={form.processing}>
                            Top up
                        </button>
                    </form>
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Balance</th>
                                <th className="px-4 py-3">When</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.data.map((tx) => (
                                <tr key={tx.id} className="border-t">
                                    <td className="px-4 py-3 capitalize">{tx.type.replace('_', ' ')}</td>
                                    <td className="px-4 py-3">${Number(tx.amount).toFixed(2)}</td>
                                    <td className="px-4 py-3">${Number(tx.balance_after).toFixed(2)}</td>
                                    <td className="px-4 py-3">{new Date(tx.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
