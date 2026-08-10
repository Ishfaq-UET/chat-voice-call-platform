import AdminPageBanner from '@/Components/Admin/AdminPageBanner';
import { AdminInput } from '@/Components/Admin/AdminField';
import { IconRename } from '@/Components/Admin/AdminIcons';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps, Paginated } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type NameChange = {
    id: number;
    current_name: string;
    requested_name: string;
    status: string;
    admin_notes?: string | null;
    created_at: string;
    user: { id: number; name: string; email: string; role: string };
};

export default function AdminNameChangesIndex({
    requests,
    filters,
    counts,
}: PageProps<{
    requests: Paginated<NameChange>;
    filters: { status?: string };
    counts: { pending: number; approved: number; rejected: number };
}>) {
    const [rejectId, setRejectId] = useState<number | null>(null);
    const rejectForm = useForm({ admin_notes: '' });

    const submitReject: FormEventHandler = (e) => {
        e.preventDefault();
        if (!rejectId) return;
        rejectForm.post(route('admin.name-changes.reject', rejectId), {
            onSuccess: () => {
                setRejectId(null);
                rejectForm.reset();
            },
        });
    };

    const status = filters.status ?? 'pending';

    return (
        <AdminLayout header="Name changes">
            <Head title="Name change requests" />
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 lg:px-6">
                <AdminPageBanner
                    eyebrow={
                        <>
                            <IconRename />
                            Identity
                        </>
                    }
                    title="Name change requests"
                    description="Review display-name changes before they go live on the platform."
                    meta={`${counts.pending} pending`}
                />

                <div className="flex flex-wrap gap-2">
                    {(['pending', 'approved', 'rejected'] as const).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => router.get(route('admin.name-changes'), { status: s }, { preserveState: true })}
                            className={`rounded-2xl px-4 py-2 text-sm font-bold capitalize transition ${
                                status === s ? 'bg-brand text-white' : 'bg-white text-slate-600 ring-1 ring-brand/10'
                            }`}
                        >
                            {s} ({counts[s]})
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {requests.data.map((item) => (
                        <div key={item.id} className="card-soft p-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="font-extrabold text-ink">{item.user.name}</p>
                                    <p className="text-sm text-slate-500">
                                        {item.user.email} · <span className="capitalize">{item.user.role}</span>
                                    </p>
                                    <p className="mt-3 text-sm text-slate-600">
                                        <span className="font-semibold text-slate-400">{item.current_name}</span>
                                        <span className="mx-2 text-brand">→</span>
                                        <span className="font-bold text-ink">{item.requested_name}</span>
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</p>
                                    {item.admin_notes && (
                                        <p className="mt-2 text-sm text-rose-600">{item.admin_notes}</p>
                                    )}
                                </div>

                                {item.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Link
                                            href={route('admin.name-changes.approve', item.id)}
                                            method="post"
                                            as="button"
                                            className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                                        >
                                            Approve
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setRejectId(item.id)}
                                            className="btn-ghost px-4 py-2"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>

                            {rejectId === item.id && (
                                <form onSubmit={submitReject} className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <AdminInput
                                        value={rejectForm.data.admin_notes}
                                        onChange={(e) => rejectForm.setData('admin_notes', e.target.value)}
                                        placeholder="Rejection reason"
                                        required
                                        className="flex-1"
                                    />
                                    <button type="submit" className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white">
                                        Confirm reject
                                    </button>
                                </form>
                            )}
                        </div>
                    ))}

                    {requests.data.length === 0 && (
                        <div className="rounded-[28px] border border-dashed border-brand/20 bg-white px-6 py-16 text-center text-slate-500">
                            No {status} name change requests.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
