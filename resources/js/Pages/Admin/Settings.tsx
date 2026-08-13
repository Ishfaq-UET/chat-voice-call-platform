import AdminFormSection from '@/Components/Admin/AdminFormSection';
import { AdminField, AdminInput } from '@/Components/Admin/AdminField';
import { IconArrowLeft, IconSettings } from '@/Components/Admin/AdminIcons';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ChangeEvent, FormEventHandler, useMemo, useState } from 'react';

type BrandingSettings = {
    commission_percent: number;
    min_withdrawal: number;
    manual_topup_instructions: string;
    logo_url: string | null;
    favicon_url: string | null;
};

function BrandingUploadCard({
    title,
    description,
    accept,
    previewUrl,
    previewKind,
    error,
    onChange,
}: {
    title: string;
    description: string;
    accept: string;
    previewUrl: string | null;
    previewKind: 'logo' | 'favicon';
    error?: string;
    onChange: (file: File | null) => void;
}) {
    return (
        <div className="rounded-2xl border border-brand/10 bg-canvas/60 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                    className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-brand/10 bg-white shadow-sm ${
                        previewKind === 'favicon' ? 'h-16 w-16' : 'h-20 w-20'
                    }`}
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={title}
                            className={
                                previewKind === 'favicon'
                                    ? 'h-10 w-10 object-contain'
                                    : 'h-full w-full object-contain p-2'
                            }
                        />
                    ) : (
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
                            None
                        </span>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-ink">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-brand/15 bg-white px-3.5 py-2 text-sm font-bold text-brand shadow-sm transition hover:bg-brand-soft">
                        Choose file
                        <input
                            type="file"
                            accept={accept}
                            className="sr-only"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                onChange(e.target.files?.[0] ?? null);
                            }}
                        />
                    </label>
                    {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default function AdminSettings({
    settings,
}: PageProps<{
    settings: BrandingSettings;
}>) {
    const flash = usePage<PageProps>().props.flash;
    const form = useForm<{
        commission_percent: number;
        min_withdrawal: number;
        manual_topup_instructions: string;
        logo: File | null;
        favicon: File | null;
    }>({
        commission_percent: settings.commission_percent,
        min_withdrawal: settings.min_withdrawal,
        manual_topup_instructions: settings.manual_topup_instructions,
        logo: null,
        favicon: null,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

    const logoDisplay = useMemo(
        () => logoPreview ?? settings.logo_url,
        [logoPreview, settings.logo_url],
    );
    const faviconDisplay = useMemo(
        () => faviconPreview ?? settings.favicon_url,
        [faviconPreview, settings.favicon_url],
    );

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('admin.settings.update'), { forceFormData: true });
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
                            Configure branding, commission, withdrawals, and manual top-up instructions.
                        </p>
                    </div>
                    <Link href={route('admin.dashboard')} className="btn-ghost self-start px-4 py-2.5">
                        <IconArrowLeft />
                        Back to Overview
                    </Link>
                </div>

                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                        {flash.success}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <AdminFormSection
                        title="Branding"
                        description="Upload your website logo and favicon. These appear in the browser tab, admin panel, and member site."
                    >
                        <div className="grid gap-4 lg:grid-cols-2">
                            <BrandingUploadCard
                                title="Website logo"
                                description="PNG, JPG, WebP, or SVG. Shown in the header, admin sidebar, and login screens. Max 2 MB."
                                accept="image/png,image/jpeg,image/webp,image/svg+xml,.svg"
                                previewUrl={logoDisplay}
                                previewKind="logo"
                                error={form.errors.logo}
                                onChange={(file) => {
                                    form.setData('logo', file);
                                    setLogoPreview(file ? URL.createObjectURL(file) : null);
                                }}
                            />
                            <BrandingUploadCard
                                title="Favicon"
                                description="ICO, PNG, or SVG. Shown in browser tabs and bookmarks. Square images work best. Max 1 MB."
                                accept="image/x-icon,image/png,image/jpeg,image/webp,image/svg+xml,.ico,.png,.svg"
                                previewUrl={faviconDisplay}
                                previewKind="favicon"
                                error={form.errors.favicon}
                                onChange={(file) => {
                                    form.setData('favicon', file);
                                    setFaviconPreview(file ? URL.createObjectURL(file) : null);
                                }}
                            />
                        </div>
                    </AdminFormSection>

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

                    <AdminFormSection
                        title="Manual top-up instructions"
                        description="Shown on the member Wallet page. Include bank name, account number, and any payment notes."
                    >
                        <AdminField label="Payment instructions" required>
                            <textarea
                                value={form.data.manual_topup_instructions}
                                onChange={(e) => form.setData('manual_topup_instructions', e.target.value)}
                                rows={6}
                                className="w-full rounded-2xl border-brand/15 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm placeholder:text-slate-400 focus:border-brand focus:ring-brand"
                                placeholder={'Bank: ...\nAccount: ...\nAccount holder: ...'}
                                required
                            />
                        </AdminField>
                    </AdminFormSection>

                    <div className="flex justify-end gap-3">
                        <Link href={route('admin.dashboard')} className="btn-ghost px-5 py-2.5">
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
