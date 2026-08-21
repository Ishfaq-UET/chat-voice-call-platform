import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import SiteLogo from '@/Components/SiteLogo';
import WelcomeBanner from '@/Components/WelcomeBanner';
import WhatsAppFloat from '@/Components/WhatsAppFloat';
import { formatAgoraMediaError, requestCallMediaPermission } from '@/lib/callMedia';
import { formatMoney } from '@/lib/money';
import { PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage<PageProps>().props.auth.user!;
    const flash = usePage<PageProps>().props.flash;
    const walletBalance = usePage<PageProps>().props.walletBalance;
    const market = usePage<PageProps>().props.market;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [incomingCall, setIncomingCall] = useState<{
        id: number;
        type?: 'audio' | 'video';
        male: { name: string };
    } | null>(null);
    const [accepting, setAccepting] = useState(false);
    const [incomingError, setIncomingError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'female') return;

        const channel = window.Echo.private(`App.Models.User.${user.id}`);
        channel.listen(
            '.call.incoming',
            (e: { call: { id: number; type?: 'audio' | 'video'; male: { name: string } } }) => {
                setIncomingError(null);
                setIncomingCall(e.call);
            },
        );

        return () => {
            window.Echo.leave(`App.Models.User.${user.id}`);
        };
    }, [user]);

    const acceptIncoming = async () => {
        if (!incomingCall || accepting) return;
        setAccepting(true);
        setIncomingError(null);

        try {
            await requestCallMediaPermission(incomingCall.type === 'video');
            const callId = incomingCall.id;
            setIncomingCall(null);
            router.post(
                route('calls.accept', callId),
                {},
                {
                    onFinish: () => setAccepting(false),
                    onError: () => setAccepting(false),
                },
            );
        } catch (err) {
            setIncomingError(formatAgoraMediaError(err));
            setAccepting(false);
        }
    };

    const homeHref =
        user.role === 'admin'
            ? route('admin.dashboard')
            : user.role === 'female'
              ? route('female.dashboard')
              : route('home');

    return (
        <div className="min-h-screen bg-canvas">
            <WelcomeBanner />
            <div className="bg-brand px-4 py-2 text-center text-xs font-bold text-white sm:text-sm">
                Be respectful · Follow community guidelines · 18+ only
            </div>

            <nav className="sticky top-0 z-40 border-b border-brand/10 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-8">
                            <SiteLogo href={homeHref} />

                            <div className="hidden items-center gap-1 sm:flex">
                                {user.role === 'male' && (
                                    <>
                                        <NavLink href={route('home')} active={route().current('home') || route().current('creators.*')}>
                                            Discover
                                        </NavLink>
                                        <NavLink href={route('chat.index')} active={route().current('chat.*')}>
                                            Chat
                                        </NavLink>
                                        <NavLink href={route('wallet.index')} active={route().current('wallet.*')}>
                                            Wallet
                                        </NavLink>
                                    </>
                                )}
                                {user.role === 'female' && (
                                    <>
                                        <NavLink href={route('female.dashboard')} active={route().current('female.dashboard')}>
                                            Dashboard
                                        </NavLink>
                                        <NavLink href={route('chat.index')} active={route().current('chat.*')}>
                                            Chat
                                        </NavLink>
                                        <NavLink href={route('female.withdrawals')} active={route().current('female.withdrawals')}>
                                            Withdraw
                                        </NavLink>
                                    </>
                                )}
                                {user.role === 'admin' && (
                                    <NavLink href={route('admin.dashboard')} active={route().current('admin.*')}>
                                        Admin
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden items-center gap-3 sm:flex">
                            {walletBalance != null && user.role !== 'admin' && (
                                <Link
                                    href={user.role === 'male' ? route('wallet.index') : route('female.withdrawals')}
                                    className="rounded-2xl bg-brand-soft px-3 py-1.5 text-sm font-extrabold text-brand"
                                >
                                    {formatMoney(walletBalance ?? 0, market)}
                                </Link>
                            )}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-2xl border border-brand/10 bg-white px-3 py-1.5 text-sm font-bold text-ink shadow-sm"
                                    >
                                        {user.name}
                                        <svg className="ms-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        <button
                            className="rounded-2xl p-2 text-slate-500 sm:hidden"
                            onClick={() => setShowingNavigationDropdown((v) => !v)}
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {showingNavigationDropdown && (
                    <div className="border-t border-brand/10 bg-white px-4 py-3 sm:hidden">
                        <ResponsiveNavLink href={homeHref}>Home</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('chat.index')}>Chat</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                        <ResponsiveNavLink method="post" href={route('logout')} as="button">
                            Log Out
                        </ResponsiveNavLink>
                    </div>
                )}
            </nav>

            {header && (
                <header className="border-b border-brand/5 bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">{header}</div>
                </header>
            )}

            {(flash?.success || flash?.error) && (
                <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
                    {flash.success && (
                        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                            {flash.error}
                        </div>
                    )}
                </div>
            )}

            {incomingCall && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-md">
                    <div className="card-soft w-full max-w-sm p-6 text-center">
                        <p className="text-lg font-extrabold text-brand">Incoming call</p>
                        <p className="mt-2 text-slate-500">
                            {incomingCall.type === 'video' ? 'Video' : 'Voice'} from {incomingCall.male.name}
                        </p>
                        {incomingError && (
                            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-left text-sm text-amber-800">
                                {incomingError}
                            </p>
                        )}
                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                type="button"
                                disabled={accepting}
                                onClick={() => void acceptIncoming()}
                                className="rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                            >
                                {accepting ? 'Connecting…' : 'Accept'}
                            </button>
                            <Link
                                href={route('calls.reject', incomingCall.id)}
                                method="post"
                                as="button"
                                className="rounded-2xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700"
                                onClick={() => setIncomingCall(null)}
                            >
                                Reject
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <main>{children}</main>
            <WhatsAppFloat />
        </div>
    );
}
