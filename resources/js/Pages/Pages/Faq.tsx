import MarketingLayout from '@/Layouts/MarketingLayout';
import { Head, Link } from '@inertiajs/react';

const faqs = [
    ['Is ChatVoiceCall free?', 'Signup is free. Chat and calls use wallet balance at each creator’s rates.'],
    ['Why do I need to log in?', 'Discover shows personal profiles and paid features, so we require an account.'],
    ['How is this different from Omegle-style apps?', 'You choose verified creators, see prices, and pay from a wallet.'],
    ['How do creators get paid?', 'Earnings go to their wallet after commission; they request withdrawals.'],
    ['Do you support video?', 'Not yet — text, voice notes, and live voice calls ship first.'],
];

export default function Faq() {
    return (
        <MarketingLayout>
            <Head title="FAQ" />
            <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Help</p>
                <h1 className="mt-3 text-4xl font-extrabold text-ink">FAQ</h1>
                <div className="mt-10 divide-y divide-brand/10 rounded-[28px] bg-white p-2 shadow-card">
                    {faqs.map(([q, a]) => (
                        <div key={q} className="px-4 py-5">
                            <h2 className="font-extrabold text-ink">{q}</h2>
                            <p className="mt-2 text-sm text-slate-500">{a}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-8 text-sm text-slate-500">
                    Still stuck?{' '}
                    <Link href="/contact" className="font-bold text-brand">
                        Contact us
                    </Link>
                </p>
            </div>
        </MarketingLayout>
    );
}
