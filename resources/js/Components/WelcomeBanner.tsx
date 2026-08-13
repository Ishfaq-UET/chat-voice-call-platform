import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const storageKey = (id: number, version: string | number) => `wyak_banner_dismissed_${id}_${version}`;

export default function WelcomeBanner() {
    const banner = usePage<PageProps>().props.siteBanner;
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!banner) {
            setOpen(false);
            return;
        }

        try {
            if (localStorage.getItem(storageKey(banner.id, banner.version))) {
                setOpen(false);
                return;
            }
        } catch {
            // ignore storage errors
        }

        setOpen(true);
    }, [banner]);

    if (!banner || !open) {
        return null;
    }

    const dismiss = () => {
        try {
            localStorage.setItem(storageKey(banner.id, banner.version), '1');
        } catch {
            // ignore
        }
        setOpen(false);
    };

    const ctaHref = banner.link_url || null;
    const ctaLabel = banner.link_label || 'Continue';

    return (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-4 backdrop-blur-[2px] sm:items-center">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="welcome-banner-title"
                className="relative w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl"
            >
                <button
                    type="button"
                    onClick={dismiss}
                    className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-slate-500 shadow-sm hover:bg-white hover:text-ink"
                    aria-label="Close"
                >
                    ×
                </button>

                {banner.image_url && (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-canvas">
                        <img src={banner.image_url} alt="" className="h-full w-full object-cover" />
                    </div>
                )}

                <div className="px-6 py-6 sm:px-7 sm:py-7">
                    {banner.title && (
                        <h2 id="welcome-banner-title" className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                            {banner.title}
                        </h2>
                    )}
                    <p className={`whitespace-pre-line text-sm leading-relaxed text-slate-600 ${banner.title ? 'mt-2' : ''}`}>
                        {banner.message}
                    </p>

                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button type="button" onClick={dismiss} className="btn-ghost px-5 py-2.5">
                            Maybe later
                        </button>
                        {ctaHref ? (
                            <Link
                                href={ctaHref}
                                onClick={dismiss}
                                className="btn-brand px-5 py-2.5 text-center"
                            >
                                {ctaLabel}
                            </Link>
                        ) : (
                            <button type="button" onClick={dismiss} className="btn-brand px-5 py-2.5">
                                Got it
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
