import AdminFormSection from '@/Components/Admin/AdminFormSection';
import { AdminField, AdminInput, AdminSelect } from '@/Components/Admin/AdminField';
import CountryCombobox from '@/Components/CountryCombobox';
import { IconArrowLeft, IconUserPlus } from '@/Components/Admin/AdminIcons';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type CountryOption = { code: string; name: string; label: string };

export default function AdminUsersCreate({
    countries = [],
}: PageProps<{ countries?: CountryOption[] }>) {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'male',
        country_code: countries[0]?.code ?? 'US',
        bio: '',
        is_banned: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('admin.users.store'));
    };

    return (
        <AdminLayout header="Create User">
            <Head title="Create User" />
            <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 lg:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                                <IconUserPlus />
                            </span>
                            Create New User
                        </h1>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Add a member or creator account. They can sign in with the email and password you set.
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
                                    placeholder="e.g. John Smith"
                                    required
                                />
                                <InputError message={form.errors.name} className="mt-1.5" />
                            </AdminField>
                            <AdminField label="Email Address" required>
                                <AdminInput
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    placeholder="user@example.com"
                                    required
                                />
                                <InputError message={form.errors.email} className="mt-1.5" />
                            </AdminField>
                            <AdminField label="Phone Number">
                                <AdminInput
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    placeholder="+1 555 000 0000"
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
                            <div className="sm:col-span-2">
                                <CountryCombobox
                                    countries={countries}
                                    value={form.data.country_code}
                                    onChange={(code) => form.setData('country_code', code)}
                                    error={form.errors.country_code}
                                />
                            </div>
                            <AdminField label="Password" required>
                                <AdminInput
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <InputError message={form.errors.password} className="mt-1.5" />
                            </AdminField>
                            <AdminField label="Confirm Password" required>
                                <AdminInput
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </AdminField>
                        </div>
                    </AdminFormSection>

                    <AdminFormSection title="Profile" description="Optional bio shown on the creator or member profile.">
                        <AdminField label="Bio">
                            <textarea
                                value={form.data.bio}
                                onChange={(e) => form.setData('bio', e.target.value)}
                                rows={4}
                                placeholder="Short introduction..."
                                className="w-full rounded-2xl border-brand/15 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm placeholder:text-slate-400 focus:border-brand focus:ring-brand"
                            />
                            <InputError message={form.errors.bio} className="mt-1.5" />
                        </AdminField>
                        <label className="mt-5 flex items-center gap-2.5 text-sm font-semibold text-ink">
                            <input
                                type="checkbox"
                                checked={form.data.is_banned}
                                onChange={(e) => form.setData('is_banned', e.target.checked)}
                                className="rounded border-brand/20 text-brand focus:ring-brand"
                            />
                            Ban this user immediately
                        </label>
                    </AdminFormSection>

                    <div className="flex justify-end gap-3">
                        <Link href={route('admin.users')} className="btn-ghost px-5 py-2.5">
                            Cancel
                        </Link>
                        <button type="submit" disabled={form.processing} className="btn-brand px-5 py-2.5 disabled:opacity-60">
                            Create user
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
