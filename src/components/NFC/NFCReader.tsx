// src/components/NFC/NFCReader.tsx
import React, { useEffect, useState } from 'react';
import { X, Nfc } from 'lucide-react';
import { Button } from '../UI/Button';
import { useTranslation } from 'react-i18next';

interface NFCReaderProps {
  isOpen: boolean;
  onRead: (data: string) => void;
  onClose: () => void;
}

export const NFCReader: React.FC<NFCReaderProps> = ({
  isOpen,
  onRead,
  onClose,
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [reader, setReader] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    // si no hay soporte
    if (!('NDEFReader' in window)) {
      setError(t('nfcNotSupported'));
      return;
    }

    const ndef = new (window as any).NDEFReader();
    setReader(ndef);

    const startScan = async () => {
      try {
        setError(null);
        await ndef.scan();
        setScanning(true);

        ndef.onreading = (evt: any) => {
          // suponemos un registro TEXT, ajusta según tu tag
          for (const record of evt.message.records) {
            if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding);
              const data = textDecoder.decode(record.data);
              onRead(data);
              break;
            }
          }
        };

        ndef.onreadingerror = () => {
          setError(t('nfcReadError'));
          setScanning(false);
        };
      } catch (err: any) {
        setError(err.message || t('nfcPermissionError'));
      }
    };

    startScan();

    return () => {
      // no existe .stop(), se cancela al desmontar
      setScanning(false);
      setReader(null);
    };
  }, [isOpen, onRead, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 p-4 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold">
          {t('scanNFC')}
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

      {/* Body */}
      <div className="flex flex-col items-center justify-center h-full text-white p-6">
        <Nfc size={64} className="mb-4 opacity-60" />
        {error && <p className="mb-4 text-red-400">{error}</p>}
        {!error && scanning && (
          <p className="text-center">{t('nfcHoldDevice')}</p>
        )}
        {!error && !scanning && (
          <p className="text-center">{t('nfcRequesting')}</p>
        )}

        <Button
          variant="secondary"
          className="mt-6"
          onClick={onClose}
        >
          {t('cancel')}
        </Button>
      </div>
    </div>
  );
};
