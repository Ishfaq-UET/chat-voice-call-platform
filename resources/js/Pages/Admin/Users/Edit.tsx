import AdminFormSection from '@/Components/Admin/AdminFormSection';
import { AdminField, AdminInput, AdminSelect } from '@/Components/Admin/AdminField';
import { IconArrowLeft, IconUsers } from '@/Components/Admin/AdminIcons';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type AdminUser = User & {
    phone?: string | null;
    bio?: string | null;
    wallet?: { balance: number | string };
};

type Txn = {
    id: number;
    type: string;
    amount: number | string;
    balance_after: number | string;
    description?: string | null;
    created_at: string;
};

export default function AdminUsersEdit({
    user,
    recentTransactions = [],
}: PageProps<{ user: AdminUser; recentTransactions?: Txn[] }>) {
    const form = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        password: '',
        password_confirmation: '',
        role: user.role === 'female' ? 'female' : 'male',
        bio: user.bio ?? '',
        verification_status: user.verification_status ?? 'unverified',
        is_banned: Boolean(user.is_banned),
    });

    const walletForm = useForm({
        amount: 20,
        direction: 'credit' as 'credit' | 'debit',
        note: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(route('admin.users.update', user.id));
    };

    const submitWallet: FormEventHandler = (e) => {
        e.preventDefault();
        walletForm.post(route('admin.users.wallet', user.id), {
            preserveScroll: true,
            onSuccess: () => walletForm.setData({ amount: 20, direction: 'credit', note: '' }),
        });
    };

    const balance = Number(user.wallet?.balance ?? 0);

    return (
        <AdminLayout header="Edit User">
            <Head title={`Edit ${user.name}`} />
            <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 lg:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                                <IconUsers />
                            </span>
                            Edit User
                        </h1>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Update account details for {user.name}. Leave password blank to keep the current one.
                        </p>
                    </div>
                    <Link href={route('admin.users')} className="btn-ghost self-start px-4 py-2.5">
                        <IconArrowLeft />
                        Back to Users
                    </Link>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <AdminFormSection
                        title="Account Details"
                        description="Primary contact and login credentials for this user."
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <AdminField label="Full Name" required>
                                <AdminInput
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={form.errors.name} className="mt-1.5" />
                            </AdminField>
                            <AdminField label="Email Address" required>
                                <AdminInput
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={form.errors.email} className="mt-1.5" />
                            </AdminField>
                            <AdminField label="Phone Number">
                                <AdminInput
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                />
                                <InputError message={form.errors.phone} className="mt-1.5" />
                            </AdminField>
                            <AdminField label="Role" required>
                                <AdminSelect
                                    value={form.data.role}
                                    onChange={(e) => form.setData('role', e.target.value)}
                                >
                                    <option value="male">Male (member)</option>
                                    <option value="female">Female (creator)</option>
                                </AdminSelect>
                                <InputError message={form.errors.role} className="mt-1.5" />
                            </AdminField>
                            <AdminField label="New Password" hint="Optional — leave blank to keep current password.">
                                <AdminInput
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                                <InputError message={form.errors.password} className="mt-1.5" />
                            </AdminField>
                            <AdminField label="Confirm New Password">
                                <AdminInput
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                            </AdminField>
                        </div>
                    </AdminFormSection>

                    <AdminFormSection title="Status & Profile" description="Moderation and profile fields.">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <AdminField label="Verification status" required>
                                <AdminSelect
                                    value={form.data.verification_status}
                                    onChange={(e) => form.setData('verification_status', e.target.value)}
                                >
                                    <option value="unverified">Unverified</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </AdminSelect>
                                <InputError message={form.errors.verification_status} className="mt-1.5" />
                            </AdminField>
                            <div className="flex items-end pb-2">
                                <label className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_banned}
                                        onChange={(e) => form.setData('is_banned', e.target.checked)}
                                        className="rounded border-brand/20 text-brand focus:ring-brand"
                                    />
                                    Banned
                                </label>
                            </div>
                        </div>
                        <div className="mt-5">
                            <AdminField label="Bio">
                                <textarea
                                    value={form.data.bio}
                                    onChange={(e) => form.setData('bio', e.target.value)}
                                    rows={4}
                                    className="w-full rounded-2xl border-brand/15 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm placeholder:text-slate-400 focus:border-brand focus:ring-brand"
                                />
                                <InputError message={form.errors.bio} className="mt-1.5" />
                            </AdminField>
                        </div>
                    </AdminFormSection>

                    <div className="flex justify-end gap-3">
                        <Link href={route('admin.users')} className="btn-ghost px-5 py-2.5">
                            Cancel
                        </Link>
                        <button type="submit" disabled={form.processing} className="btn-brand px-5 py-2.5 disabled:opacity-60">
                            Save changes
                        </button>
                    </div>
                </form>

                <AdminFormSection
                    title="Manual wallet payment"
                    description="Add or remove wallet balance manually (cash / bank received offline)."
                >
                    <div className="mb-5 rounded-2xl bg-canvas px-4 py-3">
                        <p className="text-sm text-slate-500">Current balance</p>
                        <p className="text-2xl font-extrabold text-ink">${balance.toFixed(2)}</p>
                    </div>

                    <form onSubmit={submitWallet} className="grid gap-4 sm:grid-cols-2">
                        <AdminField label="Action" required>
                            <AdminSelect
                                value={walletForm.data.direction}
                                onChange={(e) =>
                                    walletForm.setData('direction', e.target.value as 'credit' | 'debit')
                                }
                            >
                                <option value="credit">Add money (top-up)</option>
                                <option value="debit">Deduct money</option>
                            </AdminSelect>
                        </AdminField>
                        <AdminField label="Amount" required>
                            <AdminInput
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={walletForm.data.amount}
                                onChange={(e) => walletForm.setData('amount', Number(e.target.value))}
                                required
                            />
                            <InputError message={walletForm.errors.amount} className="mt-1.5" />
                        </AdminField>
                        <div className="sm:col-span-2">
                            <AdminField label="Note / payment reference">
                                <AdminInput
                                    value={walletForm.data.note}
                                    onChange={(e) => walletForm.setData('note', e.target.value)}
                                    placeholder="e.g. Cash received / bank transfer ID"
                                />
                                <InputError message={walletForm.errors.note} className="mt-1.5" />
                            </AdminField>
                        </div>
                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                disabled={walletForm.processing}
                                className={`rounded-2xl px-5 py-2.5 text-sm font-extrabold text-white shadow-soft disabled:opacity-60 ${
                                    walletForm.data.direction === 'credit'
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : 'bg-rose-600 hover:bg-rose-700'
                                }`}
                            >
                                {walletForm.data.direction === 'credit' ? 'Add to wallet' : 'Deduct from wallet'}
                            </button>
                        </div>
                    </form>

                    {recentTransactions.length > 0 && (
                        <div className="mt-6 overflow-hidden rounded-2xl border border-brand/10">
                            <div className="border-b border-brand/10 bg-canvas px-4 py-3 text-sm font-bold text-ink">
                                Recent wallet activity
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-4 py-2.5">Type</th>
                                            <th className="px-4 py-2.5">Amount</th>
                                            <th className="px-4 py-2.5">Balance</th>
                                            <th className="px-4 py-2.5">When</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand/10">
                                        {recentTransactions.map((t) => (
                                            <tr key={t.id}>
                                                <td className="px-4 py-2.5">
                                                    <span className="chip bg-brand-soft text-brand">{t.type}</span>
                                                    {t.description && (
                                                        <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                                                            {t.description}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5 font-semibold text-ink">
                                                    ${Number(t.amount).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-600">
                                                    ${Number(t.balance_after).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-500">
                                                    {new Date(t.created_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </AdminFormSection>
            </div>
        </AdminLayout>
    );
}
