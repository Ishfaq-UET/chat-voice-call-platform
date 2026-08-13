export interface User {
    id: number;
    name: string;
    email: string;
    role: 'male' | 'female' | 'admin';
    avatar_url?: string | null;
    verification_status?: string;
    is_banned?: boolean;
    is_online?: boolean;
    email_verified_at?: string;
    bio?: string | null;
    phone?: string | null;
    country_code?: string;
}

export interface Market {
    country_code: string;
    country_name: string;
    currency_code: string;
    currency_symbol: string;
    currency_symbol_first?: boolean;
}

export interface FemaleProfile {
    id: number;
    chat_price: number | string;
    voice_price: number | string;
    call_price_per_minute: number | string;
    bank_name?: string | null;
    bank_account?: string | null;
    bank_holder?: string | null;
}

export interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page?: number;
    last_page?: number;
    next_page_url?: string | null;
    prev_page_url?: string | null;
    from?: number | null;
    to?: number | null;
    total?: number;
    per_page?: number;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    flash?: {
        success?: string | null;
        error?: string | null;
    };
    walletBalance?: number | null;
    market?: Market | null;
    branding?: {
        logo_url: string | null;
        favicon_url: string | null;
        app_name: string;
    };
};
