import { InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes } from 'react';

export function AdminField({
    label,
    required,
    hint,
    children,
}: PropsWithChildren<{ label: string; required?: boolean; hint?: string }>) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-bold text-ink">
                {label}
                {required && <span className="ml-0.5 text-rose-500">*</span>}
            </label>
            {children}
            {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
        </div>
    );
}

const inputClass =
    'w-full rounded-2xl border-brand/15 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm placeholder:text-slate-400 focus:border-brand focus:ring-brand';

export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function AdminSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
    return <select {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}
