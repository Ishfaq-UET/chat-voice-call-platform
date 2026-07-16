import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

const adminLinks = [
    { href: 'admin.dashboard', label: 'Overview', match: 'admin.dashboard' },
    { href: 'admin.users', label: 'Users', match: 'admin.users' },
    { href: 'admin.verifications', label: 'Verifications', match: 'admin.verifications' },
    { href: 'admin.withdrawals', label: 'Withdrawals', match: 'admin.withdrawals' },
    { href: 'admin.settings', label: 'Settings', match: 'admin.settings' },
] as const;

export default function AdminLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, flash } = usePage<PageProps>().props;
    const user = auth.user!;
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-canvas">
            <div className="bg-brand px-4 py-2 text-center text-xs font-bold text-white">
                Admin panel · ChatVoiceCall
            </div>

            <div className="flex min-h-[calc(100vh-36px)]">
                {/* Desktop sidebar */}
                <aside className="hidden w-64 shrink-0 border-r border-brand/10 bg-white lg:flex lg:flex-col">
                    <div className="border-b border-brand/10 px-5 py-5">
                        <Link href={route('admin.dashboard')} className="inline-flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand text-sm font-black text-white">
                                CV
                            </span>
                            <div>
                                <p className="text-sm font-extrabold text-brand">ChatVoiceCall</p>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Admin
                                </p>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex-1 space-y-1 p-3">
                        {adminLinks.map((item) => {
                            const active = route().current(item.match);
                            return (
                                <Link
                                    key={item.href}
                                    href={route(item.href)}
                                    className={`flex items-center rounded-2xl px-4 py-3 text-sm font-bold transition ${
                                        active
                                            ? 'bg-brand text-white shadow-soft'
                                            : 'text-slate-600 hover:bg-brand-soft hover:text-brand'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t border-brand/10 p-4">
                        <p className="truncate text-sm font-bold text-ink">{user.name}</p>
                        <p className="truncate text-xs text-slate-400">{user.email}</p>
                        <div className="mt-3 flex gap-2">
                            <Link
                                href={route('profile.edit')}
                                className="rounded-xl bg-canvas px-3 py-1.5 text-xs font-bold text-slate-600"
                            >
                                Profile
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="rounded-xl bg-canvas px-3 py-1.5 text-xs font-bold text-slate-600"
                            >
                                Log out
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-brand/10 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="rounded-2xl bg-brand-soft px-3 py-2 text-sm font-bold text-brand lg:hidden"
                                onClick={() => setOpen((v) => !v)}
                            >
                                Menu
                            </button>
                            <div>{header}</div>
                        </div>
                        <Link href="/" className="text-xs font-bold text-slate-400 hover:text-brand">
                            View site
                        </Link>
                    </header>

                    {open && (
                        <div className="border-b border-brand/10 bg-white p-3 lg:hidden">
                            {adminLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={route(item.href)}
                                    className="block rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-brand-soft"
                                    onClick={() => setOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {(flash?.success || flash?.error) && (
                        <div className="px-4 pt-4 lg:px-6">
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

                    <main className="flex-1">{children}</main>
                </div>
            </div>
        </div>
    );
}
