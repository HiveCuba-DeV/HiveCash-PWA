import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Card } from '../components/UI/Card';
import { DQRDisplay } from '../components/QR/DQRDisplay';
import { NFCWriter } from '../components/NFC/NFCWriter';
import { useWallet, UTXO } from '../contexts/WalletContext';



export const SendOffline: React.FC = () => {
  const { t } = useTranslation();
  const { balance, utxos, sendOffline } = useWallet();
  const [isgen, setIsgen] = useState(false);



  const [amount, setAmount] = useState('');
  const [transactionData, setTransactionData] = useState<{
    qrData: string;
  } | null>(null);
  const [showNFCWriter, setShowNFCWriter] = useState(false);

  const handleSend = async () => {
    const availableUTXOs = utxos.filter(utxo => utxo.status === 'payed');
    const intAmount = parseInt((Number(amount) * 1000).toString());
    const usetU: UTXO[] = [];
    let uamou = 0;
    if (!isgen) {
      setIsgen(true);
      for (let ut of availableUTXOs) {
        uamou += ut.amount;
        usetU.push(ut);
        if (uamou >= intAmount) break;
      }
      try {
        const qdata = await sendOffline(intAmount, usetU);
        setTransactionData({ qrData: qdata! });
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };



  return (
    <Layout title={t('sendOffline')} showBack>
      <div className="space-y-6">
        {/* Balance Display */}
        <Card className="text-center bg-gray-50">
          <p className="text-sm text-gray-600 mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            {balance.toFixed(3)} HBD
          </p>
        </Card>

        {/* Amount Input */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Send HBD
          </h3>

          <Input
            type="number"
            label={t('amount')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.000"
            step="0.001"
            min="0.001"
            disabled={isgen}
            fullWidth
          />

          {amount && parseFloat(amount) > balance && (
            <p className="text-red-600 text-sm mt-2">
              Amount exceeds  total balance
            </p>
          )}

          <Button
            variant="primary"
            fullWidth
            onClick={handleSend}
            disabled={parseFloat(amount) > balance && isgen}
            className="mt-4"
          >
            Create Transaction
          </Button>
        </Card>

        {/* Transaction Preview */}
        {transactionData && (
          <div className="space-y-4">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('previewTransaction')}
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Send Amount:</span>
                  <span className="font-medium">{amount} HBD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Change:</span>
                  <span className="font-medium">
                    {(balance - parseFloat(amount)).toFixed(3)} HBD
                  </span>
                </div>
              </div>
            </Card>

            <DQRDisplay
              data={transactionData.qrData}
              title={t('offlineTransaction')}
              showCopyButton
              showShareButton
              onShare={() => setShowNFCWriter(true)}
              shareLabel={t('shareNFC')}
            />
          </div>
        )}
        {/* Componente de emisión NFC */}
        {transactionData && (
          <NFCWriter
            isOpen={showNFCWriter}
            data={transactionData.qrData}
            onClose={() => setShowNFCWriter(false)}
          />
        )}
      </div>
    </Layout>
  );
};