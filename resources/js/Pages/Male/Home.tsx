import Pagination from '@/Components/Pagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FemaleProfile, PageProps, Paginated, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type FemaleCard = User & {
    female_profile?: FemaleProfile | null;
    avatar_url?: string | null;
    is_online?: boolean;
};

type FemalePage = Paginated<FemaleCard> & {
    from?: number | null;
    to?: number | null;
    total?: number;
};

export default function Home({
    females,
    filters,
    walletBalance,
    stats,
}: PageProps<{
    females: FemalePage;
    filters: {
        online?: boolean;
        q?: string;
        max_chat_price?: string;
        max_call_price?: string;
        sort?: string;
    };
    walletBalance: number;
    stats: { total: number; online: number };
}>) {
    const [q, setQ] = useState(filters.q ?? '');
    const [online, setOnline] = useState(!!filters.online);
    const [maxChat, setMaxChat] = useState(filters.max_chat_price ?? '');
    const [maxCall, setMaxCall] = useState(filters.max_call_price ?? '');
    const [sort, setSort] = useState(filters.sort ?? 'online');

    const applyFilters = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('home'),
            {
                q: q || undefined,
                online: online ? 1 : undefined,
                max_chat_price: maxChat || undefined,
                max_call_price: maxCall || undefined,
                sort: sort !== 'online' ? sort : undefined,
            },
            { preserveState: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Discover" />

            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-extrabold text-ink">Discover creators</h1>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                            {stats.online} online · {stats.total} verified · Balance $
                            {Number(walletBalance).toFixed(2)}
                        </p>
                    </div>
                    <Link href={route('wallet.index')} className="btn-brand !py-2.5">
                        Top up wallet
                    </Link>
                </div>

                {/* Pastel filter modules like StrangerLine */}
                <form onSubmit={applyFilters} className="mb-8 space-y-4">
                    <div className="rounded-[28px] bg-lilac p-4 sm:p-5">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
                                ⌕
                            </div>
                            <div className="min-w-[200px] flex-1">
                                <p className="text-sm font-extrabold text-ink">Search interests & names</p>
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Type a name or bio keyword…"
                                    className="mt-1 w-full rounded-2xl border-0 bg-white/80 text-sm shadow-sm focus:ring-2 focus:ring-brand"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] bg-mint p-4 sm:p-5">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                                ♀
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-extrabold text-ink">Availability & sorting</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setOnline(false)}
                                        className={`rounded-full px-4 py-2 text-sm font-bold ${
                                            !online ? 'bg-brand text-white' : 'bg-white text-slate-600'
                                        }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOnline(true)}
                                        className={`rounded-full px-4 py-2 text-sm font-bold ${
                                            online ? 'bg-brand text-white' : 'bg-white text-slate-600'
                                        }`}
                                    >
                                        Online only
                                    </button>
                                    <select
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value)}
                                        className="rounded-full border-0 bg-white text-sm font-bold text-slate-600 shadow-sm focus:ring-brand"
                                    >
                                        <option value="online">Online first</option>
                                        <option value="chat_price">Lowest chat price</option>
                                        <option value="call_price">Lowest call price</option>
                                        <option value="newest">Newest</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] bg-skyish p-4 sm:p-5">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                                $
                            </div>
                            <div className="grid flex-1 gap-3 sm:grid-cols-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Max chat $</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={maxChat}
                                        onChange={(e) => setMaxChat(e.target.value)}
                                        className="mt-1 w-full rounded-2xl border-0 bg-white text-sm shadow-sm focus:ring-brand"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Max call $/min</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={maxCall}
                                        onChange={(e) => setMaxCall(e.target.value)}
                                        className="mt-1 w-full rounded-2xl border-0 bg-white text-sm shadow-sm focus:ring-brand"
                                    />
                                </div>
                                <button type="submit" className="btn-brand h-[42px] self-end">
                                    Apply filters
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {females.data.map((female) => {
                        const profile = female.female_profile;
                        return (
                            <article key={female.id} className="card-soft overflow-hidden transition hover:-translate-y-1 hover:shadow-float">
                                <div className="relative aspect-[4/3] bg-brand-soft">
                                    {female.avatar_url ? (
                                        <img
                                            src={female.avatar_url}
                                            alt={female.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-5xl font-extrabold text-brand">
                                            {female.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="absolute left-3 top-3 flex gap-2">
                                        <span
                                            className={`chip ${
                                                female.is_online
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-black/50 text-white'
                                            }`}
                                        >
                                            {female.is_online ? 'Online' : 'Offline'}
                                        </span>
                                        <span className="chip bg-white text-brand">Verified</span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="text-xl font-extrabold text-ink">{female.name}</h3>
                                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                        {female.bio || 'No bio yet.'}
                                    </p>

                                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-3xl bg-canvas p-3 text-center">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                Chat
                                            </p>
                                            <p className="font-extrabold text-ink">
                                                ${Number(profile?.chat_price ?? 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                Voice
                                            </p>
                                            <p className="font-extrabold text-ink">
                                                ${Number(profile?.voice_price ?? 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                Call
                                            </p>
                                            <p className="font-extrabold text-ink">
                                                ${Number(profile?.call_price_per_minute ?? 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <Link
                                            href={route('creators.show', female.id)}
                                            className="rounded-2xl border-2 border-brand/15 py-2.5 text-center text-sm font-bold text-brand hover:bg-brand-soft"
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            href={route('chat.start', female.id)}
                                            method="post"
                                            as="button"
                                            className="rounded-2xl bg-brand py-2.5 text-center text-sm font-bold text-white hover:bg-brand-deep"
                                        >
                                            Chat
                                        </Link>
                                        <Link
                                            href={route('calls.start', female.id)}
                                            method="post"
                                            data={{ type: 'audio' }}
                                            as="button"
                                            className="rounded-2xl bg-ink py-2.5 text-center text-sm font-bold text-white hover:bg-ink-soft"
                                        >
                                            Audio
                                        </Link>
                                        <Link
                                            href={route('calls.start', female.id)}
                                            method="post"
                                            data={{ type: 'video' }}
                                            as="button"
                                            className="rounded-2xl bg-brand py-2.5 text-center text-sm font-bold text-white hover:bg-brand-deep"
                                        >
                                            Video
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {females.data.length === 0 && (
                    <div className="card-soft py-16 text-center">
                        <p className="text-xl font-extrabold text-ink">No creators found</p>
                        <p className="mt-2 text-sm text-slate-500">Try clearing filters.</p>
                    </div>
                )}

                <Pagination links={females.links} from={females.from} to={females.to} total={females.total} />
            </div>
        </AuthenticatedLayout>
    );
}
