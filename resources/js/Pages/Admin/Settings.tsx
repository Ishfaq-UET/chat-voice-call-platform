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
    logo_url: string | null;
    favicon_url: string | null;
    contact_email: string;
    whatsapp_number: string;
    whatsapp_message: string;
    mail_enabled: boolean;
    brevo_api_key_set: boolean;
    mail_from_address: string;
    mail_from_name: string;
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

function buildWhatsAppLink(number: string, message: string): string | null {
    let digits = number.replace(/\D+/g, '');
    if (digits.startsWith('00')) {
        digits = digits.slice(2);
    }
    if (!digits || digits.length < 10 || digits.length > 15 || digits.startsWith('0')) {
        return null;
    }

    const params = new URLSearchParams({ phone: digits });
    const trimmed = message.trim();
    if (trimmed) {
        params.set('text', trimmed);
    }

    return `https://api.whatsapp.com/send?${params.toString()}`;
}

function WhatsAppLinkGenerator() {
    const [number, setNumber] = useState('');
    const [message, setMessage] = useState('');
    const [copied, setCopied] = useState(false);

    const link = useMemo(() => buildWhatsAppLink(number, message), [number, message]);

    const copyLink = async () => {
        if (!link) return;

        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const input = document.createElement('textarea');
            input.value = link;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <AdminFormSection
            title="WhatsApp link generator"
            description="Enter any international number and get a shareable WhatsApp link. Click the link or Copy to use it."
        >
            <div className="grid gap-5">
                <AdminField label="WhatsApp number">
                    <AdminInput
                        type="text"
                        placeholder="923001234567"
                        value={number}
                        onChange={(e) => {
                            setCopied(false);
                            setNumber(e.target.value);
                        }}
                    />
                    <p className="mt-1.5 text-xs text-slate-400">
                        Country code + number, digits only. Example: 923001234567
                    </p>
                </AdminField>

                <AdminField label="Prefilled message (optional)">
                    <AdminInput
                        type="text"
                        placeholder="Hi, I need help with…"
                        value={message}
                        onChange={(e) => {
                            setCopied(false);
                            setMessage(e.target.value);
                        }}
                    />
                </AdminField>

                {link ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Generated link</p>
                        <button
                            type="button"
                            onClick={copyLink}
                            className="mt-2 block w-full break-all rounded-xl bg-white px-3 py-2.5 text-left text-sm font-medium text-brand underline decoration-brand/30 underline-offset-2 transition hover:bg-emerald-50"
                            title="Click to copy"
                        >
                            {link}
                        </button>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={copyLink}
                                className="btn-brand !rounded-xl !px-4 !py-2 !text-sm"
                            >
                                {copied ? 'Copied!' : 'Copy link'}
                            </button>
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-ghost !rounded-xl !px-4 !py-2 !text-sm"
                            >
                                Open in WhatsApp
                            </a>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-400">
                        Enter a valid international number to generate a link.
                    </p>
                )}
            </div>
        </AdminFormSection>
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
        contact_email: string;
        whatsapp_number: string;
        whatsapp_message: string;
        mail_enabled: boolean;
        brevo_api_key: string;
        mail_from_address: string;
        mail_from_name: string;
        logo: File | null;
        favicon: File | null;
    }>({
        commission_percent: settings.commission_percent,
        min_withdrawal: settings.min_withdrawal,
        contact_email: settings.contact_email,
        whatsapp_number: settings.whatsapp_number,
        whatsapp_message: settings.whatsapp_message,
        mail_enabled: settings.mail_enabled,
        brevo_api_key: '',
        mail_from_address: settings.mail_from_address || settings.contact_email,
        mail_from_name: settings.mail_from_name || '',
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
                            Configure branding, contact, commission, and withdrawals.
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
                        title="Contact"
                        description="Email and WhatsApp shown on the contact page. WhatsApp also powers the floating chat icon on the landing page and member dashboards."
                    >
                        <div className="grid gap-5">
                            <AdminField label="Support email" required>
                                <AdminInput
                                    type="email"
                                    value={form.data.contact_email}
                                    onChange={(e) => form.setData('contact_email', e.target.value)}
                                />
                                {form.errors.contact_email && (
                                    <p className="mt-1.5 text-xs font-semibold text-rose-600">
                                        {form.errors.contact_email}
                                    </p>
                                )}
                            </AdminField>
                            <AdminField label="WhatsApp number">
                                <AdminInput
                                    type="text"
                                    placeholder="923001234567"
                                    value={form.data.whatsapp_number}
                                    onChange={(e) => form.setData('whatsapp_number', e.target.value)}
                                />
                                <p className="mt-1.5 text-xs text-slate-400">
                                    Full international number with country code, digits only. Pakistan example:{' '}
                                    <span className="font-semibold text-slate-500">923001234567</span> (not 0300…).
                                </p>
                                {form.errors.whatsapp_number && (
                                    <p className="mt-1.5 text-xs font-semibold text-rose-600">
                                        {form.errors.whatsapp_number}
                                    </p>
                                )}
                            </AdminField>
                            <AdminField label="WhatsApp prefilled message">
                                <AdminInput
                                    type="text"
                                    value={form.data.whatsapp_message}
                                    onChange={(e) => form.setData('whatsapp_message', e.target.value)}
                                />
                                <p className="mt-1.5 text-xs text-slate-400">
                                    Sent as the first message when someone opens the WhatsApp link.
                                </p>
                                {form.errors.whatsapp_message && (
                                    <p className="mt-1.5 text-xs font-semibold text-rose-600">
                                        {form.errors.whatsapp_message}
                                    </p>
                                )}
                            </AdminField>
                        </div>
                    </AdminFormSection>

                    <WhatsAppLinkGenerator />

                    <AdminFormSection
                        title="Email (Brevo)"
                        description="Paste your Brevo API key and enable email. OTP, status updates, and password resets are sent through Brevo’s API."
                    >
                        <div className="space-y-5">
                            <label className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                                <input
                                    type="checkbox"
                                    checked={form.data.mail_enabled}
                                    onChange={(e) => form.setData('mail_enabled', e.target.checked)}
                                    className="rounded border-brand/20 text-brand focus:ring-brand"
                                />
                                Enable Brevo email sending
                            </label>

                            <AdminField label="Brevo API key">
                                <AdminInput
                                    type="password"
                                    value={form.data.brevo_api_key}
                                    onChange={(e) => form.setData('brevo_api_key', e.target.value)}
                                    placeholder={
                                        settings.brevo_api_key_set
                                            ? '•••••••• (leave blank to keep current key)'
                                            : 'xkeysib-…'
                                    }
                                    autoComplete="new-password"
                                />
                                <p className="mt-1.5 text-xs text-slate-400">
                                    Brevo → SMTP &amp; API → API keys. Never commit this key to git.
                                </p>
                                {form.errors.brevo_api_key && (
                                    <p className="mt-1.5 text-xs font-semibold text-rose-600">
                                        {form.errors.brevo_api_key}
                                    </p>
                                )}
                            </AdminField>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <AdminField label="From name">
                                    <AdminInput
                                        value={form.data.mail_from_name}
                                        onChange={(e) => form.setData('mail_from_name', e.target.value)}
                                        placeholder="Wyak Dating"
                                    />
                                </AdminField>
                                <AdminField label="From email">
                                    <AdminInput
                                        type="email"
                                        value={form.data.mail_from_address}
                                        onChange={(e) => form.setData('mail_from_address', e.target.value)}
                                        placeholder="noreply@yourdomain.com"
                                    />
                                    <p className="mt-1.5 text-xs text-slate-400">
                                        Must be a verified sender in Brevo.
                                    </p>
                                </AdminField>
                            </div>
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
