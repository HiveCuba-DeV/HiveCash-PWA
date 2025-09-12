import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Card } from '../components/UI/Card';
import { useAuth } from '../contexts/AuthContext';
import {useWallet} from '../contexts/WalletContext';

export const Unlock: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { unlock, reset } = useAuth();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const {resetWallet}=useWallet();

  const handleUnlock = () => {
    if (unlock(password)) {
      navigate('/home');
    } else {
      setError(t('invalidPassword'));
    }
  };

  const handleReset = () => {
    resetWallet();
    reset();    
    navigate('/onboarding');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  return (
    <Layout title={t('unlock')}>
      <div className="space-y-6">
        <Card className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('unlock')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('enterPassword')}
          </p>
          
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label={t('password')}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                error={error}
                fullWidth
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <Button
              variant="primary"
              fullWidth
              onClick={handleUnlock}
              disabled={!password}
            >
              {t('unlock')}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('resetWallet')}
            </h3>
            
            {!showResetConfirm ? (
              <Button
                variant="danger"
                onClick={() => setShowResetConfirm(true)}
              >
                <Trash2 size={16} className="mr-2" />
                {t('resetWallet')}
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  This will permanently delete your wallet data. Make sure you have your recovery phrase saved.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowResetConfirm(false)}
                    fullWidth
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleReset}
                    fullWidth
                  >
                    {t('confirm')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};