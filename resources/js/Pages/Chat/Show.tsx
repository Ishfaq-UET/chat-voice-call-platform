import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useCallback, useEffect, useRef, useState } from 'react';

type ChatMessage = {
    id: number;
    sender_id: number;
    type: string;
    body?: string | null;
    media_url?: string | null;
    amount_charged?: number | string;
    created_at?: string;
    sender?: { id: number; name: string; avatar_url?: string | null };
};

type Conversation = {
    id: number;
    male: User;
    female: User;
};

type OtherUser = {
    id: number;
    name: string;
    bio?: string | null;
    avatar_url?: string | null;
    is_online?: boolean;
    online_at?: string | null;
    verification_status?: string | null;
    member_since?: string | null;
    role?: string;
};

export default function ChatShow({
    conversation,
    otherUser,
    messages: initialMessages,
    prices,
    walletBalance,
    auth,
}: PageProps<{
    conversation: Conversation;
    otherUser: OtherUser;
    messages: { data: ChatMessage[]; next_page_url?: string | null };
    prices: { chat: number; voice: number; call: number };
    walletBalance: number;
}>) {
    const user = auth.user!;
    const [messages, setMessages] = useState(initialMessages.data);
    const bottomRef = useRef<HTMLDivElement>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunks = useRef<Blob[]>([]);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [recording, setRecording] = useState(false);
    const [recordSecs, setRecordSecs] = useState(0);
    const [sendingMedia, setSendingMedia] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);

    const openLightbox = (url: string) => {
        setZoom(1);
        setLightboxUrl(url);
    };

    const closeLightbox = useCallback(() => {
        setLightboxUrl(null);
        setZoom(1);
    }, []);

    useEffect(() => {
        if (!lightboxUrl) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))));
            if (e.key === '-' || e.key === '_') setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))));
        };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [lightboxUrl, closeLightbox]);

    const form = useForm({
        type: 'text' as 'text' | 'voice' | 'image',
        body: '',
    });

    useEffect(() => {
        setMessages(initialMessages.data);
    }, [initialMessages.data]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const channelName = `conversation.${conversation.id}`;
        window.Echo.private(channelName).listen('.message.sent', (e: { message: ChatMessage }) => {
            setMessages((prev) => [...prev, e.message]);
            router.reload({ only: ['walletBalance'] });
        });

        return () => {
            window.Echo.leave(channelName);
        };
    }, [conversation.id]);

    useEffect(() => {
        if (!recording) {
            setRecordSecs(0);
            return;
        }
        const id = window.setInterval(() => setRecordSecs((s) => s + 1), 1000);
        return () => window.clearInterval(id);
    }, [recording]);

    const reloadAfterSend = () => {
        router.reload({ only: ['messages', 'walletBalance'] });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!form.data.body.trim()) return;

        form.transform((data) => ({ type: 'text', body: data.body }));
        form.post(route('chat.send', conversation.id), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('body');
                reloadAfterSend();
            },
        });
    };

    const postMedia = (payload: Record<string, string | File>) => {
        setSendingMedia(true);
        router.post(route('chat.send', conversation.id), payload, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setSendingMedia(false),
            onSuccess: reloadAfterSend,
        });
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mimeType = MediaRecorder.isTypeSupported('audio/webm')
                ? 'audio/webm'
                : MediaRecorder.isTypeSupported('audio/mp4')
                  ? 'audio/mp4'
                  : '';
            const recorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);
            chunks.current = [];
            recorder.ondataavailable = (ev) => {
                if (ev.data.size > 0) chunks.current.push(ev.data);
            };
            recorder.onstop = () => {
                const blobType = recorder.mimeType || 'audio/webm';
                const ext = blobType.includes('mp4') ? 'm4a' : 'webm';
                const blob = new Blob(chunks.current, { type: blobType });
                const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: blobType });
                postMedia({ type: 'voice', body: '', voice: file });
                stream.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            };
            mediaRecorder.current = recorder;
            recorder.start();
            setRecording(true);
        } catch {
            alert('Microphone permission is required to send a voice message.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current?.state === 'recording') {
            mediaRecorder.current.stop();
        }
        setRecording(false);
    };

    const cancelRecording = () => {
        if (mediaRecorder.current?.state === 'recording') {
            mediaRecorder.current.onstop = null;
            mediaRecorder.current.stop();
        }
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setRecording(false);
    };

    const onPickImage = (file: File | null) => {
        if (!file) return;
        postMedia({ type: 'image', body: '', image: file });
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const formatTime = (iso?: string) => {
        if (!iso) return '';
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatSecs = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return (
        <AuthenticatedLayout>
            <Head title={`Chat · ${otherUser.name}`} />

            <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-6">
                <aside className="card-soft h-fit overflow-hidden">
                    <div className="relative h-36 bg-gradient-to-br from-brand-soft to-lilac">
                        {otherUser.avatar_url ? (
                            <img
                                src={otherUser.avatar_url}
                                alt=""
                                className="h-full w-full object-cover opacity-40"
                            />
                        ) : null}
                    </div>
                    <div className="-mt-12 px-5 pb-5">
                        <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-[28px] border-4 border-white bg-brand-soft shadow-card">
                            {otherUser.avatar_url ? (
                                <img
                                    src={otherUser.avatar_url}
                                    alt={otherUser.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-3xl font-extrabold text-brand">
                                    {otherUser.name.charAt(0)}
                                </div>
                            )}
                            <span
                                className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white ${
                                    otherUser.is_online ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                            />
                        </div>

                        <div className="mt-3 text-center">
                            <h2 className="text-xl font-extrabold text-ink">{otherUser.name}</h2>
                            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                                {otherUser.is_online ? (
                                    <span className="text-emerald-600">Online now</span>
                                ) : (
                                    <span>Last seen {otherUser.online_at || 'recently'}</span>
                                )}
                            </p>
                        </div>

                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                            {otherUser.verification_status === 'approved' && (
                                <span className="chip bg-brand-soft text-brand">Verified</span>
                            )}
                            {otherUser.member_since && (
                                <span className="chip bg-canvas text-slate-500">Since {otherUser.member_since}</span>
                            )}
                        </div>

                        <p className="mt-4 text-center text-sm leading-relaxed text-slate-500">
                            {otherUser.bio || 'No bio yet.'}
                        </p>

                        <div className="mt-5 grid grid-cols-3 gap-2 rounded-3xl bg-canvas p-3 text-center">
                            <div>
                                <p className="text-[10px] font-bold uppercase text-slate-400">Chat</p>
                                <p className="text-sm font-extrabold text-ink">${prices.chat.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-slate-400">Voice</p>
                                <p className="text-sm font-extrabold text-ink">${prices.voice.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-slate-400">Call</p>
                                <p className="text-sm font-extrabold text-ink">${prices.call.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            {user.role === 'male' && (
                                <>
                                    <Link
                                        href={route('creators.show', otherUser.id)}
                                        className="flex w-full items-center justify-center rounded-2xl border-2 border-brand/15 py-2.5 text-sm font-bold text-brand hover:bg-brand-soft"
                                    >
                                        View full profile
                                    </Link>
                                    <Link
                                        href={route('calls.start', otherUser.id)}
                                        method="post"
                                        as="button"
                                        className="flex w-full items-center justify-center rounded-2xl bg-ink py-2.5 text-sm font-bold text-white hover:bg-ink-soft"
                                    >
                                        Start voice call
                                    </Link>
                                </>
                            )}
                            <p className="pt-1 text-center text-xs font-semibold text-slate-400">
                                Your balance ${Number(walletBalance).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </aside>

                <section className="card-soft flex min-h-[70vh] flex-col overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-brand/10 px-4 py-3 sm:px-5">
                        <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-brand-soft">
                            {otherUser.avatar_url ? (
                                <img src={otherUser.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center font-extrabold text-brand">
                                    {otherUser.name.charAt(0)}
                                </div>
                            )}
                            <span
                                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                                    otherUser.is_online ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-extrabold text-ink">{otherUser.name}</p>
                            <p className="truncate text-xs font-medium text-slate-500">
                                {otherUser.is_online ? 'Active now' : 'Offline'} · Chat ${prices.chat.toFixed(2)}
                            </p>
                        </div>
                        <Link
                            href={route('chat.index')}
                            className="rounded-2xl bg-canvas px-3 py-2 text-xs font-bold text-slate-500 hover:text-ink"
                        >
                            All chats
                        </Link>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-white to-canvas/60 px-4 py-5 sm:px-5">
                        {messages.length === 0 && (
                            <div className="rounded-3xl bg-brand-soft/50 px-4 py-8 text-center">
                                <p className="font-extrabold text-ink">Say hello to {otherUser.name}</p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Send text, a photo, or a voice note.
                                </p>
                            </div>
                        )}

                        {messages.map((m) => {
                            const mine = m.sender_id === user.id;
                            return (
                                <div key={m.id} className={`flex gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                                    {!mine && (
                                        <div className="mt-auto h-8 w-8 shrink-0 overflow-hidden rounded-xl bg-brand-soft">
                                            {otherUser.avatar_url ? (
                                                <img
                                                    src={otherUser.avatar_url}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-xs font-bold text-brand">
                                                    {otherUser.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className={`max-w-[78%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <div
                                            className={`overflow-hidden rounded-[22px] text-sm leading-relaxed shadow-sm ${
                                                m.type === 'image'
                                                    ? 'bg-transparent p-0 shadow-none'
                                                    : mine
                                                      ? 'rounded-br-md bg-brand px-4 py-2.5 text-white'
                                                      : 'rounded-bl-md bg-white px-4 py-2.5 text-ink ring-1 ring-slate-100'
                                            }`}
                                        >
                                            {m.type === 'voice' && m.media_url ? (
                                                <audio controls src={m.media_url} className="max-w-full" />
                                            ) : m.type === 'image' && m.media_url ? (
                                                <button
                                                    type="button"
                                                    onClick={() => openLightbox(m.media_url!)}
                                                    className="block overflow-hidden rounded-[22px] focus:outline-none focus:ring-2 focus:ring-brand"
                                                >
                                                    <img
                                                        src={m.media_url}
                                                        alt="Shared photo"
                                                        className="max-h-64 max-w-full object-cover transition hover:opacity-95"
                                                    />
                                                </button>
                                            ) : (
                                                <p>{m.body}</p>
                                            )}
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 px-1 text-[10px] font-semibold text-slate-400">
                                            <span>{formatTime(m.created_at)}</span>
                                            {mine && Number(m.amount_charged) > 0 && (
                                                <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-brand">
                                                    −${Number(m.amount_charged).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    <form onSubmit={submit} className="border-t border-brand/10 bg-white p-3 sm:p-4">
                        <InputError
                            message={
                                form.errors.body ||
                                (form.errors as Record<string, string>).voice ||
                                (form.errors as Record<string, string>).image ||
                                (form.errors as Record<string, string>).balance
                            }
                            className="mb-2"
                        />

                        {recording ? (
                            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3">
                                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500" />
                                <p className="flex-1 text-sm font-bold text-rose-700">
                                    Recording {formatSecs(recordSecs)}
                                </p>
                                <button
                                    type="button"
                                    onClick={cancelRecording}
                                    className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={stopRecording}
                                    className="rounded-xl bg-rose-500 px-4 py-1.5 text-xs font-extrabold text-white"
                                >
                                    Send voice
                                </button>
                            </div>
                        ) : null}

                        <div className="flex items-end gap-2">
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
                            />
                            <button
                                type="button"
                                title="Send photo"
                                disabled={recording || sendingMedia || form.processing}
                                onClick={() => imageInputRef.current?.click()}
                                className="rounded-2xl border-2 border-brand/15 px-3 py-2.5 text-sm font-bold text-brand hover:bg-brand-soft disabled:opacity-40"
                            >
                                Pic
                            </button>
                            <input
                                type="text"
                                value={form.data.body}
                                onChange={(e) => form.setData('body', e.target.value)}
                                placeholder="Type a message..."
                                disabled={recording}
                                className="flex-1 rounded-2xl border-slate-200 bg-canvas text-sm shadow-none focus:border-brand focus:ring-brand disabled:opacity-50"
                            />
                            <button
                                type="button"
                                title="Record voice note"
                                disabled={sendingMedia || form.processing}
                                onClick={recording ? stopRecording : startRecording}
                                className={`rounded-2xl px-4 py-2.5 text-sm font-bold text-white ${
                                    recording ? 'bg-rose-500' : 'bg-ink hover:bg-ink-soft'
                                } disabled:opacity-40`}
                            >
                                {recording ? 'Stop' : 'Voice'}
                            </button>
                            <button
                                type="submit"
                                className="rounded-2xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-soft hover:bg-brand-deep disabled:opacity-50"
                                disabled={form.processing || recording || sendingMedia || !form.data.body.trim()}
                            >
                                Send
                            </button>
                        </div>
                        <p className="mt-2 text-center text-[11px] font-medium text-slate-400">
                            Text / photo ${prices.chat.toFixed(2)} · Voice note ${prices.voice.toFixed(2)}
                        </p>
                    </form>
                </section>
            </div>

            {lightboxUrl && (
                <div
                    className="fixed inset-0 z-[100] flex flex-col bg-ink/90 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image preview"
                    onClick={closeLightbox}
                >
                    <div
                        className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-sm font-bold text-white/80">Photo</p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                                className="rounded-xl bg-white/10 px-3 py-2 text-sm font-extrabold text-white hover:bg-white/20"
                                title="Zoom out"
                            >
                                −
                            </button>
                            <span className="min-w-[3.5rem] text-center text-xs font-bold text-white/70">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={() => setZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))))}
                                className="rounded-xl bg-white/10 px-3 py-2 text-sm font-extrabold text-white hover:bg-white/20"
                                title="Zoom in"
                            >
                                +
                            </button>
                            <button
                                type="button"
                                onClick={() => setZoom(1)}
                                className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={closeLightbox}
                                className="rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-ink hover:bg-brand-soft"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-1 items-center justify-center overflow-auto p-4">
                        <img
                            src={lightboxUrl}
                            alt="Full size"
                            className="max-h-none max-w-none select-none rounded-2xl shadow-2xl transition-transform duration-150"
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                            onClick={(e) => e.stopPropagation()}
                            onWheel={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                                setZoom((z) => Math.min(4, Math.max(0.5, Number((z + delta).toFixed(2)))));
                            }}
                            draggable={false}
                        />
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
