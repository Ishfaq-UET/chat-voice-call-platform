import MarketingLayout from '@/Layouts/MarketingLayout';
import { Head } from '@inertiajs/react';

export default function Simple({
    title,
    intro,
    body,
}: {
    title: string;
    intro: string;
    body: string;
}) {
    return (
        <MarketingLayout>
            <Head title={title} />
            <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
                <h1 className="text-4xl font-extrabold text-ink">{title}</h1>
                <p className="mt-4 text-lg text-slate-500">{intro}</p>
                <p className="card-soft mt-6 p-6 text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
        </MarketingLayout>
    );
}
