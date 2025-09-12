// src/pages/ReceiveOffline.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QrCode, Nfc } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { DQRReader } from '../components/QR/DQRReader';
import { NFCReader } from '../components/NFC/NFCReader';
import { useWallet, TxOffChain } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import { tencdec } from '../hooks/tencdec';

export const ReceiveOffline: React.FC = () => {
  const { t } = useTranslation();
  const { receiveOffline } = useWallet();
  const { deserializeFromBase64 } = tencdec();
  const navigate = useNavigate();
  const [fixd, setFixd] = useState(false);
  const [isrec, setIsRec] = useState(false);

  const [showQRReader, setShowQRReader] = useState(false);
  const [showNFCReader, setShowNFCReader] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [rawInput, setRawInput] = useState<string>('');
  const [eamount, setEamount] = useState<number>(0);

  const processScannedData = async (data: string) => {
    try {
      setFixd(true);
      const edata = (await deserializeFromBase64(data)) as TxOffChain;
      setEamount(edata.amount);
      setScannedData(data);
      setShowQRReader(false);
      setShowNFCReader(false);
      setRawInput('');

    } catch (err) {
      console.error('Invalid data:', err);
      // TODO: Toast de error
    }
  };

  const handleQRScan = (data: string) => processScannedData(data);
  const handleNFCRead = (data: string) => processScannedData(data);

  const handleRawSubmit = () => {
    if (rawInput.trim()) processScannedData(rawInput.trim());
  };

  const handleConfirmReceive = async () => {
    if (scannedData && eamount > 0 && !isrec) {
      setIsRec(true)
      await receiveOffline(scannedData);
      setScannedData('');
      setEamount(0);
      navigate('/home');
    }
  };

  return (
    <Layout title={t('receiveOffline')} showBack>
      <div className="space-y-6">
        {/* QR Scanner */}
        <Card className="text-center">
          <h3 className="text-lg font-semibold mb-4">{t('scanQR')}</h3>
          <Button
            variant="primary"
            disabled={fixd}
            fullWidth
            onClick={() => setShowQRReader(true)}
          >
            <QrCode size={20} className="mr-2" />
            {t('scanQR')}
          </Button>
        </Card>

        {/* NFC Scanner */}
        <Card className="text-center">
          <h3 className="text-lg font-semibold mb-4">{t('scanNFC')}</h3>
          <Button
            variant="primary"
            disabled={fixd}
            fullWidth
            onClick={() => setShowNFCReader(true)}
          >
            <Nfc size={20} className="mr-2" />
            {t('scanNFC')}
          </Button>
        </Card>

        {/* Raw Input */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">
            {t('pasteRawData')}
          </h3>
          <textarea
            className="w-full border rounded-lg p-2 text-sm"
            rows={4}
            placeholder='HiveCash.....'
            value={rawInput}
            disabled={fixd}
            onChange={(e) => setRawInput(e.target.value)}
          />
          <Button
            variant="primary"
            fullWidth
            className="mt-3"
            disabled={fixd}
            onClick={handleRawSubmit}
          >
            {t('processRawData')}
          </Button>
        </Card>

        {/* Preview del escaneado */}
        {scannedData && (
          <Card>
            <h3 className="text-lg font-semibold mb-4">
              {t('paymentDetails')}
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('amount')}:</span>
                <span className="font-medium">
                  {(eamount * 1e-3).toFixed(3)} HBD
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setScannedData('')}
                fullWidth
              >
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                disabled={isrec}
                onClick={handleConfirmReceive}
                fullWidth
              >
                {t('confirmWhenOnline')}
              </Button>
            </div>
          </Card>
        )}

        {/* Modales de lectura */}
        <DQRReader
          isOpen={showQRReader}
          onScan={handleQRScan}
          onClose={() => setShowQRReader(false)}
        />
        <NFCReader
          isOpen={showNFCReader}
          onRead={handleNFCRead}
          onClose={() => setShowNFCReader(false)}
        />
      </div>
    </Layout>
  );
};
