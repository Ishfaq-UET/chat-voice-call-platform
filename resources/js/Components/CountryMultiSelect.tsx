import CountryFlag from '@/Components/CountryFlag';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { CountryOption } from '@/Components/CountryCombobox';
import { useEffect, useMemo, useRef, useState } from 'react';

type CountryMultiSelectProps = {
    id?: string;
    label?: string;
    countries: CountryOption[];
    value: string[];
    onChange: (codes: string[]) => void;
    error?: string;
    hint?: string;
};

export default function CountryMultiSelect({
    id = 'country_codes',
    label = 'Countries',
    countries,
    value,
    onChange,
    error,
    hint,
}: CountryMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const rootRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selectedSet = useMemo(() => new Set(value), [value]);
    const selectedCountries = useMemo(
        () => countries.filter((c) => selectedSet.has(c.code)),
        [countries, selectedSet],
    );

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

    const toggle = (code: string) => {
        if (selectedSet.has(code)) {
            onChange(value.filter((c) => c !== code));
            return;
        }
        onChange([...value, code]);
    };

    const selectAllFiltered = () => {
        const next = new Set(value);
        filteredCountries.forEach((c) => next.add(c.code));
        onChange(Array.from(next));
    };

    return (
        <div ref={rootRef}>
            <InputLabel htmlFor={id} value={label} />

            {selectedCountries.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedCountries.map((country) => (
                        <button
                            key={country.code}
                            type="button"
                            onClick={() => toggle(country.code)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand"
                        >
                            <CountryFlag code={country.code} title={country.name} className="h-3 w-4" />
                            {country.name}
                            <span aria-hidden className="text-brand/70">
                                ×
                            </span>
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => onChange([])}
                        className="text-xs font-bold text-slate-400 hover:text-rose-600"
                    >
                        Clear all
                    </button>
                </div>
            )}

            <button
                id={id}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => (open ? setOpen(false) : openDropdown())}
                className="mt-2 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-ink shadow-sm transition hover:border-slate-300 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
                <span className={selectedCountries.length ? 'font-medium' : 'text-slate-400'}>
                    {selectedCountries.length
                        ? `${selectedCountries.length} ${selectedCountries.length === 1 ? 'country' : 'countries'} selected`
                        : 'Search and select countries'}
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
                        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                            <p className="text-xs font-semibold text-slate-400">
                                {filteredCountries.length} shown
                            </p>
                            <button
                                type="button"
                                onClick={selectAllFiltered}
                                className="text-xs font-bold text-brand hover:underline"
                            >
                                Select all shown
                            </button>
                        </div>
                        <ul role="listbox" aria-multiselectable="true" aria-label="Countries" className="max-h-56 overflow-y-auto py-1">
                            {filteredCountries.length === 0 && (
                                <li className="px-3 py-2 text-sm text-slate-500">No countries found.</li>
                            )}
                            {filteredCountries.map((country) => {
                                const active = selectedSet.has(country.code);

                                return (
                                    <li key={country.code}>
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={active}
                                            onClick={() => toggle(country.code)}
                                            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                                                active
                                                    ? 'bg-brand-soft font-semibold text-brand'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span
                                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                                    active
                                                        ? 'border-brand bg-brand text-white'
                                                        : 'border-slate-300 bg-white'
                                                }`}
                                            >
                                                {active && (
                                                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M2.5 6.5 5 9l4.5-6" />
                                                    </svg>
                                                )}
                                            </span>
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
        </div>
    );
}
