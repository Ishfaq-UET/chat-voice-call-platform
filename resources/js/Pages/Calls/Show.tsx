import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatAgoraMediaError, mediaSupportError, requestCallMediaPermission } from '@/lib/callMedia';
import { PageProps, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import AgoraRTC, {
    IAgoraRTCClient,
    ICameraVideoTrack,
    ILocalAudioTrack,
    IRemoteAudioTrack,
    IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng';
import { FormEvent, useEffect, useRef, useState } from 'react';

type CallData = {
    id: number;
    status: string;
    type: 'audio' | 'video';
    rate_per_minute: number | string;
    male: User;
    female: User;
};

type AgoraProps = {
    appId: string;
    channel: string;
    token: string | null;
    uid: number;
    configured: boolean;
    error?: string | null;
};

export default function CallShow({
    call,
    agora,
    auth,
}: PageProps<{
    call: CallData;
    agora: AgoraProps;
}>) {
    const user = auth.user!;
    const other = user.role === 'male' ? call.female : call.male;
    const isVideo = call.type === 'video';

    const [status, setStatus] = useState(call.status);
    const [seconds, setSeconds] = useState(0);
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [joining, setJoining] = useState(false);
    const [joined, setJoined] = useState(false);
    const [accepting, setAccepting] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(
        agora.error ?? mediaSupportError(),
    );
    const [needsManualJoin, setNeedsManualJoin] = useState(false);

    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const localAudioRef = useRef<ILocalAudioTrack | null>(null);
    const localVideoRef = useRef<ICameraVideoTrack | null>(null);
    const localVideoEl = useRef<HTMLDivElement | null>(null);
    const remoteVideoEl = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const channel = window.Echo.private(`App.Models.User.${user.id}`);
        channel.listen('.call.status', (e: { call: { id: number; status: string } }) => {
            if (e.call.id === call.id) {
                setStatus(e.call.status);
                if (['ended', 'rejected', 'missed', 'failed'].includes(e.call.status)) {
                    router.visit(route('chat.index'));
                }
            }
        });
        return () => {
            window.Echo.leave(`App.Models.User.${user.id}`);
        };
    }, [user.id, call.id]);

    useEffect(() => {
        if (status !== 'active') return;
        const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
        const bil = setInterval(() => {
            if (user.role === 'male') {
                window.axios.post(route('calls.tick', call.id)).then((res) => {
                    if (!res.data.ok) {
                        router.visit(route('chat.index'));
                    }
                });
            }
        }, 30000);
        return () => {
            clearInterval(timer);
            clearInterval(bil);
        };
    }, [status, user.role, call.id]);

    const cleanup = async () => {
        localAudioRef.current?.close();
        localAudioRef.current = null;
        localVideoRef.current?.close();
        localVideoRef.current = null;
        setJoined(false);
        if (clientRef.current) {
            try {
                await clientRef.current.leave();
            } catch {
                // ignore
            }
            clientRef.current.removeAllListeners();
            clientRef.current = null;
        }
    };

    const joinChannel = async () => {
        if (joined || joining) return;
        if (status !== 'active') return;

        const supportError = mediaSupportError();
        if (supportError) {
            setJoinError(supportError);
            setNeedsManualJoin(true);
            return;
        }

        if (!agora.configured || !agora.appId) {
            setJoinError('Agora is not configured.');
            return;
        }

        setJoining(true);
        setJoinError(null);

        try {
            await cleanup();

            let token = agora.token;
            try {
                const refreshed = await window.axios.get(route('calls.token', call.id));
                token = refreshed.data.token;
            } catch {
                // fall back to page token
            }

            if (!token) {
                throw new Error('Could not get Agora token.');
            }

            const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
            clientRef.current = client;

            client.on('user-published', async (remoteUser, mediaType) => {
                await client.subscribe(remoteUser, mediaType);
                if (mediaType === 'audio') {
                    const track = remoteUser.audioTrack as IRemoteAudioTrack;
                    track.play();
                }
                if (mediaType === 'video' && remoteVideoEl.current) {
                    const track = remoteUser.videoTrack as IRemoteVideoTrack;
                    remoteVideoEl.current.innerHTML = '';
                    track.play(remoteVideoEl.current);
                }
            });

            client.on('user-unpublished', (_remoteUser, mediaType) => {
                if (mediaType === 'video' && remoteVideoEl.current) {
                    remoteVideoEl.current.innerHTML = '';
                }
            });

            client.on('token-privilege-will-expire', async () => {
                try {
                    const res = await window.axios.get(route('calls.token', call.id));
                    await client.renewToken(res.data.token);
                } catch (err) {
                    console.error(err);
                }
            });

            await client.join(agora.appId, agora.channel, token, agora.uid);

            const mic = await AgoraRTC.createMicrophoneAudioTrack();
            localAudioRef.current = mic;
            const tracks: Array<ILocalAudioTrack | ICameraVideoTrack> = [mic];

            if (isVideo) {
                const cam = await AgoraRTC.createCameraVideoTrack();
                localVideoRef.current = cam;
                tracks.push(cam);
                if (localVideoEl.current) {
                    localVideoEl.current.innerHTML = '';
                    cam.play(localVideoEl.current);
                }
            }

            await client.publish(tracks);
            setJoined(true);
            setNeedsManualJoin(false);
            setJoinError(null);
        } catch (err) {
            console.error(err);
            setJoinError(formatAgoraMediaError(err));
            setNeedsManualJoin(true);
            await cleanup();
        } finally {
            setJoining(false);
        }
    };

    // Auto-join when call becomes active (caller via Echo, or after accept reload).
    useEffect(() => {
        if (status !== 'active') return;

        const supportError = mediaSupportError();
        if (supportError) {
            setJoinError(supportError);
            setNeedsManualJoin(true);
            return;
        }

        void joinChannel();

        return () => {
            void cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, call.id, isVideo]);

    const acceptCall = async (e: FormEvent) => {
        e.preventDefault();
        if (accepting) return;
        setAccepting(true);
        setJoinError(null);

        try {
            await requestCallMediaPermission(isVideo);
            router.post(route('calls.accept', call.id), {}, {
                onError: () => setAccepting(false),
                onFinish: () => setAccepting(false),
            });
        } catch (err) {
            setJoinError(formatAgoraMediaError(err));
            setAccepting(false);
        }
    };

    const toggleMute = async () => {
        const track = localAudioRef.current;
        if (!track) return;
        const next = !muted;
        await track.setEnabled(!next);
        setMuted(next);
    };

    const toggleCamera = async () => {
        const track = localVideoRef.current;
        if (!track) return;
        const next = !cameraOff;
        await track.setEnabled(!next);
        setCameraOff(next);
    };

    const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');

    return (
        <AuthenticatedLayout>
            <Head title={`${isVideo ? 'Video' : 'Voice'} call · ${other.name}`} />
            <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-8 text-center">
                {isVideo && status === 'active' ? (
                    <div className="relative w-full overflow-hidden rounded-[28px] bg-ink shadow-card">
                        <div ref={remoteVideoEl} className="aspect-video w-full bg-slate-900" />
                        <div
                            ref={localVideoEl}
                            className="absolute bottom-4 right-4 h-32 w-24 overflow-hidden rounded-2xl bg-slate-800 ring-2 ring-white/20 sm:h-40 sm:w-28"
                        />
                        <div className="absolute left-4 top-4 rounded-xl bg-ink/60 px-3 py-1.5 text-sm font-bold text-white">
                            {other.name} · {mins}:{secs}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-3xl font-semibold text-brand">
                            {other.avatar_url ? (
                                <img src={other.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                other.name.charAt(0)
                            )}
                        </div>
                        <h1 className="mt-4 text-2xl font-semibold text-slate-900">{other.name}</h1>
                        <p className="mt-2 capitalize text-slate-500">
                            {isVideo ? 'Video' : 'Voice'} · {status}
                        </p>
                        {status === 'active' && (
                            <p className="mt-2 font-mono text-xl text-slate-800">
                                {mins}:{secs}
                            </p>
                        )}
                    </>
                )}

                <p className="mt-3 text-sm text-slate-500">${Number(call.rate_per_minute).toFixed(2)} / minute</p>

                {joinError && (
                    <p className="mt-4 max-w-lg rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{joinError}</p>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    {status === 'ringing' && user.role === 'female' && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => void acceptCall(e)}
                                disabled={accepting}
                                className="rounded-lg bg-emerald-600 px-5 py-2 text-white disabled:opacity-50"
                            >
                                {accepting ? 'Connecting…' : 'Accept'}
                            </button>
                            <Link
                                href={route('calls.reject', call.id)}
                                method="post"
                                as="button"
                                className="rounded-lg bg-slate-200 px-5 py-2"
                            >
                                Reject
                            </Link>
                        </>
                    )}

                    {status === 'active' && needsManualJoin && (
                        <button
                            type="button"
                            disabled={joining}
                            onClick={() => void joinChannel()}
                            className="rounded-lg bg-brand px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
                        >
                            {joining ? 'Joining…' : isVideo ? 'Enable camera & join' : 'Enable mic & join'}
                        </button>
                    )}

                    {status === 'active' && joined && (
                        <>
                            <button
                                type="button"
                                onClick={() => void toggleMute()}
                                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-bold"
                            >
                                {muted ? 'Unmute' : 'Mute'}
                            </button>
                            {isVideo && (
                                <button
                                    type="button"
                                    onClick={() => void toggleCamera()}
                                    className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-bold"
                                >
                                    {cameraOff ? 'Camera on' : 'Camera off'}
                                </button>
                            )}
                        </>
                    )}

                    {['ringing', 'active'].includes(status) && (
                        <Link
                            href={route('calls.end', call.id)}
                            method="post"
                            as="button"
                            className="rounded-lg bg-red-600 px-5 py-2 text-white"
                        >
                            End call
                        </Link>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
