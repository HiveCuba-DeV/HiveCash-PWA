import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Card } from '../components/UI/Card';
import { useWallet, UTXO } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';

export const SendOnchain: React.FC = () => {
  const { t } = useTranslation();
  const { balance, utxos, sendOnchain } = useWallet();
  const navigate = useNavigate();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePreview = () => {
    if (recipient && amount) {
      setShowPreview(true);
    }
  };

  const handleSend = async () => {
    if (recipient && amount) {
      setLoading(true);
      try {
        let outbal = 0;
        const flamount = Number(amount);
        let outtxs: UTXO[] = [];

        for (let ut of utxos) {
          if (outbal < flamount) {
            if (ut.status === 'payed') {
              outtxs.push(ut);
              outbal += ut.amount * 1.e-3;
              if (outbal >= flamount) break;
            }
          }
        }
        await sendOnchain(recipient, flamount, memo,outtxs);
        
        // Reset form
        setRecipient('');
        setAmount('');
        setMemo('');
        setShowPreview(false);
        navigate('/home');
      } catch (error) {
        console.error('Failed to send transaction:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const isValidAmount = amount &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= balance;

  return (
    <Layout title={t('sendOnchain')} showBack>
      <div className="space-y-6">
        {/* Balance Display */}
        <Card className="text-center bg-gray-50">
          <p className="text-sm text-gray-600 mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            {balance.toFixed(3)} HBD
          </p>
        </Card>

        {/* Send Form */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Send HBD
          </h3>

          <div className="space-y-4">
            <Input
              label={t('recipientUser')}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="username"
              fullWidth
            />

            <Input
              type="number"
              label={t('amount')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.000"              
              step="0.001"
              min="0.001"
              fullWidth
            />

            {amount && parseFloat(amount) > balance && (
              <p className="text-red-600 text-sm">
                Amount exceeds available balance
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('memo')} (Optional)
              </label>
              <textarea
                className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Transaction memo..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                maxLength={256}
              />
              <p className="text-xs text-gray-500 mt-1">
                {memo.length}/256 characters
              </p>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handlePreview}
              disabled={!recipient || !isValidAmount}
            >
              {t('previewTransaction')}
            </Button>
          </div>
        </Card>

        {/* Transaction Preview */}
        {showPreview && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('previewTransaction')}
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('amount')}:</span>
                <span className="font-medium">{amount} HBD</span>
              </div>
              {memo && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('memo')}:</span>
                  <span className="font-medium">{memo}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">Remaining Balance:</span>
                <span className="font-medium">
                  {(balance - parseFloat(amount)).toFixed(3)} HBD
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowPreview(false)}
                fullWidth
              >
                {t('back')}
              </Button>
              <Button
                variant="primary"
                onClick={handleSend}
                loading={loading}
                fullWidth              >
                {t('sendTransaction')}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};