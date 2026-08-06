import AdminPageBanner from '@/Components/Admin/AdminPageBanner';
import { AdminInput } from '@/Components/Admin/AdminField';
import { IconWallet } from '@/Components/Admin/AdminIcons';
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

    const total = withdrawals.total ?? withdrawals.data.length;

    return (
        <AdminLayout header="Withdrawals">
            <Head title="Admin Withdrawals" />
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 lg:px-6">
                <AdminPageBanner
                    eyebrow={
                        <>
                            <IconWallet />
                            Payouts
                        </>
                    }
                    title="Withdrawals"
                    description="Review and process creator withdrawal requests."
                    meta={`${total} request${total === 1 ? '' : 's'} shown`}
                />

                <div className="overflow-hidden rounded-[28px] border border-brand/10 bg-white shadow-card">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-brand/10 bg-canvas text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                    <th className="px-5 py-3.5 sm:px-6">User</th>
                                    <th className="px-5 py-3.5 sm:px-6">Amount</th>
                                    <th className="px-5 py-3.5 sm:px-6">Bank details</th>
                                    <th className="px-5 py-3.5 sm:px-6">Status</th>
                                    <th className="px-5 py-3.5 text-right sm:px-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand/10">
                                {withdrawals.data.map((w) => (
                                    <tr key={w.id} className="align-top transition hover:bg-brand-soft/40">
                                        <td className="px-5 py-4 sm:px-6">
                                            <div className="font-bold text-ink">{w.user.name}</div>
                                            <div className="text-xs text-slate-500">{w.user.email}</div>
                                        </td>
                                        <td className="px-5 py-4 font-extrabold text-ink sm:px-6">
                                            ${Number(w.amount).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 sm:px-6">
                                            <div className="font-semibold text-ink">{w.bank_holder}</div>
                                            <div className="text-xs">
                                                {w.bank_name} · {w.bank_account}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 sm:px-6">
                                            <span className="chip bg-brand-soft text-brand capitalize">
                                                {w.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right sm:px-6">
                                            {w.status === 'pending' && (
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={route('admin.withdrawals.approve', w.id)}
                                                            method="post"
                                                            as="button"
                                                            className="rounded-2xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                                                        >
                                                            Mark paid
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRejectId(w.id)}
                                                            className="rounded-2xl border-2 border-brand/20 bg-white px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand-soft"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                    {rejectId === w.id && (
                                                        <form
                                                            onSubmit={submitReject}
                                                            className="flex w-full max-w-xs flex-col gap-2"
                                                        >
                                                            <AdminInput
                                                                value={rejectForm.data.admin_notes}
                                                                onChange={(e) =>
                                                                    rejectForm.setData('admin_notes', e.target.value)
                                                                }
                                                                placeholder="Reason"
                                                                required
                                                            />
                                                            <button
                                                                type="submit"
                                                                className="rounded-2xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700"
                                                            >
                                                                Confirm reject
                                                            </button>
                                                        </form>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {withdrawals.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-slate-500 sm:px-6">
                                            No withdrawal requests.
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
