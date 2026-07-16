import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps, Paginated, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type AdminUser = User & { wallet?: { balance: number | string } };

export default function AdminUsers({
    users,
    filters,
}: PageProps<{ users: Paginated<AdminUser>; filters: { role?: string; q?: string } }>) {
    const [q, setQ] = useState(filters.q ?? '');
    const [role, setRole] = useState(filters.role ?? '');

    const search = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users'), { q: q || undefined, role: role || undefined }, { preserveState: true });
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Users</h2>}>
            <Head title="Admin Users" />
            <div className="mx-auto max-w-6xl px-4 py-8">
                <form onSubmit={search} className="mb-4 flex flex-wrap gap-3">
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="rounded-md border-slate-300 shadow-sm" />
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-md border-slate-300 shadow-sm">
                        <option value="">All roles</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Filter</button>
                </form>
                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Verification</th>
                                <th className="px-4 py-3">Wallet</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((u) => (
                                <tr key={u.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{u.name}</div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                    </td>
                                    <td className="px-4 py-3 capitalize">{u.role}</td>
                                    <td className="px-4 py-3 capitalize">{u.verification_status}</td>
                                    <td className="px-4 py-3">${Number(u.wallet?.balance ?? 0).toFixed(2)}</td>
                                    <td className="px-4 py-3">{u.is_banned ? 'Banned' : 'Active'}</td>
                                    <td className="px-4 py-3">
                                        <Link href={route('admin.users.ban', u.id)} method="post" as="button" className="text-rose-600 hover:underline">
                                            {u.is_banned ? 'Unban' : 'Ban'}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
