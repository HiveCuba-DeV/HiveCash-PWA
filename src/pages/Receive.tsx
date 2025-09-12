import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { QrCode, Wifi, WifiOff, ArrowRight } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';

export const Receive: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Layout title={t('receive')} showBack>
      <div className="space-y-6">
        {/* Header */}
        <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            {t('receive')} HBD
          </h2>
          <p className="text-green-600">
            Choose how you want to receive payments
          </p>
        </Card>

        {/* Receive Options */}
        <div className="space-y-4" >
          {/* Offline Option */}
          <div onClick={() => navigate('/receive/offline')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <WifiOff size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('receiveOffline')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Scan QR codes from other HiveCash users
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Instant
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        No fees
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight size={20} className="text-gray-400" />
              </div>
            </Card></div>

          {/* Online Option */}
          <div onClick={() => navigate('/receive/onchain')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Wifi size={24} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('receiveOnchain')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Generate payment request for Hive blockchain
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Blockchain
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Hive-Keychain
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight size={20} className="text-gray-400" />
              </div>
            </Card> </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/receive/offline')}
            className="h-16 flex-col"
          >
            <QrCode size={20} className="mb-1" />
            Quick Scan
          </Button>

          <Button
            variant="ghost"
            fullWidth
            onClick={() => navigate('/receive/onchain')}
            className="h-16 flex-col border border-gray-200"
          >
            <Wifi size={20} className="mb-1" />
            Generate QR
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2">
            Payment Methods
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <strong>Offline:</strong> Instant transfers between HiveCash users
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <strong>On-chain:</strong> Receive from any Hive wallet or exchange
            </li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
};