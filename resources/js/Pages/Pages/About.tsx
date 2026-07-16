import MarketingLayout from '@/Layouts/MarketingLayout';
import { Head, Link } from '@inertiajs/react';

export default function About() {
    return (
        <MarketingLayout>
            <Head title="About us" />
            <div className="bg-lilac/40">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Company</p>
                    <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">About ChatVoiceCall</h1>
                    <p className="mt-4 max-w-2xl text-lg text-slate-500">
                        We built a members-only space for paid conversation — with verification, clear pricing, and
                        creator payouts.
                    </p>

                    <div className="mt-12 grid gap-6 lg:grid-cols-2">
                        <div className="card-soft space-y-4 p-6 text-slate-600">
                            <p>
                                ChatVoiceCall is for people who want more than anonymous roulette. Members choose who
                                to talk to. Creators control rates. Everyone sees prices before a chat or call starts.
                            </p>
                            <p>
                                Three modes that feel human — text chat, voice notes, and live voice calls — backed by
                                wallets and admin review for verification and withdrawals.
                            </p>
                        </div>
                        <div className="rounded-[28px] bg-mint p-6">
                            <h2 className="text-xl font-extrabold text-ink">What we stand for</h2>
                            <ul className="mt-4 space-y-2 text-sm font-medium text-slate-600">
                                <li>✓ Trust before discovery (face verification)</li>
                                <li>✓ Pricing before conversation</li>
                                <li>✓ Fair commission for creators</li>
                                <li>✓ Safety tools instead of “no rules”</li>
                            </ul>
                            <Link href="/contact" className="mt-6 inline-flex text-sm font-bold text-brand">
                                Contact the team →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}
