import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Download, History, Info, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { balance, lastDerivationIndex, transactions, syncBalances } = useWallet();
  const { lock } = useAuth();

  const [isSyncing, setIsSyncing] = useState(false);
  const lastSyncRef = useRef<number>(0);
  const syncInFlightRef = useRef<Promise<void> | null>(null);

  const THROTTLE_INTERVAL = 60_000;

  const triggerSync = async () => {
    const now = Date.now();
    if (syncInFlightRef.current) {
      // Ya hay una sincronización en curso
      return syncInFlightRef.current;
    }
    if (now - lastSyncRef.current < THROTTLE_INTERVAL) {
      // Demasiado pronto para volver a sincronizar
      return;
    }

    setIsSyncing(true);
    const p = syncBalances()
      .catch((err) => {
        console.error('Error sincronizando balance', err);
      })
      .finally(() => {
        lastSyncRef.current = Date.now();
        setIsSyncing(false);
        syncInFlightRef.current = null;
      });

    syncInFlightRef.current = p;
    return p;
  };

  // Sincronizar sólo al montar
  useEffect(() => {
    triggerSync();
  }, []);

  const handleLock = () => {
    lock();
    navigate('/unlock');
  };

  const recentTransactions = transactions.slice(-3).reverse();

  return (
    <Layout title={t('appName')}>
      <div className="space-y-6">
        {/* Balance Card */}
        <Card className="text-center bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <h2 className="text-sm font-medium text-gray-600 mb-2">
            {t('totalBalance')}
          </h2>
          <p className="text-4xl font-bold text-red-600 mb-4">
            {balance.toFixed(3)} HBD
          </p>
          <p className="text-sm text-gray-500">
            {t('currentDerivation')}: #{lastDerivationIndex}
          </p>
          {/* Botón manual de refresco */}
          <Button
            variant="ghost"
            size="sm"
            onClick={triggerSync}
            disabled={isSyncing}
          >
            {isSyncing ? t('Syncing') : t('RefreshBalance')}
          </Button>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/receive')}
            className="h-20 flex-col"
          >
            <Download size={24} className="mb-2" />
            {t('receive')}
          </Button>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/send')}
            className="h-20 flex-col"
          >
            <Send size={24} className="mb-2" />
            {t('send')}
          </Button>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="ghost"
            fullWidth
            onClick={() => navigate('/history')}
            className="h-16 flex-col border border-gray-200"
          >
            <History size={20} className="mb-1" />
            {t('history')}
          </Button>

          <Button
            variant="ghost"
            fullWidth
            onClick={() => navigate('/about')}
            className="h-16 flex-col border border-gray-200"
          >
            <Info size={20} className="mb-1" />
            {t('about')}
          </Button>
        </div>

        {/* Recent Activity */}
        {recentTransactions.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('recentActivity')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/history')}
              >
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${tx.type === 'send' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                      {tx.type === 'send' ? (
                        <ArrowUpRight size={16} className="text-red-600" />
                      ) : (
                        <ArrowDownLeft size={16} className="text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {tx.type === 'send' ? 'Sent' : 'Received'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {tx.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === 'send' ? 'text-red-600' : 'text-green-600'
                      }`}>
                      {tx.type === 'send' ? '-' : '+'}
                      {(tx.amount*1.e-3).toFixed(3)} HBD
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Lock Button */}
        <Button
          variant="ghost"
          fullWidth
          onClick={handleLock}
          className="text-gray-500 hover:text-gray-700"
        >
          Lock Wallet
        </Button>
      </div>
    </Layout>
  );
};