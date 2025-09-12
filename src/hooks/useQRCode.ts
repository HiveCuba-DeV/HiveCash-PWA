import { useState, useCallback } from 'react';
import QRCode from 'qrcode';

export const useQRCode = () => {
  const [qrDataURL, setQRDataURL] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQR = useCallback(async (data: string) => {
    setLoading(true);
    setError(null);

    try {
      const dataURL = await QRCode.toDataURL(data, {
        width: 512,                
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQRDataURL(dataURL);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR generation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    qrDataURL,
    loading,
    error,
    generateQR,
  };
};