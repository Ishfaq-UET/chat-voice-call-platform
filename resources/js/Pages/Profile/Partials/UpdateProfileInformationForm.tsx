import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { PageProps } from '@/types';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    pendingNameChange,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    pendingNameChange?: { requested_name: string; current_name: string } | null;
    className?: string;
}) {
    const user = usePage<PageProps>().props.auth.user!;
    const market = usePage<PageProps>().props.market;
    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const avatarForm = useForm<{ avatar: File | null; bio: string }>({
        avatar: null,
        bio: user.bio ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const submitAvatar: FormEventHandler = (e) => {
        e.preventDefault();
        avatarForm.post(route('profile.avatar'), {
            forceFormData: true,
            onSuccess: () => {
                avatarForm.setData('avatar', null);
                setPreview(null);
            },
        });
    };

    const displayPhoto = preview || user.avatar_url;

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-extrabold text-ink">Profile photo</h2>
                <p className="mt-1 text-sm text-slate-500">
                    This photo shows in chats
                    {user.role === 'male' ? ' when creators talk with you' : ' and on Discover'}.
                </p>
            </header>

            <form onSubmit={submitAvatar} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="mx-auto h-28 w-28 overflow-hidden rounded-[28px] border-4 border-brand-soft bg-brand-soft sm:mx-0">
                    {displayPhoto ? (
                        <img src={displayPhoto} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-3xl font-extrabold text-brand">
                            {user.name.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                    <div>
                        <InputLabel htmlFor="avatar" value="Upload photo" />
                        <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            className="mt-1 block w-full text-sm"
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                avatarForm.setData('avatar', file);
                                if (preview) URL.revokeObjectURL(preview);
                                setPreview(file ? URL.createObjectURL(file) : null);
                            }}
                        />
                        <InputError className="mt-1" message={avatarForm.errors.avatar} />
                    </div>
                    <div>
                        <InputLabel htmlFor="bio" value="Bio" />
                        <textarea
                            id="bio"
                            value={avatarForm.data.bio}
                            onChange={(e) => avatarForm.setData('bio', e.target.value)}
                            rows={3}
                            maxLength={500}
                            className="mt-1 w-full rounded-2xl border-slate-200 text-sm focus:border-brand focus:ring-brand"
                            placeholder="A short intro…"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={avatarForm.processing || !avatarForm.data.avatar}
                        className="rounded-2xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-soft hover:bg-brand-deep disabled:opacity-40"
                    >
                        Save profile photo
                    </button>
                    {status === 'avatar-updated' && (
                        <p className="text-sm font-semibold text-emerald-600">Profile photo updated.</p>
                    )}
                </div>
            </form>

            <header className="mt-10">
                <h2 className="text-lg font-extrabold text-ink">Account</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Update your email anytime. Display name changes require admin approval.
                </p>
            </header>

            {user.country_code && (
                <p className="mt-4 text-sm text-slate-600">
                    Country:{' '}
                    <span className="font-bold text-ink">{market?.country_name ?? user.country_code}</span>
                    {' · '}
                    Prices and wallet use {market?.currency_code ?? 'USD'}.
                </p>
            )}

            {pendingNameChange && (
                <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    Name change pending review: {pendingNameChange.current_name} → {pendingNameChange.requested_name}
                </div>
            )}

            {status === 'name-change-submitted' && (
                <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    Name change submitted for admin approval.
                </div>
            )}

            {status === 'name-change-pending' && (
                <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    You already have a pending name change request.
                </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                        disabled={Boolean(pendingNameChange) && user.role !== 'admin'}
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-slate-700">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ms-1 rounded-md text-sm text-brand underline"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-emerald-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-slate-500">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
