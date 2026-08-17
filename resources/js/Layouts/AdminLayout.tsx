import Dropdown from '@/Components/Dropdown';
import {
    IconBanner,
    IconChat,
    IconChevronDown,
    IconLedger,
    IconMoney,
    IconOverview,
    IconPhone,
    IconRename,
    IconSettings,
    IconShield,
    IconTopUp,
    IconUsers,
    IconWallet,
} from '@/Components/Admin/AdminIcons';
import AdminAvatar from '@/Components/Admin/AdminAvatar';
import SiteLogo from '@/Components/SiteLogo';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ComponentType, PropsWithChildren, ReactNode, SVGProps, useState } from 'react';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const adminLinks: {
    href: string;
    label: string;
    match: string;
    icon: IconComponent;
}[] = [
    { href: 'admin.dashboard', label: 'Overview', match: 'admin.dashboard', icon: IconOverview },
    { href: 'admin.users', label: 'Users', match: 'admin.users*', icon: IconUsers },
    { href: 'admin.verifications', label: 'Verifications', match: 'admin.verifications*', icon: IconShield },
    { href: 'admin.name-changes', label: 'Name changes', match: 'admin.name-changes*', icon: IconRename },
    { href: 'admin.chats', label: 'Chats & voices', match: 'admin.chats*', icon: IconChat },
    { href: 'admin.calls', label: 'Calls', match: 'admin.calls*', icon: IconPhone },
    { href: 'admin.top-ups', label: 'Top-up requests', match: 'admin.top-ups*', icon: IconTopUp },
    { href: 'admin.payment-methods', label: 'Payment methods', match: 'admin.payment-methods*', icon: IconMoney },
    { href: 'admin.transactions', label: 'Transactions', match: 'admin.transactions*', icon: IconLedger },
    { href: 'admin.withdrawals', label: 'Withdrawals', match: 'admin.withdrawals*', icon: IconWallet },
    { href: 'admin.banners', label: 'Banners', match: 'admin.banners*', icon: IconBanner },
    { href: 'admin.settings', label: 'Settings', match: 'admin.settings*', icon: IconSettings },
];

function NavLink({
    href,
    label,
    match,
    icon: Icon,
    onNavigate,
}: {
    href: string;
    label: string;
    match: string;
    icon: IconComponent;
    onNavigate?: () => void;
}) {
    const base = match.replace(/\*$/, '');
    const active = route().current(base) || route().current(`${base}.*`);

    return (
        <Link
            href={route(href)}
            onClick={onNavigate}
            className={`relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-bold transition ${
                active
                    ? 'bg-brand-soft text-brand'
                    : 'text-slate-600 hover:bg-brand-soft/60 hover:text-brand'
            }`}
        >
            {active && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-brand" />}
            <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    active ? 'bg-white text-brand shadow-sm' : 'bg-canvas text-slate-500'
                }`}
            >
                <Icon />
            </span>
            {label}
        </Link>
    );
}

export default function AdminLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, flash } = usePage<PageProps>().props;
    const user = auth.user!;
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-canvas">
            <div className="bg-brand px-4 py-2 text-center text-xs font-bold text-white sm:text-sm">
                Admin panel · Wyak Dating
            </div>

            <div className="flex min-h-[calc(100vh-36px)]">
                {/* Desktop sidebar */}
                <aside className="hidden w-[260px] shrink-0 flex-col border-r border-brand/10 bg-white lg:flex">
                    <div className="border-b border-brand/10 px-5 py-5">
                        <SiteLogo
                            href={route('admin.dashboard')}
                            textClassName="text-[15px] font-extrabold tracking-tight text-brand"
                            subtitle={
                                <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Admin
                                </span>
                            }
                        />
                    </div>

                    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                        {adminLinks.map((item) => (
                            <NavLink key={item.href} {...item} />
                        ))}
                    </nav>

                    <div className="border-t border-brand/10 p-4">
                        <div className="flex items-center gap-3 rounded-2xl bg-canvas px-3 py-2.5">
                            <AdminAvatar name={user.name} src={user.avatar_url} />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-ink">{user.name}</p>
                                <p className="truncate text-[11px] capitalize text-slate-400">{user.role}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-brand/10 bg-white/90 px-4 py-3 backdrop-blur-xl lg:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                className="rounded-2xl bg-brand-soft px-3 py-2 text-sm font-bold text-brand lg:hidden"
                                onClick={() => setOpen((v) => !v)}
                            >
                                Menu
                            </button>
                            <div className="min-w-0 text-lg font-extrabold text-ink">{header}</div>
                        </div>

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2.5 rounded-2xl border border-brand/10 bg-white px-2.5 py-1.5 text-left shadow-sm transition hover:bg-brand-soft/50"
                                >
                                    <AdminAvatar name={user.name} src={user.avatar_url} size="sm" />
                                    <span className="hidden sm:block">
                                        <span className="block text-sm font-bold text-ink">{user.name}</span>
                                        <span className="block text-[11px] capitalize text-slate-400">{user.role}</span>
                                    </span>
                                    <IconChevronDown className="text-slate-400" />
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content width="48" contentClasses="py-1 bg-white">
                                <Dropdown.Link href={route('profile.edit')}>My profile</Dropdown.Link>
                                <Dropdown.Link href="/">View site</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </header>

                    {open && (
                        <div className="space-y-1 border-b border-brand/10 bg-white p-3 lg:hidden">
                            {adminLinks.map((item) => (
                                <NavLink key={item.href} {...item} onNavigate={() => setOpen(false)} />
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
