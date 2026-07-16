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

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Verifications</h2>}>
            <Head title="Verifications" />
            <div className="mx-auto max-w-5xl space-y-4 px-4 py-8">
                {requests.data.map((item) => (
                    <div key={item.id} className="rounded-xl bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="font-semibold text-slate-900">{item.user.name}</p>
                                <p className="text-sm text-slate-500">{item.user.email}</p>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('admin.verifications.approve', item.id)} method="post" as="button" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white">
                                    Approve
                                </Link>
                                <button onClick={() => setRejectId(item.id)} className="rounded-lg bg-slate-200 px-3 py-2 text-sm">
                                    Reject
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-4">
                            {item.selfie_url && <img src={item.selfie_url} alt="Selfie" className="h-40 rounded-lg object-cover" />}
                            {item.id_photo_url && <img src={item.id_photo_url} alt="ID" className="h-40 rounded-lg object-cover" />}
                        </div>
                        {rejectId === item.id && (
                            <form onSubmit={submitReject} className="mt-4 flex gap-2">
                                <input
                                    value={rejectForm.data.rejection_reason}
                                    onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                    placeholder="Rejection reason"
                                    className="flex-1 rounded-md border-slate-300 shadow-sm"
                                    required
                                />
                                <button className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white">Confirm</button>
                            </form>
                        )}
                    </div>
                ))}
                {requests.data.length === 0 && <p className="text-center text-slate-500">No pending verifications.</p>}
            </div>
        </AdminLayout>
    );
}
