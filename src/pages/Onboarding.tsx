import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, RefreshCw, Import } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Card } from '../components/UI/Card';
import { useAuth } from '../contexts/AuthContext';
import { useBIP39 } from '../hooks/useBIP39';
import {useWallet} from '../contexts/WalletContext';

export const Onboarding: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { saveMnemonic } = useAuth();
  const { mnemonic, isValid, generateMnemonic, setMnemonic } = useBIP39();

  const [step, setStep] = useState<'welcome' | 'seed' | 'import' | 'password'>('welcome');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [importSeed, setImportSeed] = useState('');
  const {resetWallet}=useWallet();

  const handleGenerateNew = () => {
    generateMnemonic();
    resetWallet();
    setStep('seed');
  };

  const handleImport = () => {
    setStep('import');
  };

  const handleImportConfirm = () => {
    if (isValid) {
      setStep('password');
    }
  };

  const handleSeedConfirm = () => {
    setStep('password');
  };

  const handlePasswordSubmit = () => {
    if (password.length >= 8 && password === confirmPassword) {
      const seedToSave = step === 'import' ? importSeed : mnemonic;
      saveMnemonic(seedToSave, password);
      navigate('/home');
    }
  };

  const passwordError = password && password.length < 8 ? t('passwordMinLength') : '';
  const confirmError = confirmPassword && password !== confirmPassword ? t('passwordMismatch') : '';

  return (
    <Layout title={t('welcomeTitle')} showBack={step !== 'welcome'}>
      <div className="space-y-6">
        {step === 'welcome' && (
          <Card className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('welcomeTitle')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('welcomeSubtitle')}
            </p>

            <div className="space-y-4">
              <Button
                variant="primary"
                fullWidth
                onClick={handleGenerateNew}
              >
                <RefreshCw size={20} className="mr-2" />
                {t('generateSeed')}
              </Button>

              <Button
                variant="secondary"
                fullWidth
                onClick={handleImport}
              >
                <Import size={20} className="mr-2" />
                {t('importSeed')}
              </Button>
            </div>
          </Card>
        )}

        {step === 'seed' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('seedPhrase')}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {t('seedPhraseHint')}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {mnemonic.split(' ').map((word, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-3 text-center font-mono text-sm"
                >
                  <span className="text-xs text-gray-400">{index + 1}</span>
                  <div className="font-medium">{word}</div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={generateMnemonic}
              >
                <RefreshCw size={16} className="mr-1" />
                Regenerate
              </Button>

              <Button
                variant="primary"
                onClick={handleSeedConfirm}
                fullWidth
              >
                {t('saveAndContinue')}
              </Button>
            </div>
          </Card>
        )}

        {step === 'import' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('importSeed')}
            </h3>

            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder={t('importSeedPlaceholder')}
              value={importSeed}
              onChange={(e) => {
                setImportSeed(e.target.value);
                setMnemonic(e.target.value);
              }}
            />

            {importSeed && !isValid && (
              <p className="text-red-600 text-sm mt-2">
                Invalid seed phrase
              </p>
            )}

            <Button
              variant="primary"
              fullWidth
              onClick={handleImportConfirm}
              disabled={!isValid}
              className="mt-4"
            >
              {t('continue')}
            </Button>
          </Card>
        )}

        {step === 'password' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('createPassword')}
            </h3>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={passwordError}
                  fullWidth
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <Input
                type={showPassword ? 'text' : 'password'}
                label={t('confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmError}
                fullWidth
              />

              <Button
                variant="primary"
                fullWidth
                onClick={handlePasswordSubmit}
                disabled={!password || !confirmPassword || !!passwordError || !!confirmError}
              >
                {t('saveAndContinue')}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};