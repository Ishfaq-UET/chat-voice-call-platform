import AdminPageBanner from '@/Components/Admin/AdminPageBanner';
import { AdminInput } from '@/Components/Admin/AdminField';
import { IconShield } from '@/Components/Admin/AdminIcons';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps, Paginated, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type RequestItem = {
    id: number;
    status: string;
    selfie_url?: string | null;
    id_photo_url?: string | null;
    user: User;
};

export default function AdminVerifications({
    requests,
}: PageProps<{ requests: Paginated<RequestItem> }>) {
    const [rejectId, setRejectId] = useState<number | null>(null);
    const rejectForm = useForm({ rejection_reason: '' });

    const submitReject: FormEventHandler = (e) => {
        e.preventDefault();
        if (!rejectId) return;
        rejectForm.post(route('admin.verifications.reject', rejectId), {
            onSuccess: () => {
                setRejectId(null);
                rejectForm.reset();
            },
        });
    };

    const total = requests.total ?? requests.data.length;

    return (
        <AdminLayout header="Verifications">
            <Head title="Verifications" />
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 lg:px-6">
                <AdminPageBanner
                    eyebrow={
                        <>
                            <IconShield />
                            Identity review
                        </>
                    }
                    title="Verifications"
                    description="Review pending identity submissions and approve or reject creators."
                    meta={`${total} pending request${total === 1 ? '' : 's'}`}
                />

                <div className="space-y-4">
                    {requests.data.map((item) => (
                        <div
                            key={item.id}
                            className="card-soft p-5 sm:p-6"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-base font-extrabold text-ink">{item.user.name}</p>
                                    <p className="text-sm text-slate-500">{item.user.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={route('admin.verifications.approve', item.id)}
                                        method="post"
                                        as="button"
                                        className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
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
                            </div>
                            <div className="mt-4 flex flex-wrap gap-4">
                                {item.selfie_url && (
                                    <img
                                        src={item.selfie_url}
                                        alt="Selfie"
                                        className="h-40 rounded-2xl object-cover ring-1 ring-brand/10"
                                    />
                                )}
                                {item.id_photo_url && (
                                    <img
                                        src={item.id_photo_url}
                                        alt="ID"
                                        className="h-40 rounded-2xl object-cover ring-1 ring-brand/10"
                                    />
                                )}
                            </div>
                            {rejectId === item.id && (
                                <form onSubmit={submitReject} className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <AdminInput
                                        value={rejectForm.data.rejection_reason}
                                        onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                        placeholder="Rejection reason"
                                        required
                                        className="flex-1"
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700"
                                    >
                                        Confirm
                                    </button>
                                </form>
                            )}
                        </div>
                    ))}
                    {requests.data.length === 0 && (
                        <div className="rounded-[28px] border border-dashed border-brand/20 bg-white px-6 py-16 text-center text-slate-500">
                            No pending verifications.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
