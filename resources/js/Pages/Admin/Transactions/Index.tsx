import AdminPageBanner from '@/Components/Admin/AdminPageBanner';
import { AdminField, AdminInput, AdminSelect } from '@/Components/Admin/AdminField';
import { IconLedger, IconSearch } from '@/Components/Admin/AdminIcons';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps, Paginated } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Txn = {
    id: number;
    type: string;
    amount: number | string;
    balance_after: number | string;
    description?: string | null;
    created_at: string;
    wallet?: {
        user?: { id: number; name: string; email: string; role: string } | null;
    } | null;
};

export default function AdminTransactionsIndex({
    transactions,
    filters,
    summary,
}: PageProps<{
    transactions: Paginated<Txn>;
    filters: { type?: string; q?: string };
    summary: { top_ups: number; fees: number; earnings: number; withdrawals: number };
}>) {
    const [q, setQ] = useState(filters.q ?? '');
    const [type, setType] = useState(filters.type ?? '');

    const search = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('admin.transactions'), { q: q || undefined, type: type || undefined }, { preserveState: true });
    };

    return (
        <AdminLayout header="Transactions">
            <Head title="Admin Transactions" />
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 lg:px-6">
                <AdminPageBanner
                    eyebrow={
                        <>
                            <IconLedger />
                            Wallet ledger
                        </>
                    }
                    title="Transactions"
                    description="All wallet movements: top-ups, chat/voice/call fees, earnings, and withdrawals."
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        ['Top-ups', summary.top_ups],
                        ['Fees collected', summary.fees],
                        ['Creator earnings', summary.earnings],
                        ['Withdrawals', summary.withdrawals],
                    ].map(([label, value]) => (
                        <div key={label} className="card-soft p-4">
                            <p className="text-sm text-slate-500">{label}</p>
                            <p className="mt-1 text-xl font-extrabold text-ink">${Number(value).toFixed(2)}</p>
                        </div>
                    ))}
                </div>

                <div className="overflow-hidden rounded-[28px] border border-brand/10 bg-white shadow-card">
                    <form onSubmit={search} className="grid gap-3 border-b border-brand/10 px-5 py-5 sm:grid-cols-[1fr_200px_auto] sm:px-6">
                        <AdminField label="Search">
                            <AdminInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="User or description..." />
                        </AdminField>
                        <AdminField label="Type">
                            <AdminSelect value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="">All types</option>
                                <option value="top_up">Top-up</option>
                                <option value="chat_fee">Chat fee</option>
                                <option value="voice_fee">Voice fee</option>
                                <option value="image_fee">Image fee</option>
                                <option value="call_fee">Call fee</option>
                                <option value="earning">Earning</option>
                                <option value="withdrawal">Withdrawal</option>
                                <option value="refund">Refund</option>
                            </AdminSelect>
                        </AdminField>
                        <div className="flex items-end">
                            <button type="submit" className="btn-brand w-full px-5 py-2.5">
                                <IconSearch className="me-2" />
                                Filter
                            </button>
                        </div>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-brand/10 bg-canvas text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                    <th className="px-5 py-3.5">User</th>
                                    <th className="px-5 py-3.5">Type</th>
                                    <th className="px-5 py-3.5">Amount</th>
                                    <th className="px-5 py-3.5">Balance after</th>
                                    <th className="px-5 py-3.5">Description</th>
                                    <th className="px-5 py-3.5">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand/10">
                                {transactions.data.map((t) => (
                                    <tr key={t.id} className="hover:bg-brand-soft/40">
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-ink">{t.wallet?.user?.name ?? '—'}</div>
                                            <div className="text-xs text-slate-500">{t.wallet?.user?.email}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="chip bg-brand-soft text-brand">{t.type}</span>
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-ink">
                                            ${Number(t.amount).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-4 text-slate-700">${Number(t.balance_after).toFixed(2)}</td>
                                        <td className="max-w-xs truncate px-5 py-4 text-slate-600">{t.description ?? '—'}</td>
                                        <td className="px-5 py-4 text-slate-500">{new Date(t.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
