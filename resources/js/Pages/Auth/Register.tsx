import CountryCombobox from '@/Components/CountryCombobox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PasswordInput from '@/Components/PasswordInput';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo } from 'react';

type CountryOption = {
    code: string;
    name: string;
    label: string;
    phone_code?: string | null;
    emoji?: string | null;
    flag?: string;
};

export default function Register({
    preferredRole = 'male',
    countries = [],
}: {
    preferredRole?: 'male' | 'female';
    countries?: CountryOption[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: preferredRole,
        country_code: countries.find((c) => c.code === 'PK')?.code ?? countries[0]?.code ?? 'US',
    });

    const dialCode = useMemo(() => {
        const selected = countries.find((c) => c.code === data.country_code);
        const code = (selected?.phone_code || '').replace(/\D+/g, '');
        return code || '1';
    }, [countries, data.country_code]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout title="Create your account" subtitle="Join to unlock discover, chat, calls, and payouts.">
            <Head title="Register" />

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel value="I am joining as" />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {([
                            ['male', 'Member'],
                            ['female', 'Creator'],
                        ] as const).map(([role, label]) => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setData('role', role)}
                                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                                    data.role === role
                                        ? 'border-coral bg-rose-50 text-coral-deep'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <InputError message={errors.role} className="mt-2" />
                </div>

                <CountryCombobox
                    countries={countries}
                    value={data.country_code}
                    onChange={(code) => setData('country_code', code)}
                    error={errors.country_code}
                    hint={`${countries.length} countries · dial code and prices follow your country`}
                />

                <div>
                    <InputLabel htmlFor="phone" value="Phone number" />
                    <div className="mt-1 flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm focus-within:border-coral focus-within:ring-2 focus-within:ring-coral/20">
                        <span className="flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-600">
                            +{dialCode}
                        </span>
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={data.phone}
                            autoComplete="tel-national"
                            placeholder="3001234567"
                            onChange={(e) => setData('phone', e.target.value.replace(/[^\d\s-]/g, ''))}
                            required
                            className="block w-full border-0 bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-0"
                        />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400">
                        Enter your mobile number without the country code. Leading 0 is optional.
                    </p>
                    <InputError message={errors.phone} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        className="mt-1"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm password" />
                    <PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <PrimaryButton className="w-full justify-center py-3" disabled={processing}>
                    Create account & enter
                </PrimaryButton>

                <p className="text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link href={route('login')} className="font-semibold text-ink hover:text-coral">
                        Log in
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
