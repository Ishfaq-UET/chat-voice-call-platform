import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

type SiteLogoProps = {
    href?: string;
    className?: string;
    markClassName?: string;
    textClassName?: string;
    showText?: boolean;
    subtitle?: ReactNode;
};

function FallbackMark({ className }: { className?: string }) {
    return (
        <span
            className={`flex shrink-0 items-center justify-center rounded-2xl bg-brand text-sm font-black text-white shadow-soft ${className ?? 'h-9 w-9'}`}
        >
            W
        </span>
    );
}

export default function SiteLogo({
    href = '/',
    className = '',
    markClassName = 'h-9 w-9',
    textClassName = 'text-lg font-extrabold text-brand',
    showText = true,
    subtitle,
}: SiteLogoProps) {
    const branding = usePage<PageProps>().props.branding;
    const logoUrl = branding?.logo_url;
    const appName = branding?.app_name ?? 'Wyak Dating';

    return (
        <Link href={href} className={`inline-flex items-center gap-2.5 ${className}`}>
            {logoUrl ? (
                <img
                    src={logoUrl}
                    alt={appName}
                    className={`shrink-0 object-contain ${markClassName}`}
                />
            ) : (
                <FallbackMark className={markClassName} />
            )}
            {(showText || subtitle) && (
                <span className="min-w-0">
                    {showText && (
                        <span className={`block ${textClassName}`}>
                            Wyak <span className="text-ink">Dating</span>
                        </span>
                    )}
                    {subtitle}
                </span>
            )}
        </Link>
    );
}
