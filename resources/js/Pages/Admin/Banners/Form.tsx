import AdminFormSection from '@/Components/Admin/AdminFormSection';
import { AdminField, AdminInput } from '@/Components/Admin/AdminField';
import { IconArrowLeft } from '@/Components/Admin/AdminIcons';
import CountryCombobox, { CountryOption } from '@/Components/CountryCombobox';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChangeEvent, FormEventHandler, useMemo, useState } from 'react';

type BannerFormData = {
    id: number;
    title: string | null;
    message: string;
    image_url: string | null;
    link_url: string | null;
    link_label: string | null;
    country_code: string;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
};

export default function AdminBannerForm({
    banner,
    countries,
}: PageProps<{
    banner: BannerFormData | null;
    countries: CountryOption[];
}>) {
    const editing = Boolean(banner);
    const form = useForm({
        title: banner?.title ?? '',
        message: banner?.message ?? '',
        image: null as File | null,
        remove_image: false as boolean,
        link_url: banner?.link_url ?? '',
        link_label: banner?.link_label ?? '',
        country_code: banner?.country_code ?? '',
        is_active: banner?.is_active ?? true,
        starts_at: banner?.starts_at ?? '',
        ends_at: banner?.ends_at ?? '',
        ...(editing ? { _method: 'put' as const } : {}),
    });

    const [preview, setPreview] = useState<string | null>(null);
    const imageDisplay = useMemo(
        () => (form.data.remove_image ? null : preview ?? banner?.image_url ?? null),
        [preview, banner?.image_url, form.data.remove_image],
    );

    const save: FormEventHandler = (e) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            is_active: data.is_active ? '1' : '0',
            remove_image: data.remove_image ? '1' : '0',
        }));

        if (editing && banner) {
            form.post(route('admin.banners.update', banner.id), { forceFormData: true });
            return;
        }
        form.post(route('admin.banners.store'), { forceFormData: true });
    };

    return (
        <AdminLayout header={editing ? 'Edit banner' : 'New banner'}>
            <Head title={editing ? 'Edit banner' : 'New banner'} />
            <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 lg:px-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-ink">
                            {editing ? 'Edit banner' : 'Create banner'}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Leave country empty for a global banner shown to everyone. Country banners override the global one for that market.
                        </p>
                    </div>
                    <Link href={route('admin.banners')} className="btn-ghost self-start px-4 py-2.5">
                        <IconArrowLeft />
                        Back
                    </Link>
                </div>

                <form onSubmit={save} className="space-y-5">
                    <AdminFormSection title="Content" description="Shown in the welcome popup when a visitor arrives.">
                        <div className="space-y-4">
                            <AdminField label="Title">
                                <AdminInput
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="Welcome to Wyak Dating"
                                    maxLength={120}
                                />
                                {form.errors.title && (
                                    <p className="mt-1 text-xs font-semibold text-rose-600">{form.errors.title}</p>
                                )}
                            </AdminField>

                            <AdminField label="Message" required>
                                <textarea
                                    value={form.data.message}
                                    onChange={(e) => form.setData('message', e.target.value)}
                                    rows={4}
                                    required
                                    className="w-full rounded-2xl border-brand/15 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm placeholder:text-slate-400 focus:border-brand focus:ring-brand"
                                    placeholder="Special offer, announcement, or welcome note…"
                                />
                                {form.errors.message && (
                                    <p className="mt-1 text-xs font-semibold text-rose-600">{form.errors.message}</p>
                                )}
                            </AdminField>

                            <div className="rounded-2xl border border-brand/10 bg-canvas/60 p-4">
                                <p className="text-sm font-extrabold text-ink">Banner image</p>
                                <p className="mt-1 text-xs text-slate-500">Optional. JPG, PNG, or WebP. Max 4 MB.</p>
                                <div className="mt-3 flex flex-wrap items-center gap-4">
                                    <div className="flex h-24 w-40 items-center justify-center overflow-hidden rounded-2xl border border-brand/10 bg-white">
                                        {imageDisplay ? (
                                            <img src={imageDisplay} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold text-slate-300">None</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <label className="cursor-pointer rounded-2xl border border-brand/15 bg-white px-3.5 py-2 text-sm font-bold text-brand shadow-sm hover:bg-brand-soft">
                                            Choose image
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp,image/gif"
                                                className="sr-only"
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                    const file = e.target.files?.[0] ?? null;
                                                    form.setData('image', file);
                                                    form.setData('remove_image', false);
                                                    setPreview(file ? URL.createObjectURL(file) : null);
                                                }}
                                            />
                                        </label>
                                        {imageDisplay && (
                                            <button
                                                type="button"
                                                className="rounded-2xl px-3.5 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50"
                                                onClick={() => {
                                                    form.setData('image', null);
                                                    form.setData('remove_image', true);
                                                    setPreview(null);
                                                }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {form.errors.image && (
                                    <p className="mt-2 text-xs font-semibold text-rose-600">{form.errors.image}</p>
                                )}
                            </div>
                        </div>
                    </AdminFormSection>

                    <AdminFormSection title="Call to action" description="Optional button inside the popup.">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <AdminField label="Button label">
                                <AdminInput
                                    value={form.data.link_label}
                                    onChange={(e) => form.setData('link_label', e.target.value)}
                                    placeholder="Get started"
                                />
                            </AdminField>
                            <AdminField label="Button URL">
                                <AdminInput
                                    value={form.data.link_url}
                                    onChange={(e) => form.setData('link_url', e.target.value)}
                                    placeholder="/register or https://…"
                                />
                            </AdminField>
                        </div>
                    </AdminFormSection>

                    <AdminFormSection title="Audience & schedule" description="Target everyone (global) or one country.">
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-ink">Scope</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => form.setData('country_code', '')}
                                        className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                                            !form.data.country_code
                                                ? 'bg-brand text-white'
                                                : 'bg-white text-slate-600 ring-1 ring-brand/10'
                                        }`}
                                    >
                                        Global
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!form.data.country_code) {
                                                form.setData('country_code', 'PK');
                                            }
                                        }}
                                        className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                                            form.data.country_code
                                                ? 'bg-brand text-white'
                                                : 'bg-white text-slate-600 ring-1 ring-brand/10'
                                        }`}
                                    >
                                        Country-specific
                                    </button>
                                </div>
                            </div>

                            {form.data.country_code !== '' && (
                                <CountryCombobox
                                    label="Country"
                                    countries={countries}
                                    value={form.data.country_code || 'PK'}
                                    onChange={(code) => form.setData('country_code', code)}
                                    hint="Only visitors from this country see this banner (logged-in users use their profile country)."
                                    error={form.errors.country_code}
                                />
                            )}

                            <label className="flex items-center gap-3 rounded-2xl border border-brand/10 bg-white px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(e) => form.setData('is_active', e.target.checked)}
                                    className="rounded border-brand/30 text-brand focus:ring-brand"
                                />
                                <span className="text-sm font-bold text-ink">Active (show on website)</span>
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <AdminField label="Starts at (optional)">
                                    <AdminInput
                                        type="datetime-local"
                                        value={form.data.starts_at}
                                        onChange={(e) => form.setData('starts_at', e.target.value)}
                                    />
                                </AdminField>
                                <AdminField label="Ends at (optional)">
                                    <AdminInput
                                        type="datetime-local"
                                        value={form.data.ends_at}
                                        onChange={(e) => form.setData('ends_at', e.target.value)}
                                    />
                                </AdminField>
                            </div>
                        </div>
                    </AdminFormSection>

                    <div className="flex justify-end gap-3">
                        <Link href={route('admin.banners')} className="btn-ghost px-5 py-2.5">
                            Cancel
                        </Link>
                        <button type="submit" disabled={form.processing} className="btn-brand px-5 py-2.5 disabled:opacity-60">
                            {editing ? 'Save changes' : 'Create banner'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
