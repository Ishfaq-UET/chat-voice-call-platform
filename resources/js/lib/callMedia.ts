/**
 * Browser mic/camera helpers for Agora calls.
 * getUserMedia only exists in secure contexts (HTTPS, localhost).
 */

export function mediaDevicesAvailable(): boolean {
    return typeof window !== 'undefined'
        && typeof navigator !== 'undefined'
        && !!navigator.mediaDevices
        && typeof navigator.mediaDevices.getUserMedia === 'function';
}

export function isSecureMediaContext(): boolean {
    if (typeof window === 'undefined') return false;
    return window.isSecureContext === true;
}

export function mediaSupportError(): string | null {
    if (!isSecureMediaContext()) {
        return 'Camera/mic need a secure page. Open the site via https:// or http://localhost (not a LAN IP or plain http://your-domain).';
    }
    if (!mediaDevicesAvailable()) {
        return 'This browser does not support camera/microphone access (getUserMedia missing). Try Chrome or Safari on the latest version.';
    }
    return null;
}

/** Warm up permissions inside a user-gesture click handler (required on many mobile browsers). */
export async function requestCallMediaPermission(isVideo: boolean): Promise<void> {
    const supportError = mediaSupportError();
    if (supportError) {
        throw new Error(supportError);
    }

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
    });

    stream.getTracks().forEach((track) => track.stop());
}

export function formatAgoraMediaError(err: unknown): string {
    const supportError = mediaSupportError();
    if (supportError) return supportError;

    const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : String(err ?? 'Unknown media error');

    if (/getUserMedia|NOT_SUPPORTED|mediaDevices/i.test(message)) {
        return 'Camera/mic unavailable. Use https:// or http://localhost, allow permissions, then try again.';
    }
    if (/NotAllowedError|Permission denied|PERMISSION_DENIED/i.test(message)) {
        return 'Microphone/camera permission denied. Allow access in the browser and try again.';
    }
    if (/NotFoundError|DevicesNotFoundError/i.test(message)) {
        return 'No microphone or camera was found on this device.';
    }

    return message;
}
