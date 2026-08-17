import AdminFormSection from '@/Components/Admin/AdminFormSection';
import { AdminField, AdminInput } from '@/Components/Admin/AdminField';
import { IconArrowLeft } from '@/Components/Admin/AdminIcons';
import CountryCombobox, { CountryOption } from '@/Components/CountryCombobox';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type MethodFormData = {
    id: number;
    name: string;
    country_code: string;
    account_title: string;
    bank_name: string;
    account_number: string;
    extra_instructions: string;
    is_active: boolean;
    sort_order: number;
};

export default function AdminPaymentMethodForm({
    method,
    countries,
}: PageProps<{
    method: MethodFormData | null;
    countries: CountryOption[];
}>) {
    const editing = Boolean(method);
    const form = useForm({
        name: method?.name ?? '',
        country_code: method?.country_code ?? countries.find((c) => c.code === 'PK')?.code ?? countries[0]?.code ?? 'PK',
        account_title: method?.account_title ?? '',
        bank_name: method?.bank_name ?? '',
        account_number: method?.account_number ?? '',
        extra_instructions: method?.extra_instructions ?? '',
        is_active: method?.is_active ?? true,
        sort_order: method?.sort_order ?? 0,
        ...(editing ? { _method: 'put' as const } : {}),
    });

    const save: FormEventHandler = (e) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            is_active: data.is_active ? '1' : '0',
        }));

        if (editing && method) {
            form.post(route('admin.payment-methods.update', method.id));
            return;
        }
        form.post(route('admin.payment-methods.store'));
    };

    return (
        <AdminLayout header={editing ? 'Edit payment method' : 'New payment method'}>
            <Head title={editing ? 'Edit payment method' : 'New payment method'} />
            <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 lg:px-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-ink">
                            {editing ? 'Edit payment method' : 'Add payment method'}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            This method is shown only to members whose profile country matches the country you select.
                        </p>
                    </div>
                    <Link href={route('admin.payment-methods')} className="btn-ghost self-start px-4 py-2.5">
                        <IconArrowLeft />
                        Back
                    </Link>
                </div>

                <form onSubmit={save} className="space-y-5">
                    <AdminFormSection title="Method" description="Name and country this account belongs to.">
                        <div className="space-y-4">
                            <AdminField label="Method name" required>
                                <AdminInput
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="JazzCash, Paytm, HBL, Wise…"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="mt-1 text-xs font-semibold text-rose-600">{form.errors.name}</p>
                                )}
                            </AdminField>

                            <CountryCombobox
                                label="Country"
                                countries={countries}
                                value={form.data.country_code}
                                onChange={(code) => form.setData('country_code', code)}
                                error={form.errors.country_code}
                                hint="Only users in this country will see this method on Wallet."
                            />
                        </div>
                    </AdminFormSection>

                    <AdminFormSection
                        title="Account details"
                        description="Shown to the member so they know where to send money."
                    >
                        <div className="space-y-4">
                            <AdminField label="Account title" required>
                                <AdminInput
                                    value={form.data.account_title}
                                    onChange={(e) => form.setData('account_title', e.target.value)}
                                    placeholder="Wyak Dating / Account holder name"
                                    required
                                />
                                {form.errors.account_title && (
                                    <p className="mt-1 text-xs font-semibold text-rose-600">{form.errors.account_title}</p>
                                )}
                            </AdminField>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <AdminField label="Bank / wallet name">
                                    <AdminInput
                                        value={form.data.bank_name}
                                        onChange={(e) => form.setData('bank_name', e.target.value)}
                                        placeholder="JazzCash, HBL, Paytm…"
                                    />
                                </AdminField>
                                <AdminField label="Account number / IBAN" required>
                                    <AdminInput
                                        value={form.data.account_number}
                                        onChange={(e) => form.setData('account_number', e.target.value)}
                                        placeholder="0300-0000000 or IBAN"
                                        required
                                    />
                                    {form.errors.account_number && (
                                        <p className="mt-1 text-xs font-semibold text-rose-600">
                                            {form.errors.account_number}
                                        </p>
                                    )}
                                </AdminField>
                            </div>

                            <AdminField label="Extra instructions">
                                <textarea
                                    value={form.data.extra_instructions}
                                    onChange={(e) => form.setData('extra_instructions', e.target.value)}
                                    rows={4}
                                    className="w-full rounded-2xl border-brand/15 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm placeholder:text-slate-400 focus:border-brand focus:ring-brand"
                                    placeholder="Send as ‘Bill payment’, include your name in remarks…"
                                />
                            </AdminField>
                        </div>
                    </AdminFormSection>

                    <AdminFormSection title="Display" description="Control whether members can use this method.">
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 rounded-2xl border border-brand/10 bg-white px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(e) => form.setData('is_active', e.target.checked)}
                                    className="rounded border-brand/30 text-brand focus:ring-brand"
                                />
                                <span className="text-sm font-bold text-ink">Active (show on wallet)</span>
                            </label>
                            <AdminField label="Sort order">
                                <AdminInput
                                    type="number"
                                    min="0"
                                    value={form.data.sort_order}
                                    onChange={(e) => form.setData('sort_order', Number(e.target.value))}
                                />
                            </AdminField>
                        </div>
                    </AdminFormSection>

                    <div className="flex justify-end gap-3">
                        <Link href={route('admin.payment-methods')} className="btn-ghost px-5 py-2.5">
                            Cancel
                        </Link>
                        <button type="submit" disabled={form.processing} className="btn-brand px-5 py-2.5 disabled:opacity-60">
                            {editing ? 'Save changes' : 'Create method'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
