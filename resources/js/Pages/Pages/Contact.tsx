import MarketingLayout from '@/Layouts/MarketingLayout';
import { Head } from '@inertiajs/react';

export default function Contact() {
    return (
        <MarketingLayout>
            <Head title="Contact" />
            <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Support</p>
                <h1 className="mt-3 text-4xl font-extrabold text-ink">Contact us</h1>
                <p className="mt-4 text-lg text-slate-500">Account help, verification, or payouts — email the team.</p>
                <div className="card-soft mt-10 space-y-3 p-6 text-sm font-medium text-slate-600">
                    <p>General: support@wyakdating.local</p>
                    <p>Creators / payouts: creators@wyakdating.local</p>
                    <p>Safety reports: trust@wyakdating.local</p>
                    <p className="pt-2 text-slate-400">Typical reply: 1–2 business days</p>
                </div>
            </div>
        </MarketingLayout>
    );
}
