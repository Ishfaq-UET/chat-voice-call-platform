import SiteLogo from '@/Components/SiteLogo';
import WelcomeBanner from '@/Components/WelcomeBanner';
import { PropsWithChildren } from 'react';

export default function Guest({
    children,
    title,
    subtitle,
}: PropsWithChildren<{ title?: string; subtitle?: string }>) {
    return (
        <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-to-b from-lilac via-white to-canvas px-4 py-10">
            <WelcomeBanner />
            <div className="absolute inset-x-0 top-0 bg-brand px-4 py-2 text-center text-xs font-bold text-white">
                Create an account to save chats, wallets, and call history
            </div>

            <div className="relative z-10 mx-auto w-full max-w-md pt-8">
                <div className="mb-8 text-center">
                    <SiteLogo
                        className="justify-center"
                        markClassName="h-10 w-10"
                        textClassName="text-2xl font-extrabold text-brand"
                    />
                    {title && <h1 className="mt-5 text-2xl font-extrabold text-ink">{title}</h1>}
                    {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
                </div>

                <div className="card-soft border border-brand/10 p-6 sm:p-8">{children}</div>

                <p className="mt-6 text-center text-xs font-medium text-slate-400">
                    Members-only access · Chat, calls & wallets unlock after login
                </p>
            </div>
        </div>
    );
}
