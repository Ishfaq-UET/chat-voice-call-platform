import MarketingLayout from '@/Layouts/MarketingLayout';
import { Head, Link } from '@inertiajs/react';

export default function Pricing() {
    return (
        <MarketingLayout>
            <Head title="Pricing" />
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Billing</p>
                <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">Transparent rates, set by creators</h1>
                <p className="mt-4 max-w-2xl text-lg text-slate-500">
                    Each creator lists chat, voice-note, and per-minute call prices on their profile.
                </p>
                <div className="mt-12 grid gap-5 md:grid-cols-3">
                    {[
                        ['Text chat', 'Charged per message.'],
                        ['Voice notes', 'Charged per voice note.'],
                        ['Voice calls', 'Charged per connected minute.'],
                    ].map(([t, b]) => (
                        <div key={t} className="card-soft p-6">
                            <h2 className="text-xl font-extrabold text-ink">{t}</h2>
                            <p className="mt-2 text-sm text-slate-500">{b}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-10 text-sm text-slate-500">
                    Default commission is 20%.{' '}
                    <Link href={route('register')} className="font-bold text-brand">
                        Create an account
                    </Link>{' '}
                    to see live Discover pricing.
                </p>
            </div>
        </MarketingLayout>
    );
}
