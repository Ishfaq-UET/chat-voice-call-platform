import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PasswordInput from '@/Components/PasswordInput';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function AdminLogin({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.login.store'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            title="Admin sign in"
            subtitle="Restricted access for platform administrators only."
        >
            <Head title="Admin Login" />

            <div className="mb-4 rounded-2xl bg-brand-soft px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-brand">
                Admin portal
            </div>

            {status && (
                <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Admin email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        className="mt-1"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <label className="flex items-center">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', (e.target.checked || false) as false)}
                    />
                    <span className="ms-2 text-sm text-slate-600">Remember me</span>
                </label>

                <PrimaryButton className="w-full justify-center py-3" disabled={processing}>
                    Sign in to admin
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}
