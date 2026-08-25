import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({
    status,
    email,
}: {
    status?: string;
    email?: string;
}) {
    const form = useForm({ otp: '' });
    const resend = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('verification.verify-otp'));
    };

    const resendOtp: FormEventHandler = (e) => {
        e.preventDefault();
        resend.post(route('verification.send'));
    };

    return (
        <GuestLayout title="Verify your email" subtitle="Enter the 6-digit code we sent to your inbox.">
            <Head title="Verify Email" />

            <p className="mb-4 text-sm text-slate-500">
                We sent a verification code to{' '}
                <span className="font-semibold text-ink">{email}</span>. Your account stays locked until
                this code is confirmed.
            </p>

            {status === 'verification-otp-sent' && (
                <div className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                    A new verification code has been sent.
                </div>
            )}

            {status === 'verification-otp-failed' && (
                <div className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                    We could not send email right now. Ask an admin to check Brevo settings, then try again.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="otp" value="Verification code" />
                    <TextInput
                        id="otp"
                        name="otp"
                        value={form.data.otp}
                        className="mt-1 block w-full tracking-[0.35em]"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="••••••"
                        onChange={(e) => form.setData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                    />
                    <InputError message={form.errors.otp} className="mt-2" />
                </div>

                <PrimaryButton className="w-full justify-center py-3" disabled={form.processing}>
                    Verify email
                </PrimaryButton>
            </form>

            <form onSubmit={resendOtp} className="mt-4">
                <button
                    type="submit"
                    disabled={resend.processing}
                    className="w-full text-center text-sm font-semibold text-brand hover:text-brand-deep disabled:opacity-60"
                >
                    Resend code
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-sm font-medium text-slate-500 underline hover:text-ink"
                >
                    Log out
                </Link>
            </div>
        </GuestLayout>
    );
}
