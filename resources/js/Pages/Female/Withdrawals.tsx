import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Paginated } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type Withdrawal = {
    id: number;
    amount: number | string;
    status: string;
    created_at: string;
    admin_notes?: string | null;
};

export default function Withdrawals({
    withdrawals,
    walletBalance,
    minWithdrawal,
    bank,
}: PageProps<{
    withdrawals: Paginated<Withdrawal>;
    walletBalance: number;
    minWithdrawal: number;
    bank: { bank_name?: string | null; bank_account?: string | null; bank_holder?: string | null };
}>) {
    const form = useForm({ amount: minWithdrawal });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('female.withdrawals.store'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-800">Withdrawals</h2>}>
            <Head title="Withdrawals" />
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Available balance</p>
                    <p className="text-2xl font-semibold">${Number(walletBalance).toFixed(2)}</p>
                    <p className="mt-1 text-sm text-slate-500">Minimum withdrawal: ${Number(minWithdrawal).toFixed(2)}</p>
                    <p className="mt-2 text-sm text-slate-600">
                        Payout to: {bank.bank_holder} · {bank.bank_name} · {bank.bank_account}
                    </p>
                    <form onSubmit={submit} className="mt-4 flex gap-3">
                        <input
                            type="number"
                            step="0.01"
                            min={minWithdrawal}
                            value={form.data.amount}
                            onChange={(e) => form.setData('amount', Number(e.target.value))}
                            className="rounded-md border-slate-300 shadow-sm"
                        />
                        <button className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white" disabled={form.processing}>
                            Request withdrawal
                        </button>
                    </form>
                    {form.errors.amount && <p className="mt-2 text-sm text-red-600">{form.errors.amount}</p>}
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {withdrawals.data.map((w) => (
                                <tr key={w.id} className="border-t">
                                    <td className="px-4 py-3">${Number(w.amount).toFixed(2)}</td>
                                    <td className="px-4 py-3 capitalize">{w.status}</td>
                                    <td className="px-4 py-3">{new Date(w.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
