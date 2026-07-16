import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function AdminSettings({
    settings,
}: PageProps<{ settings: { commission_percent: number; min_withdrawal: number } }>) {
    const form = useForm({
        commission_percent: settings.commission_percent,
        min_withdrawal: settings.min_withdrawal,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('admin.settings.update'));
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold text-slate-800">Settings</h2>}>
            <Head title="Settings" />
            <form onSubmit={submit} className="mx-auto max-w-lg space-y-4 px-4 py-8">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                    <label className="block text-sm text-slate-700">Commission %</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="90"
                        value={form.data.commission_percent}
                        onChange={(e) => form.setData('commission_percent', Number(e.target.value))}
                        className="mt-1 w-full rounded-md border-slate-300 shadow-sm"
                    />
                    <label className="mt-4 block text-sm text-slate-700">Minimum withdrawal</label>
                    <input
                        type="number"
                        step="0.01"
                        min="1"
                        value={form.data.min_withdrawal}
                        onChange={(e) => form.setData('min_withdrawal', Number(e.target.value))}
                        className="mt-1 w-full rounded-md border-slate-300 shadow-sm"
                    />
                    <button className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" disabled={form.processing}>
                        Save settings
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
