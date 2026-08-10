import TextInput from '@/Components/TextInput';
import {
    forwardRef,
    InputHTMLAttributes,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
    isFocused?: boolean;
};

const PasswordInput = forwardRef<{ focus: () => void }, PasswordInputProps>(
    function PasswordInput({ className = '', isFocused, ...props }, ref) {
        const inputRef = useRef<{ focus: () => void }>(null);
        const [visible, setVisible] = useState(false);

        useImperativeHandle(ref, () => ({
            focus: () => inputRef.current?.focus(),
        }));

        return (
            <div className="relative">
                <TextInput
                    {...props}
                    ref={inputRef}
                    type={visible ? 'text' : 'password'}
                    isFocused={isFocused}
                    className={`block w-full pe-11 ${className}`}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="absolute inset-y-0 end-0 flex items-center px-3 text-slate-400 transition hover:text-slate-600"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                >
                    {visible ? (
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <path d="M1 1l22 22" />
                            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    )}
                </button>
            </div>
        );
    },
);

export default PasswordInput;
