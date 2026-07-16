import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

const footerCols = [
    {
        title: 'Product',
        links: [
            { href: '/how-it-works', label: 'How it works' },
            { href: '/safety', label: 'Safety' },
            { href: '/faq', label: 'FAQ' },
            { href: '/pricing', label: 'Pricing' },
        ],
    },
    {
        title: 'Company',
        links: [
            { href: '/about', label: 'About us' },
            { href: '/contact', label: 'Contact' },
            { href: '/careers', label: 'Careers' },
            { href: '/blog', label: 'Tips & guides' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { href: '/terms', label: 'Terms of use' },
            { href: '/privacy', label: 'Privacy policy' },
            { href: '/community', label: 'Community rules' },
        ],
    },
];

function Logo({ className = '' }: { className?: string }) {
    return (
        <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand text-white shadow-soft">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3c2 3 2 6 0 9-2-3-2-6 0-9Z" />
                    <path d="M8 8c3 2 6 2 9 0-3 2-3 5 0 9-3-2-6-2-9 0 2-3 2-6 0-9Z" />
                    <path d="M7 14c2 2 4 3 5 5 1-2 3-3 5-5" />
                </svg>
            </span>
            <span className="text-xl font-extrabold tracking-tight text-brand">
                ChatVoice<span className="text-ink">Call</span>
            </span>
        </Link>
    );
}

export function SiteFooter() {
    return (
        <footer className="border-t border-brand/10 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
                <div className="grid gap-10 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <Logo />
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
                            Members-only chat, voice notes, and live calls with face-verified creators. Clear prices.
                            Secure wallets. Fair payouts.
                        </p>
                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand/60">
                            18+ only · Secure login required
                        </p>
                    </div>

                    {footerCols.map((col) => (
                        <div key={col.title}>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{col.title}</p>
                            <ul className="mt-4 space-y-2.5">
                                {col.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm font-medium text-slate-600 transition hover:text-brand"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col gap-2 border-t border-slate-100 pt-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} ChatVoiceCall</p>
                    <p>Text · Voice notes · Live calls · Verified creators</p>
                </div>
            </div>
        </footer>
    );
}

export function SiteHeader() {
    const { auth } = usePage<PageProps>().props;

    return (
        <header className="sticky top-0 z-30 border-b border-brand/10 bg-white/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
                <Logo />

                <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-500 md:flex">
                    <Link href="/how-it-works" className="hover:text-brand">
                        How it works
                    </Link>
                    <Link href="/blog" className="hover:text-brand">
                        Blog
                    </Link>
                    <Link href="/about" className="hover:text-brand">
                        About
                    </Link>
                    <Link href="/safety" className="hover:text-brand">
                        Safety
                    </Link>
                    <Link href="/faq" className="hover:text-brand">
                        FAQ
                    </Link>
                </nav>

                <div className="flex items-center gap-2">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="btn-brand !rounded-2xl !px-5 !py-2.5">
                            Open app
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="hidden rounded-2xl px-4 py-2.5 text-sm font-bold text-brand hover:bg-brand-soft sm:inline-flex"
                            >
                                Login
                            </Link>
                            <Link href={route('register')} className="btn-brand !rounded-2xl !px-5 !py-2.5">
                                Join free
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default function MarketingLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-white text-ink">
            <div className="bg-brand px-4 py-2 text-center text-sm font-semibold text-white">
                Create an account to unlock Discover, chat, and voice calls.{' '}
                <Link href={route('register')} className="underline underline-offset-2">
                    Create Account
                </Link>
            </div>
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
        </div>
    );
}
