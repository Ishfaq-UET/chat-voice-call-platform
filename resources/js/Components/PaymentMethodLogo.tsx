type PaymentMethodLogoProps = {
    src?: string | null;
    name: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

const sizes = {
    sm: 'h-7 w-12',
    md: 'h-8 w-14',
    lg: 'h-9 w-16',
};

export default function PaymentMethodLogo({
    src,
    name,
    size = 'md',
    className = '',
}: PaymentMethodLogoProps) {
    const initial = name.trim().charAt(0).toUpperCase() || '?';

    return (
        <span
            className={`relative block ${sizes[size]} shrink-0 overflow-hidden rounded-lg ring-1 ring-slate-200/80 ${className}`}
        >
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className="absolute inset-0 h-full w-full object-contain"
                />
            ) : (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-brand">
                    {initial}
                </span>
            )}
        </span>
    );
}
