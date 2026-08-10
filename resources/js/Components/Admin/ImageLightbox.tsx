import { useCallback, useEffect, useState } from 'react';

export default function ImageLightbox({
    url,
    label = 'Photo',
    onClose,
}: {
    url: string | null;
    label?: string;
    onClose: () => void;
}) {
    const [zoom, setZoom] = useState(1);

    const close = useCallback(() => {
        setZoom(1);
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (!url) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
            if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))));
            if (e.key === '-') setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))));
        };

        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [url, close]);

    if (!url) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col bg-ink/90 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            onClick={close}
        >
            <div
                className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="text-sm font-bold text-white/80">{label}</p>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                        className="rounded-xl bg-white/10 px-3 py-2 text-sm font-extrabold text-white hover:bg-white/20"
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
                    >
                        +
                    </button>
                    <button
                        type="button"
                        onClick={close}
                        className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white hover:bg-white/20"
                    >
                        Close
                    </button>
                </div>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-auto p-4">
                <img
                    src={url}
                    alt={label}
                    onClick={(e) => e.stopPropagation()}
                    className="max-h-none rounded-xl object-contain shadow-float transition-transform"
                    style={{ transform: `scale(${zoom})`, maxWidth: '90vw' }}
                />
            </div>
        </div>
    );
}
