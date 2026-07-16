import { Link } from '@inertiajs/react';

type LinkItem = { url: string | null; label: string; active: boolean };

export default function Pagination({
    links,
    from,
    to,
    total,
}: {
    links?: LinkItem[];
    from?: number | null;
    to?: number | null;
    total?: number;
}) {
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
            <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-ink">{from ?? 0}</span>–
                <span className="font-semibold text-ink">{to ?? 0}</span> of{' '}
                <span className="font-semibold text-ink">{total ?? 0}</span> creators
            </p>
            <div className="flex flex-wrap justify-center gap-1">
                {links.map((link, i) => {
                    const label = link.label
                        .replace('&laquo;', '‹')
                        .replace('&raquo;', '›')
                        .replace(/<[^>]+>/g, '');

                    if (!link.url) {
                        return (
                            <span
                                key={`${label}-${i}`}
                                className="rounded-lg px-3 py-1.5 text-sm text-slate-300"
                                dangerouslySetInnerHTML={{ __html: label }}
                            />
                        );
                    }

                    return (
                        <Link
                            key={`${label}-${i}`}
                            href={link.url}
                            preserveScroll
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                link.active
                                    ? 'bg-ink text-white'
                                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: label }} />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
