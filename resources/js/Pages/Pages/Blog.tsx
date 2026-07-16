import MarketingLayout from '@/Layouts/MarketingLayout';
import { Head, Link } from '@inertiajs/react';

type Post = {
    slug: string;
    tag: string;
    title: string;
    excerpt: string;
    date: string;
    tone?: string;
};

export default function Blog({ posts }: { posts: Post[] }) {
    const tones = ['bg-lilac', 'bg-mint', 'bg-skyish', 'bg-brand-soft'];

    return (
        <MarketingLayout>
            <Head title="Tips & guides" />
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">From the blog</p>
                <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">Tips & guides</h1>
                <p className="mt-4 max-w-2xl text-lg text-slate-500">
                    Practical notes for safer chatting, clearer pricing, and better creator setup.
                </p>

                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {posts.map((post, i) => (
                        <Link
                            key={post.slug}
                            href={route('blog.show', post.slug)}
                            className="card-soft group overflow-hidden transition hover:-translate-y-1 hover:shadow-float"
                        >
                            <div className={`h-36 ${post.tone || tones[i % tones.length]}`} />
                            <div className="p-6">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-bold uppercase tracking-wide text-brand">{post.tag}</p>
                                    <p className="text-xs text-slate-400">{post.date}</p>
                                </div>
                                <h2 className="mt-2 text-lg font-extrabold text-ink group-hover:text-brand">
                                    {post.title}
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-slate-500">{post.excerpt}</p>
                                <span className="mt-4 inline-flex text-sm font-bold text-brand">
                                    Read article →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </MarketingLayout>
    );
}
