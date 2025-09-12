import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Globe, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showLanguageToggle?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBack = false, 
  showLanguageToggle = true 
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-xl font-bold">
              {title || t('appName')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <div className="flex items-center space-x-1">
              {isOnline ? (
                <Wifi size={16} className="text-green-300" />
              ) : (
                <WifiOff size={16} className="text-yellow-300" />
              )}
            </div>
            
            {/* Language Toggle */}
            {showLanguageToggle && (
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
              >
                <Globe size={16} />
                <span className="text-sm font-medium">
                  {i18n.language.toUpperCase()}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-md">
        {children}
      </main>
    </div>
  );
};