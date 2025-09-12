import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { BotonImagen } from '../components/UI/ButtonImage';
import { SafeCopyButton } from '../components/UI/CoppyButton';
import { Input } from '../components/UI/Input';
import { Card } from '../components/UI/Card';
import { QRDisplay } from '../components/QR/QRDisplay';
import { useWallet, Transaction, UTXO } from '../contexts/WalletContext';
import { useMintApi } from '../hooks/useMintApi';
import { useNavigate } from 'react-router-dom';


export const tovd = 'hivecuba.cash';

export const ReceiveOnchain: React.FC = () => {
  const { t } = useTranslation();
  const { lastDerivationIndex, deriveNext, receiveOnchain,
    addOrUpdateTransaction, addOrUpdateUTXO, incrementIndex } = useWallet();

  const [hash, setHash] = useState<string>("");
  const [amount, setAmount] = useState(0);
  const [useIndex, setuseIndex] = useState(0);
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);
  const [depositStatus, setDepositStatus] = useState<'idle' | 'checking' | 'confirmed' | 'pending' | 'failed'>('idle');
  const [hiveKeychainLink, setHiveKeychainLink] = useState('');
  const [memo, setMemo] = useState('');
  const { checkDeposit, mintTokens } = useMintApi();
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toedit, setToEdit] = useState(false);



  const handleGenerateQR = async () => {
    if (hash && hash !== '' && amount > 0 && navigator.onLine && qrData === '') {
      setToEdit(true);
      const intamount: number = parseInt((amount * 1000).toString(), 10);
      try {

        const response = await mintTokens(hash, intamount);

        const newUTXO: UTXO = {
          index: useIndex,
          hash: hash,
          sign: response.signature,
          amount: intamount,
          status: 'new',
          timestamp: new Date(),
          used: false,
        };

        const tt: Transaction = {
          id: hash,
          type: 'receive',
          origin: 'onchain',
          amount: intamount,
          status: 'pending',
          timestamp: new Date(),
        };

        setMemo(response.memo);
        await addOrUpdateUTXO(newUTXO);
        await addOrUpdateTransaction(tt);
        setHiveKeychainLink(response.deposit_uri);
        setQrData(response.deposit_uri);
        setDepositStatus('pending');
        incrementIndex();
      } catch (error) {
        console.error(error);
      }
    }
  };


  const handleAutoGenerate = async () => {
    try {
      setuseIndex(lastDerivationIndex);
      const newhash = await deriveNext();
      setHash(newhash);
    } catch (error) {
      setHash("");
      console.error(error);
    }
  };




  const checkDepositStatus = async () => {
    if (!hash) return;
    setDepositStatus('checking');
    try {
      if (navigator.onLine) {
        const response = await checkDeposit(hash);
        if (response.deposit_valid) {
          setDepositStatus('confirmed');
        } else {
          setDepositStatus('pending');
        }
      };
    } catch (error) {
      console.error('Failed to check deposit status:', error);
      setDepositStatus('failed');
    };
  };

  const handleConfirmDeposit = async () => {
    if (hash && amount && navigator.onLine && hiveKeychainLink !== '') {
      setLoading(true);
      try {
        await receiveOnchain(useIndex, hash);
        setDepositStatus('confirmed');
        // Reset form
        setuseIndex(lastDerivationIndex);
        setHash('');
        setAmount(0);
        setQrData('');
        setHiveKeychainLink('');
        setDepositStatus('idle');
        navigate('/home');
      } catch (error) {
        console.error('Failed to confirm deposit:', error);
        setDepositStatus('failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      setCopiedField(field);
      await navigator.clipboard.writeText(text);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };


  return (
    <Layout title={t('receiveOnchain')} showBack>
      <div className="space-y-6">
        {/* Generate Payment QR */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('generatePaymentQR')}
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex space-x-2">
                <Input
                  label={t('hash')}
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  placeholder="Payment hash (auto-generated if empty)"
                  fullWidth
                  disabled={toedit}
                />
                <Button
                  variant="secondary"
                  disabled={toedit}
                  onClick={handleAutoGenerate}
                  className="mt-7"
                >
                  <RefreshCw size={16} />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This hash will be used to identify your payment
              </p>
            </div>

            <Input
              type="number"
              label={t('amount')}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              placeholder="0.000"
              step="0.001"
              min="0.001"
              disabled={toedit}
              fullWidth
            />

            <Button
              variant="primary"
              fullWidth
              onClick={handleGenerateQR}
              disabled={!amount && toedit}
            >
              Mint and Generate Payment QR
            </Button>
          </div>
        </Card>

        {/* QR Display */}
        {qrData && (
          <div className="space-y-4">
            <QRDisplay
              data={qrData}
              title="HiveCash Payment Request"
              showCopyButton
              showShareButton
            />

            <Card className="p-6 max-w-md mx-auto bg-blue-50/50 shadow-lg hover:shadow-xl transition-shadow">
              <div className="space-y-4">
                <p className="text-gray-800 text-lg leading-relaxed">
                  {t('send')} {t('exact')}{" "}
                  <span
                    className="relative group inline-flex items-center"
                    onClick={() => handleCopy(amount.toString(), 'cantidad')}
                  >
                    <button className="px-2 py-1 rounded-lg bg-blue-100/50 hover:bg-blue-200/50 transition-colors cursor-pointer flex items-center gap-1">
                      <span className="text-blue-600 font-bold">{amount} </span>
                      <Copy className="w-4 h-4 text-blue-400" />
                    </button>
                    {copiedField === 'cantidad' && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 px-2 py-1 rounded-md flex items-center gap-1 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Copiado!
                      </span>
                    )} HBD{" "}
                  </span>{" "}
                  {t('touser')}{" "}
                  <span
                    className="relative group inline-flex items-center"
                    onClick={() => handleCopy(tovd, 'nombre')}
                  >
                    <button className="px-2 py-1 rounded-lg bg-blue-100/50 hover:bg-blue-200/50 transition-colors cursor-pointer flex items-center gap-1">
                      <span className="text-blue-600 font-bold">{tovd}</span>
                      <Copy className="w-4 h-4 text-blue-400" />
                    </button>
                    {copiedField === 'nombre' && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 px-2 py-1 rounded-md flex items-center gap-1 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Copiado!
                      </span>
                    )}
                  </span>{" "}
                  {t('wmemo')}{" "}
                  <span
                    className="relative group inline-flex items-center"
                    onClick={() => handleCopy(memo, 'memo')}
                  >
                    <button className="px-2 py-1 rounded-lg bg-blue-100/50 hover:bg-blue-200/50 transition-colors cursor-pointer flex items-center gap-1">
                      <span className="text-blue-600 font-bold">{memo}</span>
                      <Copy className="w-4 h-4 text-blue-400" />
                    </button>
                    {copiedField === 'memo' && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 px-2 py-1 rounded-md flex items-center gap-1 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Copiado!
                      </span>
                    )}
                  </span>
                </p>
              </div>
            </Card>




            {/* Hive-Keychain Link */}
            <Card>
              <center>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Open with Hive-Keychain Mobile
                </h4>
                <h5>Clic on Image</h5>
                <BotonImagen
                  imagenUrl='/images/logoHC.png'
                  redirectUrl={hiveKeychainLink}
                  altText="pay with Hive-Keycian on mobile"
                  className="m-4"
                  style={{
                    width: '300px',
                    height: '100px',
                    backgroundSize: '300px 100px'
                  }
                  }
                />
                <SafeCopyButton text={hiveKeychainLink} />
              </center>

            </Card>
          </div>
        )}

        {/* Deposit Status & Confirmation */}
        {hash && hash !== '' && amount > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Deposit Status
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('hash')}:</span>
                <span className="font-medium font-mono text-sm">
                  {hash.slice(0, 8)}...{hash.slice(-8)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('amount')}:</span>
                <span className="font-medium">{amount} HBD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <div className="flex items-center space-x-2">
                  {depositStatus === 'checking' && (
                    <>
                      <RefreshCw size={16} className="animate-spin text-blue-500" />
                      <span className="text-blue-600">Checking...</span>
                    </>
                  )}
                  {depositStatus === 'confirmed' && (
                    <>
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-green-600">Confirmed</span>
                    </>
                  )}
                  {depositStatus === 'pending' && (
                    <>
                      <AlertCircle size={16} className="text-yellow-500" />
                      <span className="text-yellow-600">Pending</span>
                    </>
                  )}
                  {depositStatus === 'failed' && (
                    <>
                      <AlertCircle size={16} className="text-red-500" />
                      <span className="text-red-600">Not Found</span>
                    </>
                  )}
                  {depositStatus === 'idle' && (
                    <span className="text-gray-500">Not checked</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={checkDepositStatus}
                loading={depositStatus === 'checking'}
                disabled={depositStatus === 'confirmed'}
              >
                <RefreshCw size={16} className="mr-2" />
                Check Deposit Status
              </Button>

              <Button
                variant="primary"
                fullWidth
                onClick={handleConfirmDeposit}
                loading={loading}
                disabled={depositStatus !== 'confirmed' && depositStatus !== 'pending'}
              >
                {t('confirmDeposit')}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};