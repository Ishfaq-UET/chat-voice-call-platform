import AdminAvatar from '@/Components/Admin/AdminAvatar';

export default function AdminPersonCell({
    name,
    email,
    avatarUrl,
    meta,
    size = 'md',
}: {
    name: string;
    email?: string | null;
    avatarUrl?: string | null;
    meta?: string | null;
    size?: 'sm' | 'md' | 'lg';
}) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <AdminAvatar name={name} src={avatarUrl} size={size} />
            <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{name}</p>
                {email && <p className="truncate text-xs text-slate-500">{email}</p>}
                {meta && <p className="truncate text-xs text-slate-400">{meta}</p>}
            </div>
        </div>
    );
}
