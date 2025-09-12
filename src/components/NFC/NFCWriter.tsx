// src/components/NFC/NFCWriter.tsx
import React, { useEffect, useState } from 'react';
import { X, Nfc } from 'lucide-react';
import { Button } from '../UI/Button';
import { useTranslation } from 'react-i18next';

interface NFCWriterProps {
  isOpen: boolean;
  data: string;
  onClose: () => void;
}

export const NFCWriter: React.FC<NFCWriterProps> = ({
  isOpen,
  data,
  onClose,
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [writing, setWriting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    if (!('NDEFReader' in window)) {
      setError(t('nfcNotSupported'));
      return;
    }

    const writeNFC = async () => {
      try {
        setError(null);
        setWriting(true);

        const ndef = new (window as any).NDEFReader();
        // la API de Web NFC usa el mismo constructor para lectura/escritura
        await ndef.write({ records: [{ recordType: 'text', data }] });

        setWriting(false);
      } catch (err: any) {
        setError(err.message || t('nfcWriteError'));
        setWriting(false);
      }
    };

    writeNFC();

    return () => {
      setWriting(false);
      setError(null);
    };
  }, [isOpen, data, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-0 left-0 right-0 p-4 bg-black bg-opacity-50 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold">
          {t('shareNFC')}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-opacity-20"
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center h-full text-white p-6">
        <Nfc size={64} className="mb-4 opacity-60" />
        {error && (
          <p className="mb-4 text-red-400">{error}</p>
        )}
        {!error && writing && (
          <p className="text-center">{t('nfcWriting')}</p>
        )}
        {!error && !writing && (
          <p className="text-center">{t('nfcWriteSuccess')}</p>
        )}

        <Button
          variant="secondary"
          className="mt-6"
          onClick={onClose}
        >
          {t('close')}
        </Button>
      </div>
    </div>
  );
};
