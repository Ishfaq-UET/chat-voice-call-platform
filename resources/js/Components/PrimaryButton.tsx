import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-2xl border border-transparent bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-soft transition hover:bg-brand-deep focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
                    disabled ? 'opacity-40' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
