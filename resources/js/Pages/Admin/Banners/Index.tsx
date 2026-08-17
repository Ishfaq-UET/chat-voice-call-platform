import AdminPageBanner from '@/Components/Admin/AdminPageBanner';
import { IconBanner, IconPlus } from '@/Components/Admin/AdminIcons';
import CountryFlag from '@/Components/CountryFlag';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

type BannerRow = {
    id: number;
    title: string | null;
    message: string;
    image_url: string | null;
    link_url: string | null;
    link_label: string | null;
    country_codes: string[];
    country_names: string[];
    scope_label: string;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    updated_at: string | null;
};

export default function AdminBannersIndex({
    banners,
}: PageProps<{ banners: BannerRow[] }>) {
    return (
        <AdminLayout header="Banners">
            <Head title="Banners" />
            <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 lg:px-6">
                <AdminPageBanner
                    eyebrow={
                        <>
                            <IconBanner />
                            Site announcements
                        </>
                    }
                    title="Welcome banners"
                    description="Show a popup when visitors arrive — globally or for selected countries."
                    meta={`${banners.length} total`}
                    actions={
                        <Link href={route('admin.banners.create')} className="btn-brand inline-flex items-center gap-2 px-4 py-2.5">
                            <IconPlus />
                            New banner
                        </Link>
                    }
                />

                {banners.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-brand/20 bg-white px-6 py-16 text-center">
                        <p className="text-lg font-extrabold text-ink">No banners yet</p>
                        <p className="mt-2 text-sm text-slate-500">
                            Create a global banner for everyone, or pick multiple countries (e.g. Pakistan and India).
                        </p>
                        <Link href={route('admin.banners.create')} className="btn-brand mt-6 inline-flex px-5 py-2.5">
                            Create first banner
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {banners.map((banner) => (
                            <div
                                key={banner.id}
                                className="flex flex-col gap-4 rounded-3xl border border-brand/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                            >
                                <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-canvas">
                                    {banner.image_url ? (
                                        <img src={banner.image_url} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
                                            No image
                                        </span>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                                                banner.is_active
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {banner.is_active ? 'Active' : 'Off'}
                                        </span>
                                        {banner.country_codes.length === 0 ? (
                                            <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-bold text-brand">
                                                Global
                                            </span>
                                        ) : (
                                            banner.country_names.slice(0, 4).map((name, index) => (
                                                <span
                                                    key={banner.country_codes[index]}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-bold text-brand"
                                                >
                                                    <CountryFlag
                                                        code={banner.country_codes[index]}
                                                        title={name}
                                                        className="h-3 w-4"
                                                    />
                                                    {name}
                                                </span>
                                            ))
                                        )}
                                        {banner.country_names.length > 4 && (
                                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                                                +{banner.country_names.length - 4}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1.5 truncate text-base font-extrabold text-ink">
                                        {banner.title || 'Untitled banner'}
                                    </p>
                                    <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{banner.message}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => router.post(route('admin.banners.toggle', banner.id))}
                                        className="btn-ghost px-3 py-2 text-sm"
                                    >
                                        {banner.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <Link
                                        href={route('admin.banners.edit', banner.id)}
                                        className="rounded-2xl bg-brand-soft px-3 py-2 text-sm font-bold text-brand"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('Delete this banner?')) {
                                                router.delete(route('admin.banners.destroy', banner.id));
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
