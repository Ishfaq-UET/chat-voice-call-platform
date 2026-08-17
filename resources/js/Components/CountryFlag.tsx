import { ImgHTMLAttributes } from 'react';

export function countryFlagSrc(code: string, width: 20 | 40 | 80 = 40): string {
    return `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`;
}

export default function CountryFlag({
    code,
    title,
    className = 'h-4 w-6',
    ...props
}: {
    code?: string | null;
    title?: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>) {
    if (!code) {
        return null;
    }

    return (
        <img
            src={countryFlagSrc(code, 40)}
            srcSet={`${countryFlagSrc(code, 80)} 2x`}
            alt={title ?? code}
            title={title ?? code}
            loading="lazy"
            className={`inline-block shrink-0 rounded-[3px] object-cover ring-1 ring-black/10 ${className}`}
            {...props}
        />
    );
}
