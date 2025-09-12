import React from 'react';
import { Copy, Share2 } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useQRCode } from '../../hooks/useQRCode';
import { useTranslation } from 'react-i18next';

interface QRDisplayProps {
  data: string;
  title?: string;
  showCopyButton?: boolean;
  showShareButton?: boolean;
  onShare?: () => void;
  shareLabel?: string;
}

export const QRDisplay: React.FC<QRDisplayProps> = ({
  data,
  title,
  showCopyButton = true,
  showShareButton = true,
  onShare,
  shareLabel,
}) => {
  const { t } = useTranslation();
  const { qrDataURL, loading, generateQR } = useQRCode();

  React.useEffect(() => {
    if (data) {
      generateQR(data);
    }
  }, [data, generateQR]);

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

  return (
    <Card className="text-center">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}

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