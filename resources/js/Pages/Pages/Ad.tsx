import { Head } from '@inertiajs/react';
import { type ReactNode } from 'react';

function WhatsAppIcon({ className = 'h-6 w-6' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

function WhatsAppCta({
    href,
    label = 'Contact on WhatsApp',
    size = 'default',
    className = '',
}: {
    href: string;
    label?: string;
    size?: 'default' | 'large' | 'compact';
    className?: string;
}) {
    const sizeClasses = {
        compact: 'gap-2 rounded-2xl px-5 py-3.5 text-base',
        default: 'gap-3 rounded-2xl px-7 py-4 text-lg',
        large: 'gap-3.5 rounded-3xl px-10 py-5 text-xl sm:text-2xl',
    };

    const iconClasses = {
        compact: 'h-5 w-5',
        default: 'h-6 w-6',
        large: 'h-7 w-7 sm:h-8 sm:w-8',
    };

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex w-full items-center justify-center bg-[#25D366] font-extrabold text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.55)] transition hover:scale-[1.02] hover:bg-[#1ebe57] hover:shadow-[0_16px_36px_-8px_rgba(37,211,102,0.65)] sm:w-auto ${sizeClasses[size]} ${className}`}
        >
            <WhatsAppIcon className={iconClasses[size]} />
            {label}
        </a>
    );
}

function SideCta({ href, side }: { href: string; side: 'left' | 'right' }) {
    return (
        <aside
            className={`hidden shrink-0 2xl:block 2xl:w-64 ${
                side === 'left' ? '2xl:pr-6' : '2xl:pl-6'
            }`}
        >
            <div className="sticky top-10">
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-[32px] border-2 border-[#25D366]/25 bg-white p-7 text-center shadow-[0_20px_50px_-20px_rgba(37,211,102,0.35)] transition hover:-translate-y-1 hover:border-[#25D366]/50 hover:shadow-[0_24px_60px_-20px_rgba(37,211,102,0.45)]"
                >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] transition group-hover:scale-110 group-hover:bg-[#25D366]/15">
                        <WhatsAppIcon className="h-11 w-11" />
                    </div>
                    <p className="mt-5 text-xl font-extrabold text-ink">Official WhatsApp</p>
                    <p className="mt-2 text-base leading-relaxed text-slate-500">
                        Tap here to message our company representative
                    </p>
                    <span className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-lg font-extrabold text-white">
                        <WhatsAppIcon className="h-6 w-6" />
                        Chat now
                    </span>
                </a>
            </div>
        </aside>
    );
}

function ImportantNotice({ children, dir }: { children: ReactNode; dir?: 'rtl' | 'ltr' }) {
    return (
        <div
            dir={dir}
            className="flex gap-4 rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 px-6 py-5 sm:px-8 sm:py-6"
        >
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-lg font-black text-white">
                !
            </span>
            <p className="text-lg font-bold leading-relaxed text-amber-950 sm:text-xl sm:leading-relaxed">
                {children}
            </p>
        </div>
    );
}

function ContentSection({
    title,
    dir,
    lang,
    children,
}: {
    title: string;
    dir?: 'rtl' | 'ltr';
    lang?: string;
    children: ReactNode;
}) {
    return (
        <section
            dir={dir}
            lang={lang}
            className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_20px_60px_-30px_rgba(30,27,75,0.18)]"
        >
            <div className="border-b border-slate-100 bg-slate-50/80 px-7 py-5 sm:px-10 sm:py-6">
                <h2 className="text-2xl font-extrabold tracking-tight text-brand sm:text-3xl">{title}</h2>
            </div>
            <div className="space-y-6 px-7 py-7 text-lg leading-[1.85] text-slate-700 sm:space-y-7 sm:px-10 sm:py-9 sm:text-xl sm:leading-[1.9]">
                {children}
            </div>
        </section>
    );
}

export default function Ad({ whatsapp_url }: { whatsapp_url: string | null }) {
    const whatsappUrl = whatsapp_url;

    return (
        <>
            <Head title="Work with us" />

            <div className="relative min-h-screen overflow-x-hidden bg-[#f4f6fb]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#25D366]/10 blur-3xl" />
                    <div className="absolute -right-24 top-32 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
                    <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-100/60 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
                    <header className="mx-auto mb-10 max-w-4xl text-center sm:mb-14">
                        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#25D366]/20 bg-white px-5 py-2.5 text-base font-bold text-[#128C7E] shadow-sm sm:text-lg">
                            <WhatsAppIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            Official company opportunity
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
                            Work with our company
                        </h1>
                        <p className="mx-auto mt-5 max-w-3xl text-xl leading-relaxed text-slate-600 sm:text-2xl sm:leading-relaxed">
                            Read the details below carefully, then contact us on WhatsApp to take the next step.
                        </p>
                        <div className="mt-8 2xl:hidden">
                            {whatsappUrl ? (
                                <WhatsAppCta href={whatsappUrl} size="large" className="mx-auto max-w-md" />
                            ) : (
                                <p className="text-lg font-semibold text-slate-500">
                                    WhatsApp contact is not configured yet.
                                </p>
                            )}
                        </div>
                    </header>

                    <div className="flex items-start justify-center gap-8 2xl:gap-10">
                        {whatsappUrl && <SideCta href={whatsappUrl} side="left" />}

                        <main className="min-w-0 w-full max-w-4xl flex-1 space-y-8 sm:space-y-10">
                            <ContentSection title="English">
                                <p>
                                    If you are genuinely interested in working with our company and agree to the
                                    terms, conditions, and working process, we would be happy to proceed with the
                                    next steps.
                                </p>
                                <p>
                                    To continue, please click on the WhatsApp link provided below and contact our
                                    official company representative through WhatsApp. Our team will provide you with
                                    all the necessary information regarding the work, requirements, policies, and
                                    further procedure.
                                </p>
                                <ImportantNotice>
                                    Important: Please make sure to contact us through the provided official WhatsApp
                                    channel so that your request can be properly verified and processed.
                                </ImportantNotice>
                                <p>
                                    Thank you for your interest and cooperation. We look forward to working with you.
                                </p>
                            </ContentSection>

                            <ContentSection title="اردو" dir="rtl" lang="ur">
                                <p>
                                    اگر آپ ہماری کمپنی کے ساتھ کام کرنے میں حقیقی طور پر دلچسپی رکھتے ہیں اور ہماری
                                    شرائط، قوانین اور ورکنگ پروسیس سے متفق ہیں، تو ہم آپ کے ساتھ اگلے مرحلے پر کام
                                    شروع کرنے کے لیے تیار ہیں۔
                                </p>
                                <p>
                                    مزید معلومات اور کام کے طریقۂ کار کو سمجھنے کے لیے نیچے دیے گئے WhatsApp لنک پر
                                    کلک کریں اور ہماری کمپنی کے آفیشل نمائندے سے WhatsApp کے ذریعے رابطہ کریں۔ ہماری
                                    ٹیم آپ کو کام کی تمام ضروری معلومات، شرائط، پالیسیز، ذمہ داریوں اور آگے کے مکمل
                                    طریقۂ کار کے بارے میں رہنمائی فراہم کرے گی۔
                                </p>
                                <ImportantNotice dir="rtl">
                                    اہم: براہِ کرم صرف دیے گئے آفیشل WhatsApp چینل کے ذریعے رابطہ کریں تاکہ آپ کی
                                    درخواست کو مناسب طریقے سے ویریفائی اور پروسیس کیا جا سکے۔
                                </ImportantNotice>
                                <p>
                                    آپ کی دلچسپی اور تعاون کا شکریہ۔ ہمیں امید ہے کہ ہم آپ کے ساتھ ایک اچھا اور طویل
                                    مدتی کاروباری تعلق قائم کر سکیں گے۔
                                </p>
                            </ContentSection>

                            {whatsappUrl && (
                                <section className="rounded-[32px] border-2 border-[#25D366]/20 bg-gradient-to-br from-[#25D366]/10 via-white to-[#25D366]/5 px-7 py-10 text-center sm:px-12 sm:py-14">
                                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_16px_40px_-12px_rgba(37,211,102,0.6)]">
                                        <WhatsAppIcon className="h-14 w-14" />
                                    </div>
                                    <h2 className="mt-6 text-3xl font-extrabold text-ink sm:text-4xl">
                                        Ready to get started?
                                    </h2>
                                    <p className="mx-auto mt-4 max-w-2xl text-xl leading-relaxed text-slate-600 sm:text-2xl">
                                        Click the button below to open WhatsApp and speak with our official company
                                        representative.
                                    </p>
                                    <div className="mt-8 flex justify-center">
                                        <WhatsAppCta
                                            href={whatsappUrl}
                                            label="Contact on WhatsApp"
                                            size="large"
                                            className="max-w-lg"
                                        />
                                    </div>
                                </section>
                            )}
                        </main>

                        {whatsappUrl && <SideCta href={whatsappUrl} side="right" />}
                    </div>
                </div>
            </div>
        </>
    );
}
