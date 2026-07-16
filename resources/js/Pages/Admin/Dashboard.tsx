import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

export default function AdminDashboard({
    stats,
}: PageProps<{
    stats: {
        users: number;
        males: number;
        females: number;
        pending_verifications: number;
        pending_withdrawals: number;
        revenue: number;
        commission: number;
        call_minutes: number;
    };
}>) {
    const cards = [
        ['Users', stats.users],
        ['Males', stats.males],
        ['Females', stats.females],
        ['Pending verifications', stats.pending_verifications],
        ['Pending withdrawals', stats.pending_withdrawals],
        ['Gross revenue', `$${Number(stats.revenue).toFixed(2)}`],
        ['Commission', `$${Number(stats.commission).toFixed(2)}`],
        ['Call minutes', stats.call_minutes],
    ] as const;

    return (
        <AdminLayout header={<h2 className="text-xl font-extrabold text-ink">Admin overview</h2>}>
            <Head title="Admin" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map(([label, value]) => (
                        <div key={label} className="card-soft p-5">
                            <p className="text-sm font-medium text-slate-500">{label}</p>
                            <p className="mt-2 text-2xl font-extrabold text-ink">{value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
