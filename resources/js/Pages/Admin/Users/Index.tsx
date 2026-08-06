import AdminPageBanner from '@/Components/Admin/AdminPageBanner';
import { AdminField, AdminInput, AdminSelect } from '@/Components/Admin/AdminField';
import { IconPlus, IconSearch, IconUsersGroup } from '@/Components/Admin/AdminIcons';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps, Paginated, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type AdminUser = User & { wallet?: { balance: number | string }; phone?: string | null };

export default function AdminUsersIndex({
    users,
    filters,
}: PageProps<{ users: Paginated<AdminUser>; filters: { role?: string; q?: string } }>) {
    const [q, setQ] = useState(filters.q ?? '');
    const [role, setRole] = useState(filters.role ?? '');

    const search = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users'), { q: q || undefined, role: role || undefined }, { preserveState: true });
    };

    const destroy = (user: AdminUser) => {
        if (!confirm(`Delete ${user.name}? This cannot be undone.`)) {
            return;
        }
        router.delete(route('admin.users.destroy', user.id));
    };

    const total = users.total ?? users.data.length;
    const from = users.from ?? (users.data.length ? 1 : 0);
    const to = users.to ?? users.data.length;

    return (
        <AdminLayout header="Users">
            <Head title="Admin Users" />
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 lg:px-6">
                <AdminPageBanner
                    eyebrow={
                        <>
                            <IconUsersGroup />
                            User management
                        </>
                    }
                    title="Users"
                    description="View and manage user accounts, roles, and access on the platform."
                    meta={`${total} user${total === 1 ? '' : 's'} in your list`}
                    actions={
                        <Link
                            href={route('admin.users.create')}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-extrabold text-brand shadow-sm transition hover:bg-brand-soft"
                        >
                            <IconPlus />
                            Add User
                        </Link>
                    }
                />

                <div className="overflow-hidden rounded-[28px] border border-brand/10 bg-white shadow-card">
                    <div className="border-b border-brand/10 px-5 py-5 sm:px-6">
                        <div className="mb-4 flex items-center gap-2">
                            <IconSearch className="text-brand" />
                            <h2 className="text-sm font-extrabold text-ink">Search &amp; Filters</h2>
                        </div>
                        <form onSubmit={search} className="space-y-3">
                            <div className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
                                <AdminField label="Search">
                                    <AdminInput
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="Search by name, email, or phone..."
                                    />
                                </AdminField>
                                <AdminField label="Role">
                                    <AdminSelect value={role} onChange={(e) => setRole(e.target.value)}>
                                        <option value="">All roles</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </AdminSelect>
                                </AdminField>
                                <div className="flex items-end">
                                    <button type="submit" className="btn-brand w-full px-5 py-2.5 lg:w-auto">
                                        Apply filters
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-brand/10 bg-canvas text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                    <th className="px-5 py-3.5 sm:px-6">Name</th>
                                    <th className="px-5 py-3.5 sm:px-6">Role</th>
                                    <th className="px-5 py-3.5 sm:px-6">Verification</th>
                                    <th className="px-5 py-3.5 sm:px-6">Wallet</th>
                                    <th className="px-5 py-3.5 sm:px-6">Status</th>
                                    <th className="px-5 py-3.5 text-right sm:px-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand/10">
                                {users.data.map((u) => (
                                    <tr key={u.id} className="transition hover:bg-brand-soft/40">
                                        <td className="px-5 py-4 sm:px-6">
                                            <div className="font-bold text-ink">{u.name}</div>
                                            <div className="text-xs text-slate-500">{u.email}</div>
                                            {u.phone && <div className="text-xs text-slate-400">{u.phone}</div>}
                                        </td>
                                        <td className="px-5 py-4 capitalize text-slate-700 sm:px-6">{u.role}</td>
                                        <td className="px-5 py-4 sm:px-6">
                                            <span className="chip bg-brand-soft text-brand capitalize">
                                                {u.verification_status ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-ink sm:px-6">
                                            ${Number(u.wallet?.balance ?? 0).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-4 sm:px-6">
                                            {u.is_banned ? (
                                                <span className="inline-flex rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                                                    Banned
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 sm:px-6">
                                            <div className="flex flex-wrap items-center justify-end gap-3">
                                                <Link
                                                    href={route('admin.users.edit', u.id)}
                                                    className="text-sm font-bold text-brand hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={route('admin.users.ban', u.id)}
                                                    method="post"
                                                    as="button"
                                                    className="text-sm font-semibold text-slate-600 hover:underline"
                                                >
                                                    {u.is_banned ? 'Unban' : 'Ban'}
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => destroy(u)}
                                                    className="text-sm font-semibold text-rose-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-500 sm:px-6">
                                            No users match your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-brand/10 px-5 py-3.5 text-sm text-slate-500 sm:px-6">
                        Showing {from} – {to} of {total} users
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
