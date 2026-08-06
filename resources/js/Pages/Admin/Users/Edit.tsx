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

export default function AdminUsersEdit({ user }: PageProps<{ user: AdminUser }>) {
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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(route('admin.users.update', user.id));
    };

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
                        {user.wallet && (
                            <p className="mt-4 text-sm text-slate-500">
                                Wallet balance:{' '}
                                <span className="font-bold text-ink">${Number(user.wallet.balance).toFixed(2)}</span>
                            </p>
                        )}
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
            </div>
        </AdminLayout>
    );
}
