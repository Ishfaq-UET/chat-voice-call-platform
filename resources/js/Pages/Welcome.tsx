import MarketingLayout from '@/Layouts/MarketingLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

function HeroMockup() {
    return (
        <div className="animate-float relative mx-auto w-full max-w-md">
            <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-brand/20 via-fuchsia-200/30 to-sky-200/40 blur-2xl" />
            <div className="card-soft relative overflow-hidden border border-brand/10 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-2xl bg-brand-soft" />
                        <div>
                            <p className="text-sm font-bold text-ink">Discover</p>
                            <p className="text-xs text-slate-400">Verified creators nearby</p>
                        </div>
                    </div>
                    <span className="chip bg-emerald-100 text-emerald-700">Live</span>
                </div>

                <div className="space-y-3">
                    {[
                        ['Ava', 'Online', 'Chat $1.50', 'Call $6/min', 'from-violet-200'],
                        ['Mia', 'Online', 'Chat $1.00', 'Call $5/min', 'from-fuchsia-200'],
                        ['Luna', 'Away', 'Chat $2.00', 'Call $7/min', 'from-sky-200'],
                    ].map(([name, status, chat, call, gradient]) => (
                        <div key={name} className="flex items-center gap-3 rounded-3xl bg-canvas p-3">
                            <div
                                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} to-white text-lg font-extrabold text-brand`}
                            >
                                {String(name).charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-ink">{name}</p>
                                    <span
                                        className={`h-2 w-2 rounded-full ${
                                            status === 'Online' ? 'bg-emerald-500' : 'bg-slate-300'
                                        }`}
                                    />
                                </div>
                                <p className="truncate text-xs text-slate-500">
                                    {chat} · {call}
                                </p>
                            </div>
                            <button className="rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white">
                                Chat
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 rounded-3xl bg-lilac p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-brand">Wallet</p>
                    <p className="mt-1 text-2xl font-extrabold text-ink">$42.50</p>
                    <p className="text-xs text-slate-500">Ready for chat & calls</p>
                </div>
            </div>
        </div>
    );
}

const blogPosts = [
    {
        slug: 'wallet-pricing-for-chat-and-calls',
        tag: 'Guides',
        title: 'How wallet pricing works for chat and calls',
        excerpt: 'Per-message, voice notes, and per-minute billing — explained simply.',
        tone: 'bg-lilac',
    },
    {
        slug: 'face-verification-protects-both-sides',
        tag: 'Safety',
        title: 'Why face verification protects both sides',
        excerpt: 'Creators verify once. Members browse a trusted Discover list.',
        tone: 'bg-mint',
    },
    {
        slug: 'setting-rates-that-convert',
        tag: 'Creators',
        title: 'Set rates that convert without burning out',
        excerpt: 'Practical pricing tips for new creators on Wyak Dating.',
        tone: 'bg-skyish',
    },
];

const features = [
    ['Live chat', 'Pay per message with rates shown before you send.'],
    ['Voice notes', 'Record and send personal voice messages in-thread.'],
    ['Voice calls', '1:1 calling billed per minute from your wallet.'],
    ['Face verified', 'Only approved creators appear in Discover.'],
    ['Creator wallet', 'Earnings after commission, withdraw anytime.'],
    ['Members only', 'Login required — no anonymous roulette chaos.'],
];

export default function Welcome({ auth }: PageProps) {
    return (
        <MarketingLayout>
            <Head title="Chat with verified creators — voice & calls" />

            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-lilac via-white to-white">
                <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
                    <div>
                        <span className="chip bg-brand-soft text-brand">Members-only · Verified creators</span>
                        <h1 className="animate-rise mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
                            Talk to real creators online — chat, voice & calls
                        </h1>
                        <p className="animate-rise-delay mt-5 max-w-xl text-lg leading-relaxed text-slate-500">
                            Make real conversations. Free signup. Top up once, then chat or call with clear pricing
                            on every profile.
                        </p>
                        <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="btn-brand">
                                    Open Discover →
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('register')} className="btn-brand">
                                        Chat Now →
                                    </Link>
                                    <Link href="/how-it-works" className="btn-ghost">
                                        How it works
                                    </Link>
                                </>
                            )}
                        </div>
                        <p className="mt-5 text-sm font-medium text-slate-400">
                            No bots · Face-verified · Chat · Voice notes · Live calls
                        </p>
                    </div>

                    <HeroMockup />
                </div>
            </section>

            {/* Stats */}
            <section className="border-y border-brand/5 bg-white">
                <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:px-6">
                    {[
                        ['12+', 'Demo creators'],
                        ['3', 'Talk modes'],
                        ['20%', 'Platform commission'],
                        ['18+', 'Adults only'],
                    ].map(([n, l]) => (
                        <div key={l} className="text-center">
                            <p className="text-3xl font-extrabold text-brand">{n}</p>
                            <p className="mt-1 text-sm font-medium text-slate-500">{l}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tips & guides */}
            <section className="bg-canvas py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">From the blog</p>
                            <h2 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">Tips & guides</h2>
                        </div>
                        <Link href="/blog" className="text-sm font-bold text-brand hover:text-brand-deep">
                            View all posts →
                        </Link>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {blogPosts.map((post) => (
                            <Link
                                key={post.slug}
                                href={route('blog.show', post.slug)}
                                className="card-soft overflow-hidden transition hover:-translate-y-1 hover:shadow-float"
                            >
                                <div className={`h-40 ${post.tone}`} />
                                <div className="p-6">
                                    <p className="text-xs font-bold uppercase tracking-wide text-brand">{post.tag}</p>
                                    <h3 className="mt-2 text-lg font-extrabold text-ink">{post.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{post.excerpt}</p>
                                    <span className="mt-4 inline-flex text-sm font-bold text-brand">
                                        Read more →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Z pattern */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-6xl space-y-20 px-4 sm:px-6">
                    <div className="grid items-center gap-10 lg:grid-cols-2">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">For members</p>
                            <h2 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">
                                Browse creators who match your mood
                            </h2>
                            <p className="mt-4 text-slate-500">
                                See photos, bios, online status, and every price before you chat or call. Top up your
                                wallet once — then talk when it feels right.
                            </p>
                            <Link href={`${route('register')}?role=male`} className="btn-brand mt-8">
                                Join as member
                            </Link>
                        </div>
                        <div className="rounded-[32px] bg-lilac p-6 sm:p-8">
                            <div className="card-soft p-5">
                                <div className="flex gap-3">
                                    {['Online', 'Chat $1.5', 'Call $6'].map((t) => (
                                        <span key={t} className="chip bg-brand-soft text-brand">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-5 flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-300 to-fuchsia-200" />
                                    <div>
                                        <p className="text-xl font-extrabold text-ink">Ava Brooks</p>
                                        <p className="text-sm text-slate-500">Late-night talks & soft voice notes</p>
                                    </div>
                                </div>
                                <button className="btn-brand mt-5 w-full">Start Chat</button>
                            </div>
                        </div>
                    </div>

                    <div className="grid items-center gap-10 lg:grid-cols-2">
                        <div className="order-2 rounded-[32px] bg-mint p-6 sm:p-8 lg:order-1">
                            <div className="card-soft space-y-3 p-5">
                                {['Chat message · keep 80%', 'Voice note · keep 80%', 'Call minute · keep 80%'].map(
                                    (row) => (
                                        <div
                                            key={row}
                                            className="flex items-center justify-between rounded-2xl bg-canvas px-4 py-3 text-sm font-semibold text-ink"
                                        >
                                            <span>{row}</span>
                                            <span className="text-emerald-600">✓</span>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">For creators</p>
                            <h2 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">
                                Verify once. Set rates. Get paid.
                            </h2>
                            <p className="mt-4 text-slate-500">
                                Face verification keeps Discover trustworthy. Publish chat, voice, and call prices.
                                Withdraw earnings after commission.
                            </p>
                            <Link href={`${route('register')}?role=female`} className="btn-brand mt-8">
                                Join as creator
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature grid */}
            <section className="bg-lilac/60 py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <h2 className="text-center text-3xl font-extrabold text-ink sm:text-4xl">
                        The best place for paid conversation
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-center text-slate-500">
                        Soft UI. Clear pricing. Real profiles. Built so chats can go from text to voice without
                        chaos.
                    </p>
                    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map(([title, body]) => (
                            <div key={title} className="card-soft p-6">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-extrabold text-ink">{title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Filters style preview (StrangerLine pastel cards) */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <h2 className="text-center text-3xl font-extrabold text-ink">
                        Chat with creators worldwide — be respectful, have fun
                    </h2>
                    <p className="mt-3 text-center text-slate-500">
                        Follow our{' '}
                        <Link href="/community" className="font-bold text-brand">
                            community guidelines
                        </Link>
                        .
                    </p>

                    <div className="mt-10 space-y-4">
                        <div className="rounded-[28px] bg-lilac p-5 sm:p-6">
                            <p className="font-extrabold text-ink">Interests & mood</p>
                            <p className="mt-1 text-sm text-slate-500">
                                Prefer soft talks, language practice, or late-night company? Filter after you log in.
                            </p>
                        </div>
                        <div className="rounded-[28px] bg-mint p-5 sm:p-6">
                            <p className="font-extrabold text-ink">Online & pricing filters</p>
                            <p className="mt-1 text-sm text-slate-500">
                                Show online creators only, or cap chat/call prices to stay in budget.
                            </p>
                        </div>
                        <div className="rounded-[28px] bg-skyish p-5 sm:p-6">
                            <p className="font-extrabold text-ink">Verified profiles only</p>
                            <p className="mt-1 text-sm text-slate-500">
                                Face-checked creators with photos, bios, and transparent rates.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-center">
                        <Link href={route('register')} className="btn-brand px-10">
                            Start Discovering
                            <span className="ml-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand">
                                →
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-canvas py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="overflow-hidden rounded-[36px] bg-brand px-8 py-12 text-white shadow-float sm:px-12">
                        <h2 className="max-w-xl text-3xl font-extrabold sm:text-4xl">
                            Ready to talk? Create your free account.
                        </h2>
                        <p className="mt-4 max-w-xl text-white/80">
                            Login unlocks Discover with full profiles, pricing, and online status — then chat or call.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={route('register')}
                                className="rounded-2xl bg-white px-7 py-3.5 text-sm font-extrabold text-brand"
                            >
                                Create account
                            </Link>
                            <Link
                                href={route('login')}
                                className="rounded-2xl border-2 border-white/40 px-7 py-3.5 text-sm font-extrabold text-white"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
