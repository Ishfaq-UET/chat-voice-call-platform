import MarketingLayout from '@/Layouts/MarketingLayout';
import { Head } from '@inertiajs/react';

export default function Legal({
    title,
    updated,
    sections,
}: {
    title: string;
    updated: string;
    sections: { heading: string; body: string }[];
}) {
    return (
        <MarketingLayout>
            <Head title={title} />
            <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
                <p className="text-sm text-slate-400">Updated {updated}</p>
                <h1 className="mt-2 text-4xl font-extrabold text-ink">{title}</h1>
                <div className="card-soft mt-10 space-y-8 p-6 sm:p-8">
                    {sections.map((s) => (
                        <section key={s.heading}>
                            <h2 className="text-lg font-extrabold text-ink">{s.heading}</h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.body}</p>
                        </section>
                    ))}
                </div>
            </div>
        </MarketingLayout>
    );
}
