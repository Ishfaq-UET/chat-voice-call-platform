import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps, Paginated, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type Item = {
    id: number;
    amount: number | string;
    status: string;
    bank_name?: string | null;
    bank_account?: string | null;
    bank_holder?: string | null;
    user: User;
    created_at: string;
};

export default function AdminWithdrawals({
    withdrawals,
}: PageProps<{ withdrawals: Paginated<Item> }>) {
    const [rejectId, setRejectId] = useState<number | null>(null);
    const rejectForm = useForm({ admin_notes: '' });

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

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Withdrawals</h2>}>
            <Head title="Admin Withdrawals" />
            <div className="mx-auto max-w-5xl space-y-4 px-4 py-8">
                {withdrawals.data.map((w) => (
                    <div key={w.id} className="rounded-xl bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold">{w.user.name} · ${Number(w.amount).toFixed(2)}</p>
                                <p className="text-sm text-slate-500 capitalize">{w.status}</p>
                                <p className="mt-1 text-sm text-slate-600">
                                    {w.bank_holder} · {w.bank_name} · {w.bank_account}
                                </p>
                            </div>
                            {w.status === 'pending' && (
                                <div className="flex gap-2">
                                    <Link href={route('admin.withdrawals.approve', w.id)} method="post" as="button" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white">
                                        Mark paid
                                    </Link>
                                    <button onClick={() => setRejectId(w.id)} className="rounded-lg bg-slate-200 px-3 py-2 text-sm">
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                        {rejectId === w.id && (
                            <form onSubmit={submitReject} className="mt-4 flex gap-2">
                                <input
                                    value={rejectForm.data.admin_notes}
                                    onChange={(e) => rejectForm.setData('admin_notes', e.target.value)}
                                    placeholder="Reason"
                                    className="flex-1 rounded-md border-slate-300 shadow-sm"
                                    required
                                />
                                <button className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white">Confirm reject</button>
                            </form>
                        )}
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
