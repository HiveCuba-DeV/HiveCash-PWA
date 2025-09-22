import { useRef, useState, useCallback, useEffect } from 'react';

interface UseCameraOptions {
    videoConstraints?: MediaStreamConstraints['video'];
}

interface UseCameraReturn {
    videoRef: React.RefObject<HTMLVideoElement>;
    isActive: boolean;
    startCamera: () => Promise<void>;
    stopCamera: () => void;
    getFrame: () => HTMLCanvasElement | null;
    error: string | null;
}

export function useCamera(options?: UseCameraOptions): UseCameraReturn {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        try {
            setError(null);

            const constraints: MediaStreamConstraints = {
                video:
                    typeof options?.videoConstraints === 'object'
                        ? {
                            facingMode: 'environment',
                            ...options.videoConstraints,
                        }
                        : { facingMode: 'environment' },
                audio: false,
            };


            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setIsActive(true);
        } catch (err: any) {
            setError(err.message || 'No se pudo acceder a la cámara');
            setIsActive(false);
        }
    }, [options]);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsActive(false);
    }, []);

    const getFrame = useCallback((): HTMLCanvasElement | null => {
        if (!videoRef.current) return null;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        }
        return canvas;
    }, []);

    // Limpieza automática al desmontar
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return {
        videoRef,
        isActive,
        startCamera,
        stopCamera,
        getFrame,
        error,
    };
}
