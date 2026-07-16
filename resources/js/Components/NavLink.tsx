import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'rounded-2xl px-3 py-2 text-sm font-bold transition ' +
                (active
                    ? 'bg-brand-soft text-brand'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-ink') +
                className
            }
        >
            {children}
        </Link>
    );
}
