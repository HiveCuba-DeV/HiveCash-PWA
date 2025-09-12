import React, { useRef, useState } from 'react';
import { Copy, Share2 } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useQRCode } from '../../hooks/useQRCode';
import { useTranslation } from 'react-i18next';
import { UR, UREncoder } from '@gandlaf21/bc-ur'

interface DQRDisplayProps {
    data: string;
    title?: string;
    showCopyButton?: boolean;
    showShareButton?: boolean;
    onShare?: () => void;
    shareLabel?: string;
}


export const DQRDisplay: React.FC<DQRDisplayProps> = ({
    data,
    title,
    showCopyButton = true,
    showShareButton = true,
    onShare,
    shareLabel,
}) => {
    const { t } = useTranslation();
    const { qrDataURL, loading, generateQR } = useQRCode();
    const [stopshow, setStopShow] = useState(false);
    const currentIndexRef = useRef(0);
    const [totalFragments, setTotalFragments] = useState(0);

    React.useEffect(() => {
        if (stopshow) {
            currentIndexRef.current = 0;
        }
    }, [stopshow]);

    React.useEffect(() => {
        if (!data || stopshow) return;

        const encoder = new TextEncoder();
        const messageUint8 = encoder.encode(data);
        const ur = UR.from(messageUint8);
        const maxFragmentLength = 150;
        const encoderf = new UREncoder(ur, maxFragmentLength, 0);

        setTotalFragments(encoderf.fragments.length); // total para mostrar progreso
        let parts:string[]=[];
        for (let x of encoderf.fragments ) parts.push(encoderf.nextPart());
        

        let index = 0;
        const interval = setInterval(() => {
            const part = parts[index];
            generateQR(part);
            currentIndexRef.current = index + 1;
            index++;
            if (index >= encoderf.fragments.length) {
                //clearInterval(interval);
                index = 0;
            }
        }, 500);
        return () => clearInterval(interval);
    }, [data, stopshow, generateQR]);



    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(data);
            // TODO: Show toast notification
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    text: data,
                    title: title || t('appName'),
                });
            } catch (err) {
                console.error('Failed to share:', err);
            }
        } else {
            handleCopy();
        }
    };

    const toggleShow = () => {
        setStopShow(prev => !prev);
    };


    return (
        <Card className="text-center">
            {title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {title}
                </h3>
            )}
            <div className="text-sm text-gray-600 mb-2">
                {`Fragment ${currentIndexRef.current} / ${totalFragments}`}
            </div>

            <div className="mb-6">
                {loading ? (
                    <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    </div>
                ) : qrDataURL ? (
                    <img
                        src={qrDataURL}
                        alt="QR Code"
                        className="w-64 h-64 mx-auto rounded-lg"
                    />
                ) : (
                    <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Failed to generate QR</p>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <Button
                    variant="secondary"
                    fullWidth
                    onClick={toggleShow}
                >
                    {stopshow ? "Start Show" : "Stop Show"}
                </Button>

                {showCopyButton && (
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={handleCopy}
                    >
                        <Copy size={16} className="mr-2" />
                        {t('copyLink')}
                    </Button>
                )}

                {showShareButton && (
                    <Button
                        variant="ghost"
                        fullWidth
                        onClick={onShare ?? handleShare}
                    >
                        <Share2 size={16} className="mr-2" />
                        {shareLabel ?? t('share')}
                    </Button>
                )}
            </div>
        </Card>
    );
};