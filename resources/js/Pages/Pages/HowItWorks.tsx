import MarketingLayout from '@/Layouts/MarketingLayout';
import { Head, Link } from '@inertiajs/react';

const steps = [
    ['Create account', 'Choose member or creator at signup.'],
    ['Verify (creators)', 'Upload a selfie for admin review.'],
    ['Fund or set prices', 'Members top up. Creators publish rates.'],
    ['Discover & connect', 'Browse photos, bios, pricing, online status.'],
    ['Chat, voice, call', 'Pay per message/note/minute.'],
    ['Withdraw', 'Creators request payouts; admin marks paid.'],
];

export default function HowItWorks() {
    return (
        <MarketingLayout>
            <Head title="How it works" />
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Product</p>
                <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">How Wyak Dating works</h1>
                <p className="mt-4 max-w-2xl text-lg text-slate-500">From signup to payouts — simple and clear.</p>

                <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {steps.map(([title, body], i) => (
                        <li key={title} className="card-soft p-6">
                            <p className="text-sm font-extrabold text-brand">{String(i + 1).padStart(2, '0')}</p>
                            <h2 className="mt-2 text-xl font-extrabold text-ink">{title}</h2>
                            <p className="mt-2 text-sm text-slate-500">{body}</p>
                        </li>
                    ))}
                </ol>

                <Link href={route('register')} className="btn-brand mt-10">
                    Create account →
                </Link>
            </div>
        </MarketingLayout>
    );
}
