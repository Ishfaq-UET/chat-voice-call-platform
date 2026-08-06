import { PropsWithChildren, ReactNode } from 'react';

export default function AdminPageBanner({
    eyebrow,
    title,
    description,
    meta,
    actions,
    children,
}: PropsWithChildren<{
    eyebrow?: ReactNode;
    title: string;
    description?: string;
    meta?: ReactNode;
    actions?: ReactNode;
}>) {
    return (
        <div className="overflow-hidden rounded-[28px] bg-brand px-6 py-7 text-white shadow-soft sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    {eyebrow && (
                        <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white/90">
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
                    {description && <p className="mt-1.5 max-w-xl text-sm text-white/80">{description}</p>}
                    {meta && <p className="mt-3 text-sm font-semibold text-white/75">{meta}</p>}
                </div>
                {actions && <div className="shrink-0">{actions}</div>}
            </div>
            {children}
        </div>
    );
}
