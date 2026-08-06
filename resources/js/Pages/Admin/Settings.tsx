import AdminFormSection from '@/Components/Admin/AdminFormSection';
import { AdminField, AdminInput } from '@/Components/Admin/AdminField';
import { IconArrowLeft, IconSettings } from '@/Components/Admin/AdminIcons';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
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
        <AdminLayout header="Settings">
            <Head title="Settings" />
            <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 lg:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                                <IconSettings />
                            </span>
                            Platform settings
                        </h1>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Configure commission and withdrawal rules for the platform.
                        </p>
                    </div>
                    <Link
                        href={route('admin.dashboard')}
                        className="btn-ghost self-start px-4 py-2.5"
                    >
                        <IconArrowLeft />
                        Back to Overview
                    </Link>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <AdminFormSection
                        title="Revenue & payouts"
                        description="Primary commercial settings applied across calls and withdrawals."
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <AdminField label="Commission %" required>
                                <AdminInput
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="90"
                                    value={form.data.commission_percent}
                                    onChange={(e) => form.setData('commission_percent', Number(e.target.value))}
                                />
                            </AdminField>
                            <AdminField label="Minimum withdrawal" required>
                                <AdminInput
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    value={form.data.min_withdrawal}
                                    onChange={(e) => form.setData('min_withdrawal', Number(e.target.value))}
                                />
                            </AdminField>
                        </div>
                    </AdminFormSection>

                    <div className="flex justify-end gap-3">
                        <Link
                            href={route('admin.dashboard')}
                            className="btn-ghost px-5 py-2.5"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="btn-brand px-5 py-2.5 disabled:opacity-60"
                        >
                            Save settings
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
