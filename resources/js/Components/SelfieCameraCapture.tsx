import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
    onCapture: (file: File | null) => void;
    error?: string;
};

export default function SelfieCameraCapture({ onCapture, error }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [captured, setCaptured] = useState(false);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraOpen(false);
    }, []);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        setCaptured(false);
        setPreviewUrl(null);
        onCapture(null);

        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError('Your browser does not support live camera capture. Please use a modern browser on a device with a camera.');
            return;
        }

        try {
            stopCamera();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            streamRef.current = stream;
            setCameraOpen(true);

            requestAnimationFrame(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    void videoRef.current.play();
                }
            });
        } catch {
            setCameraError('Camera access was denied or unavailable. Allow camera permission and try again.');
            stopCamera();
        }
    }, [onCapture, stopCamera]);

    const capturePhoto = useCallback(() => {
        const video = videoRef.current;
        if (!video || video.videoWidth === 0) {
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        ctx.drawImage(video, 0, 0);

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    setCameraError('Could not capture photo. Please try again.');
                    return;
                }

                const file = new File([blob], `selfie-${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });

                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }

                setPreviewUrl(URL.createObjectURL(blob));
                setCaptured(true);
                onCapture(file);
                stopCamera();
            },
            'image/jpeg',
            0.92,
        );
    }, [onCapture, previewUrl, stopCamera]);

    const retake = useCallback(() => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setCaptured(false);
        onCapture(null);
        void startCamera();
    }, [onCapture, previewUrl, startCamera]);

    useEffect(() => {
        return () => {
            stopCamera();
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, stopCamera]);

    return (
        <div className="space-y-3">
            <div className="rounded-2xl border-2 border-dashed border-brand/20 bg-canvas p-4">
                {!cameraOpen && !captured && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand">
                            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.75">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        </div>
                        <p className="text-sm font-bold text-ink">Live selfie required</p>
                        <p className="mt-1 max-w-xs text-xs text-slate-500">
                            You must take a fresh photo with your camera. Gallery uploads are not allowed for verification.
                        </p>
                        <button
                            type="button"
                            onClick={() => void startCamera()}
                            className="mt-4 rounded-2xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-soft hover:bg-brand-deep"
                        >
                            Open camera
                        </button>
                    </div>
                )}

                {cameraOpen && !captured && (
                    <div className="space-y-3">
                        <div className="overflow-hidden rounded-2xl bg-black">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="mx-auto aspect-[4/3] w-full max-w-md object-cover mirror"
                                style={{ transform: 'scaleX(-1)' }}
                            />
                        </div>
                        <p className="text-center text-xs text-slate-500">
                            Position your face clearly in the frame, then capture.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                type="button"
                                onClick={capturePhoto}
                                className="rounded-2xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-soft hover:bg-brand-deep"
                            >
                                Capture selfie
                            </button>
                            <button
                                type="button"
                                onClick={stopCamera}
                                className="rounded-2xl border-2 border-brand/15 px-5 py-2.5 text-sm font-bold text-brand hover:bg-brand-soft"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {captured && previewUrl && (
                    <div className="space-y-3">
                        <div className="overflow-hidden rounded-2xl ring-2 ring-emerald-200">
                            <img src={previewUrl} alt="Captured selfie preview" className="mx-auto aspect-[4/3] w-full max-w-md object-cover" />
                        </div>
                        <p className="text-center text-xs font-semibold text-emerald-700">
                            Selfie captured. Submit for review or retake if needed.
                        </p>
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={retake}
                                className="rounded-2xl border-2 border-brand/15 px-5 py-2.5 text-sm font-bold text-brand hover:bg-brand-soft"
                            >
                                Retake selfie
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {(cameraError || error) && (
                <p className="text-sm text-rose-600">{cameraError ?? error}</p>
            )}
        </div>
    );
}
