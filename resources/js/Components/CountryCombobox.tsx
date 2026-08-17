import CountryFlag from '@/Components/CountryFlag';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { useEffect, useMemo, useRef, useState } from 'react';

export type CountryOption = {
    code: string;
    name: string;
    label: string;
    emoji?: string | null;
    flag?: string;
};

type CountryComboboxProps = {
    id?: string;
    label?: string;
    countries: CountryOption[];
    value: string;
    onChange: (code: string) => void;
    error?: string;
    hint?: string;
};

export default function CountryCombobox({
    id = 'country_code',
    label = 'Country',
    countries,
    value,
    onChange,
    error,
    hint,
}: CountryComboboxProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const rootRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selected = countries.find((c) => c.code === value);

    const filteredCountries = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return countries;

        return countries.filter(
            (c) =>
                c.label.toLowerCase().includes(q) ||
                c.name.toLowerCase().includes(q) ||
                c.code.toLowerCase().includes(q),
        );
    }, [countries, search]);

    const openDropdown = () => {
        setOpen(true);
        requestAnimationFrame(() => searchRef.current?.focus());
    };

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', onPointerDown);

        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [open]);

    useEffect(() => {
        if (!open || !value || !listRef.current) return;

        const active = listRef.current.querySelector(`[data-code="${value}"]`);
        active?.scrollIntoView({ block: 'nearest' });
    }, [open, value, filteredCountries.length]);

    return (
        <div ref={rootRef}>
            <InputLabel htmlFor={id} value={label} />

            <button
                id={id}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => (open ? setOpen(false) : openDropdown())}
                className="mt-1 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-ink shadow-sm transition hover:border-slate-300 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
                <span className={`flex min-w-0 items-center gap-2.5 ${selected ? 'font-medium' : 'text-slate-400'}`}>
                    {selected && <CountryFlag code={selected.code} title={selected.name} />}
                    <span className="truncate">{selected?.label ?? 'Select your country'}</span>
                </span>
                <svg
                    className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {open && (
                <div className="relative z-20 mt-2">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5">
                        <div className="border-b border-slate-100 p-2">
                            <input
                                ref={searchRef}
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search country…"
                                className="block w-full rounded-lg border-slate-200 px-3 py-2 text-sm focus:border-brand focus:ring-brand"
                            />
                        </div>
                        <ul
                            ref={listRef}
                            role="listbox"
                            aria-label="Countries"
                            className="max-h-52 overflow-y-auto py-1"
                        >
                            {filteredCountries.length === 0 && (
                                <li className="px-3 py-2 text-sm text-slate-500">No countries found.</li>
                            )}
                            {filteredCountries.map((country) => {
                                const active = country.code === value;

                                return (
                                    <li key={country.code}>
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={active}
                                            data-code={country.code}
                                            onClick={() => {
                                                onChange(country.code);
                                                setOpen(false);
                                                setSearch('');
                                            }}
                                            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                                                active
                                                    ? 'bg-brand-soft font-semibold text-brand'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <CountryFlag code={country.code} title={country.name} />
                                            <span className="min-w-0 truncate">{country.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}

            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
            <InputError message={error} className="mt-2" />

            <input type="hidden" name="country_code" value={value} required />
        </div>
    );
}
