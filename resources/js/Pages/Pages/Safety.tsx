import MarketingLayout from '@/Layouts/MarketingLayout';
import { Head } from '@inertiajs/react';

const items = [
    ['Face verification', 'Creators must pass selfie review before Discover.'],
    ['18+ accounts only', 'Registration is for adults only.'],
    ['Admin moderation', 'Ban fake profiles and process reports.'],
    ['In-app payments', 'Keep money inside wallets.'],
    ['Block & leave', 'End chats/calls anytime.'],
    ['Privacy-minded', 'Verification images stored for review only.'],
];

export default function Safety() {
    return (
        <MarketingLayout>
            <Head title="Safety" />
            <div className="bg-canvas">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Trust</p>
                    <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">Safety isn’t optional</h1>
                    <p className="mt-4 max-w-2xl text-lg text-slate-500">
                        We put verification and admin controls first — not after launch.
                    </p>
                    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map(([title, body]) => (
                            <article key={title} className="card-soft p-6">
                                <h2 className="text-lg font-extrabold text-ink">{title}</h2>
                                <p className="mt-2 text-sm text-slate-500">{body}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}
