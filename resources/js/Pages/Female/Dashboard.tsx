import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SelfieCameraCapture from '@/Components/SelfieCameraCapture';
import { FemaleProfile, PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useMemo, useState } from 'react';

export default function FemaleDashboard({
    profile,
    verification,
    verificationStatus,
    avatarUrl,
    bio,
    walletBalance,
}: PageProps<{
    profile: FemaleProfile | null;
    verification: { status: string; rejection_reason?: string | null } | null;
    verificationStatus: string;
    avatarUrl?: string | null;
    bio?: string | null;
    walletBalance: number;
}>) {
    const flash = usePage<PageProps>().props.flash;
    const [preview, setPreview] = useState<string | null>(null);

    const statusLabel = useMemo(() => {
        if (verificationStatus === 'approved') return 'Approved';
        if (verificationStatus === 'pending') return 'Pending review';
        if (verificationStatus === 'rejected') return 'Rejected';
        return 'Unverified';
    }, [verificationStatus]);

    const showVerificationForm =
        verificationStatus === 'unverified' || verificationStatus === 'rejected';

    const pricing = useForm({
        chat_price: Number(profile?.chat_price ?? 1),
        voice_price: Number(profile?.voice_price ?? 2),
        call_price_per_minute: Number(profile?.call_price_per_minute ?? 5),
    });

    const bank = useForm({
        bank_name: profile?.bank_name ?? '',
        bank_account: profile?.bank_account ?? '',
        bank_holder: profile?.bank_holder ?? '',
    });

    const avatarForm = useForm<{ avatar: File | null; bio: string }>({
        avatar: null,
        bio: bio ?? '',
    });

    const verificationForm = useForm<{ selfie: File | null; id_photo: File | null }>({
        selfie: null,
        id_photo: null,
    });

    const submitPricing: FormEventHandler = (e) => {
        e.preventDefault();
        pricing.post(route('female.pricing'));
    };

    const submitBank: FormEventHandler = (e) => {
        e.preventDefault();
        bank.post(route('female.bank'));
    };

    const submitAvatar: FormEventHandler = (e) => {
        e.preventDefault();
        avatarForm.post(route('female.avatar'), {
            forceFormData: true,
            onSuccess: () => {
                avatarForm.setData('avatar', null);
                setPreview(null);
            },
        });
    };

    const submitBioOnly = () => {
        router.post(route('female.bio'), { bio: avatarForm.data.bio });
    };

    const submitVerification: FormEventHandler = (e) => {
        e.preventDefault();
        if (!verificationForm.data.selfie) {
            verificationForm.setError('selfie', 'Please capture a live selfie with your camera.');
            return;
        }
        verificationForm.post(route('female.verification'), { forceFormData: true });
    };

    const onAvatarPick = (file: File | null) => {
        avatarForm.setData('avatar', file);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const displayPhoto = preview || avatarUrl;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-extrabold text-ink">Creator dashboard</h2>
                    <p className="text-sm text-slate-500">Profile photo, pricing, verification & payouts</p>
                </div>
            }
        >
            <Head title="Creator dashboard" />

            <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {flash?.error && (
                    <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                        {flash.error}
                    </div>
                )}
                {flash?.success && (
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="card-soft p-5">
                    <p className="text-sm font-medium text-slate-500">Wallet balance</p>
                    <p className="mt-1 text-3xl font-extrabold text-ink">
                        ${Number(walletBalance).toFixed(2)}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                        Verification:{' '}
                        <span
                            className={`font-bold ${
                                verificationStatus === 'approved'
                                    ? 'text-emerald-600'
                                    : verificationStatus === 'pending'
                                      ? 'text-amber-600'
                                      : 'text-slate-700'
                            }`}
                        >
                            {statusLabel}
                        </span>
                    </p>
                    {verificationStatus === 'rejected' && verification?.rejection_reason && (
                        <p className="mt-1 text-sm text-rose-600">{verification.rejection_reason}</p>
                    )}
                </div>

                {/* Profile photo — shown in male Discover list */}
                <form onSubmit={submitAvatar} className="card-soft p-5">
                    <h3 className="text-lg font-extrabold text-ink">Profile photo</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        This photo appears on the Discover list for members. Upload a clear profile picture.
                    </p>

                    <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="mx-auto h-32 w-32 overflow-hidden rounded-[28px] border-4 border-brand-soft bg-brand-soft shadow-card sm:mx-0">
                            {displayPhoto ? (
                                <img src={displayPhoto} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm font-bold text-brand">
                                    No photo
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700">Upload photo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="mt-1 block w-full text-sm"
                                    onChange={(e) => onAvatarPick(e.target.files?.[0] ?? null)}
                                />
                                {avatarForm.errors.avatar && (
                                    <p className="mt-1 text-sm text-rose-600">{avatarForm.errors.avatar}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700">Bio</label>
                                <textarea
                                    value={avatarForm.data.bio}
                                    onChange={(e) => avatarForm.setData('bio', e.target.value)}
                                    rows={3}
                                    maxLength={500}
                                    placeholder="Tell members what you’re about…"
                                    className="mt-1 w-full rounded-2xl border-slate-200 text-sm focus:border-brand focus:ring-brand"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="submit"
                                    disabled={avatarForm.processing || !avatarForm.data.avatar}
                                    className="rounded-2xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-soft hover:bg-brand-deep disabled:opacity-40"
                                >
                                    Save profile photo
                                </button>
                                <button
                                    type="button"
                                    onClick={submitBioOnly}
                                    disabled={avatarForm.processing}
                                    className="rounded-2xl border-2 border-brand/15 px-5 py-2.5 text-sm font-bold text-brand hover:bg-brand-soft"
                                >
                                    Save bio only
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {showVerificationForm && (
                    <form onSubmit={submitVerification} className="card-soft p-5">
                        <h3 className="text-lg font-extrabold text-ink">Face verification</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Take a live selfie with your camera for admin review. Gallery uploads are not accepted.
                            Required before you appear in Discover.
                        </p>
                        <div className="mt-4 grid gap-6 lg:grid-cols-2">
                            <div>
                                <label className="text-sm font-bold text-slate-700">Live selfie</label>
                                <div className="mt-2">
                                    <SelfieCameraCapture
                                        onCapture={(file) => verificationForm.setData('selfie', file)}
                                        error={verificationForm.errors.selfie}
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            disabled={verificationForm.processing || !verificationForm.data.selfie}
                            className="mt-4 rounded-2xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-soft hover:bg-brand-deep disabled:opacity-40"
                        >
                            Submit for review
                        </button>
                    </form>
                )}

                {verificationStatus === 'pending' && (
                    <div className="rounded-2xl bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
                        Your face verification is pending admin review. You can still upload a profile photo above.
                    </div>
                )}

                {verificationStatus === 'approved' && (
                    <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
                        You’re verified. Keep your profile photo and bio updated so members can find you.
                    </div>
                )}

                <form onSubmit={submitPricing} className="card-soft p-5">
                    <h3 className="text-lg font-extrabold text-ink">Pricing</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        {([
                            ['chat_price', 'Chat message'],
                            ['voice_price', 'Voice note'],
                            ['call_price_per_minute', 'Call / minute'],
                        ] as const).map(([key, label]) => (
                            <div key={key}>
                                <label className="text-sm font-bold text-slate-700">{label}</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.1"
                                    value={pricing.data[key]}
                                    onChange={(e) => pricing.setData(key, Number(e.target.value))}
                                    className="mt-1 w-full rounded-2xl border-slate-200 text-sm focus:border-brand focus:ring-brand"
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        disabled={pricing.processing}
                        className="mt-4 rounded-2xl bg-ink px-5 py-2.5 text-sm font-extrabold text-white hover:bg-ink-soft"
                    >
                        Save prices
                    </button>
                </form>

                <form onSubmit={submitBank} className="card-soft p-5">
                    <h3 className="text-lg font-extrabold text-ink">Bank details for withdrawals</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        {([
                            ['bank_name', 'Bank name'],
                            ['bank_account', 'Account number'],
                            ['bank_holder', 'Account holder'],
                        ] as const).map(([key, label]) => (
                            <div key={key}>
                                <label className="text-sm font-bold text-slate-700">{label}</label>
                                <input
                                    type="text"
                                    value={bank.data[key]}
                                    onChange={(e) => bank.setData(key, e.target.value)}
                                    className="mt-1 w-full rounded-2xl border-slate-200 text-sm focus:border-brand focus:ring-brand"
                                    required
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        disabled={bank.processing}
                        className="mt-4 rounded-2xl bg-ink px-5 py-2.5 text-sm font-extrabold text-white hover:bg-ink-soft"
                    >
                        Save bank details
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
