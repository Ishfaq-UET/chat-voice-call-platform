import { PropsWithChildren } from 'react';

export default function AdminFormSection({
    title,
    description,
    children,
}: PropsWithChildren<{ title: string; description?: string }>) {
    return (
        <section className="card-soft p-6 sm:p-7">
            <div className="mb-6 border-b border-brand/10 pb-4">
                <h2 className="text-base font-extrabold text-ink">{title}</h2>
                {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            {children}
        </section>
    );
}
