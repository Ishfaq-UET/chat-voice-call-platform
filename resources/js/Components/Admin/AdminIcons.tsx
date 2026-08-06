import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function IconOverview(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
    );
}

export function IconUsers(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

export function IconShield(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
            <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}

export function IconWallet(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
            <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H19a1 1 0 0 1 1 1v2" />
            <rect x="2" y="8" width="20" height="12" rx="2" />
            <circle cx="16" cy="14" r="1.25" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function IconSettings(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}

export function IconSearch(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
        </svg>
    );
}

export function IconPlus(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
            <path d="M12 5v14M5 12h14" />
        </svg>
    );
}

export function IconUserPlus(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6M22 11h-6" />
        </svg>
    );
}

export function IconChevronDown(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

export function IconUsersGroup(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

export function IconArrowLeft(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
    );
}
