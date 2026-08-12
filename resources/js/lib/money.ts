import { Market } from '@/types';

export function formatMoney(
    amount: number | string,
    market?: Market | null,
    options?: { decimals?: number },
): string {
    const value = Number(amount);
    const decimals = options?.decimals ?? 2;
    const symbol = market?.currency_symbol ?? '$';
    const formatted = value.toFixed(decimals);

    if (market?.currency_symbol_first === false) {
        return `${formatted} ${symbol}`.trim();
    }

    return `${symbol}${formatted}`;
}
