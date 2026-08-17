type AdminAvatarProps = {
    name: string;
    src?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

const sizes = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
};

export default function AdminAvatar({ name, src, size = 'md', className = '' }: AdminAvatarProps) {
    const initial = name.trim().charAt(0).toUpperCase() || '?';

    return (
        <span
            className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft font-extrabold text-brand ring-1 ring-brand/10 ${sizes[size]} ${className}`}
        >
            {src ? (
                <img src={src} alt={name} className="h-full w-full object-cover" />
            ) : (
                initial
            )}
        </span>
    );
}
