import MarketingLayout from '@/Layouts/MarketingLayout';
import { Head, Link } from '@inertiajs/react';

type Section = {
    heading: string;
    body?: string;
    features?: string[];
};

type Post = {
    slug: string;
    tag: string;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    sections: Section[];
};

type Related = {
    slug: string;
    tag: string;
    title: string;
    excerpt: string;
    date: string;
    tone?: string;
};

export default function BlogShow({
    post,
    related,
}: {
    post: Post;
    related: Related[];
}) {
    return (
        <MarketingLayout>
            <Head title={post.title} />

            <div className="bg-lilac/50 pb-20 pt-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                        <Link href="/" className="hover:text-brand">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href={route('blog')} className="hover:text-brand">
                            Blog
                        </Link>
                        <span>/</span>
                        <span className="line-clamp-1 text-ink">{post.title}</span>
                    </nav>

                    <article className="card-soft overflow-hidden border border-brand/5">
                        <div className="p-6 sm:p-10">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="chip bg-brand-soft uppercase tracking-wide text-brand">
                                    {post.tag}
                                </span>
                                <span className="text-sm font-medium text-slate-400">{post.date}</span>
                                <span className="text-sm font-medium text-slate-400">· {post.author}</span>
                            </div>

                            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-[2.5rem]">
                                {post.title}
                            </h1>
                            <p className="mt-4 text-lg leading-relaxed text-slate-500">{post.excerpt}</p>

                            <div className="mt-10 space-y-10">
                                {post.sections.map((section) => (
                                    <section key={section.heading}>
                                        <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
                                            {section.heading}
                                        </h2>
                                        {section.body && (
                                            <p className="mt-3 text-base leading-relaxed text-slate-600">
                                                {section.body}
                                            </p>
                                        )}
                                        {section.features && section.features.length > 0 && (
                                            <div className="mt-5 rounded-[24px] bg-brand-soft/80 p-5 sm:p-6">
                                                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand">
                                                    Key features
                                                </p>
                                                <ul className="mt-4 space-y-3">
                                                    {section.features.map((feature) => (
                                                        <li
                                                            key={feature}
                                                            className="flex items-start gap-3 text-sm font-medium text-ink"
                                                        >
                                                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-black text-white">
                                                                ✓
                                                            </span>
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </section>
                                ))}
                            </div>

                            <div className="mt-12 flex justify-center border-t border-slate-100 pt-8">
                                <Link
                                    href={route('blog')}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-soft transition hover:bg-brand-deep"
                                >
                                    <span aria-hidden>←</span> Back to Blog
                                </Link>
                            </div>
                        </div>
                    </article>

                    {related.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-xl font-extrabold text-ink">More from the blog</h2>
                            <div className="mt-5 grid gap-4 sm:grid-cols-3">
                                {related.map((item) => (
                                    <Link
                                        key={item.slug}
                                        href={route('blog.show', item.slug)}
                                        className="card-soft block p-5 transition hover:-translate-y-0.5 hover:shadow-float"
                                    >
                                        <p className="text-xs font-bold uppercase tracking-wide text-brand">
                                            {item.tag}
                                        </p>
                                        <h3 className="mt-2 text-sm font-extrabold text-ink">{item.title}</h3>
                                        <p className="mt-2 line-clamp-2 text-xs text-slate-500">{item.excerpt}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed bottom-5 right-5 z-40 hidden sm:block">
                <Link
                    href={route('register')}
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-extrabold text-white shadow-float transition hover:bg-brand-deep"
                >
                    Talk to a creator
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand">
                        →
                    </span>
                </Link>
            </div>
        </MarketingLayout>
    );
}
