import React from 'react';
import { useTranslation } from 'react-i18next';
import { Github, MessageCircle, Users, Heart } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';

export const About: React.FC = () => {
  const { t } = useTranslation();

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Layout title={t('about')} showBack>
      <div className="space-y-6">
        {/* App Info */}
        <Card className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">HC</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('appName')}
          </h2>
          <p className="text-gray-600 mb-4">
            Native installable HBD wallet for Hive blockchain
          </p>
          
          <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
            <span>{t('version')}: 1.0.1 Beta 2 </span>
          </div>
        </Card>

        {/* Developers */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users size={20} className="mr-2" />
            {t('developers')}
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">HiveCuba Team</p>
                <p className="text-sm text-gray-500">Core Development</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openLink('https://hivecuba.com')}
              >
                Website
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Hive Community</p>
                <p className="text-sm text-gray-500">Blockchain Infrastructure</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openLink('https://hive.io')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </Card>

        {/* Community */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Community & Support
          </h3>
          
          <div className="space-y-3">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => openLink('https://t.me/HiveCashSupp')}
              className="justify-start"
            >
              <MessageCircle size={20} className="mr-3" />
              {t('telegramGroup')}
            </Button>
            
            <Button
              variant="ghost"
              fullWidth
              onClick={() => openLink('https://github.com/Ertytux/hivecash')}
              className="justify-start"
            >
              <Github size={20} className="mr-3" />
              {t('github')}
            </Button>
          </div>
        </Card>

        {/* Features */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Key Features
          </h3>
          
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Offline-first architecture</li>
            <li>• PWA installable on mobile and desktop</li>
            <li>• Secure BIP39 seed phrase generation</li>
            <li>• QR code based transactions</li>
            <li>• Multi-language support (EN/ES)</li>
            <li>• SCRYPT key derivation</li>
            <li>• Hive blockchain integration</li>
          </ul>
        </Card>

        {/* Made with Love */}
        <Card className="text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            Made with <Heart size={16} className="mx-1 text-red-500" /> for the Hive community
          </p>
        </Card>
      </div>
    </Layout>
  );
};