import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import AgoraRTC, { IAgoraRTCClient, ILocalAudioTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';
import { useEffect, useRef, useState } from 'react';

type CallData = {
    id: number;
    status: string;
    rate_per_minute: number | string;
    male: User;
    female: User;
};

export default function CallShow({
    call,
    agora,
    auth,
}: PageProps<{
    call: CallData;
    agora: { appId: string; channel: string; token: string; uid: number };
}>) {
    const user = auth.user!;
    const other = user.role === 'male' ? call.female : call.male;
    const [status, setStatus] = useState(call.status);
    const [seconds, setSeconds] = useState(0);
    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const localTrackRef = useRef<ILocalAudioTrack | null>(null);

    useEffect(() => {
        const channel = window.Echo.private(`App.Models.User.${user.id}`);
        channel.listen('.call.status', (e: { call: { id: number; status: string } }) => {
            if (e.call.id === call.id) {
                setStatus(e.call.status);
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

    useEffect(() => {
        let cancelled = false;

        async function join() {
            if (status !== 'active' && status !== 'ringing') return;
            if (!agora.appId) {
                // Demo mode without Agora keys — UI-only call flow.
                return;
            }

            const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
            clientRef.current = client;
            client.on('user-published', async (remoteUser, mediaType) => {
                await client.subscribe(remoteUser, mediaType);
                if (mediaType === 'audio') {
                    const track = remoteUser.audioTrack as IRemoteAudioTrack;
                    track.play();
                }
            });

            await client.join(agora.appId, agora.channel, agora.token || null, agora.uid);
            const mic = await AgoraRTC.createMicrophoneAudioTrack();
            localTrackRef.current = mic;
            if (!cancelled) {
                await client.publish([mic]);
            }
        }

        if (status === 'active') {
            join().catch(console.error);
        }

        return () => {
            cancelled = true;
            localTrackRef.current?.close();
            clientRef.current?.leave();
        };
    }, [status, agora]);

    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');

    return (
        <AuthenticatedLayout>
            <Head title={`Call · ${other.name}`} />
            <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-10 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 text-3xl font-semibold text-rose-700">
                    {other.name.charAt(0)}
                </div>
                <h1 className="mt-4 text-2xl font-semibold text-slate-900">{other.name}</h1>
                <p className="mt-2 capitalize text-slate-500">{status}</p>
                {status === 'active' && <p className="mt-2 font-mono text-xl text-slate-800">{mins}:{secs}</p>}
                <p className="mt-2 text-sm text-slate-500">${Number(call.rate_per_minute).toFixed(2)} / minute</p>
                {!agora.appId && (
                    <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        Agora keys not configured — call signaling works; audio requires AGORA_APP_ID.
                    </p>
                )}

                <div className="mt-8 flex gap-3">
                    {status === 'ringing' && user.role === 'female' && (
                        <>
                            <Link href={route('calls.accept', call.id)} method="post" as="button" className="rounded-lg bg-emerald-600 px-5 py-2 text-white">
                                Accept
                            </Link>
                            <Link href={route('calls.reject', call.id)} method="post" as="button" className="rounded-lg bg-slate-200 px-5 py-2">
                                Reject
                            </Link>
                        </>
                    )}
                    {['ringing', 'active'].includes(status) && (
                        <Link href={route('calls.end', call.id)} method="post" as="button" className="rounded-lg bg-red-600 px-5 py-2 text-white">
                            End call
                        </Link>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
