import AdminPageBanner from '@/Components/Admin/AdminPageBanner';
import { IconPlus, IconWallet } from '@/Components/Admin/AdminIcons';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

type MethodRow = {
    id: number;
    name: string;
    country_code: string;
    country_name: string;
    account_title: string;
    bank_name: string | null;
    account_number: string;
    extra_instructions: string | null;
    is_active: boolean;
    sort_order: number;
};

export default function AdminPaymentMethodsIndex({
    methods,
}: PageProps<{ methods: MethodRow[] }>) {
    return (
        <AdminLayout header="Payment methods">
            <Head title="Payment methods" />
            <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 lg:px-6">
                <AdminPageBanner
                    eyebrow={
                        <>
                            <IconWallet />
                            Manual top-up
                        </>
                    }
                    title="Payment methods"
                    description="Add JazzCash, Paytm, bank accounts, and other local methods. Each one is shown only to users in that country."
                    meta={`${methods.length} total`}
                    actions={
                        <Link
                            href={route('admin.payment-methods.create')}
                            className="btn-brand inline-flex items-center gap-2 px-4 py-2.5"
                        >
                            <IconPlus />
                            New method
                        </Link>
                    }
                />

                {methods.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-brand/20 bg-white px-6 py-16 text-center">
                        <p className="text-lg font-extrabold text-ink">No payment methods yet</p>
                        <p className="mt-2 text-sm text-slate-500">
                            Add JazzCash for Pakistan, Paytm for India, and so on. Members only see methods for their country.
                        </p>
                        <Link
                            href={route('admin.payment-methods.create')}
                            className="btn-brand mt-6 inline-flex px-5 py-2.5"
                        >
                            Add first method
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {methods.map((method) => (
                            <div
                                key={method.id}
                                className="flex flex-col gap-4 rounded-3xl border border-brand/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                                                method.is_active
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {method.is_active ? 'Active' : 'Off'}
                                        </span>
                                        <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-bold text-brand">
                                            {method.country_name} ({method.country_code})
                                        </span>
                                    </div>
                                    <p className="mt-1.5 text-base font-extrabold text-ink">{method.name}</p>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        {method.account_title}
                                        {method.bank_name ? ` · ${method.bank_name}` : ''}
                                    </p>
                                    <p className="mt-0.5 font-mono text-sm font-semibold text-ink">
                                        {method.account_number}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.post(route('admin.payment-methods.toggle', method.id))
                                        }
                                        className="btn-ghost px-3 py-2 text-sm"
                                    >
                                        {method.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <Link
                                        href={route('admin.payment-methods.edit', method.id)}
                                        className="rounded-2xl bg-brand-soft px-3 py-2 text-sm font-bold text-brand"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('Delete this payment method?')) {
                                                router.delete(route('admin.payment-methods.destroy', method.id));
                                            }
                                        }}
                                        className="rounded-2xl px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
