import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wallet } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { encryptedMnemonic } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (encryptedMnemonic) {
        navigate('/unlock');
      } else {
        navigate('/onboarding');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [encryptedMnemonic, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-black flex items-center justify-center">
      <div className="text-center text-white">
        <div className="mb-8">
          <Wallet size={80} className="mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">HiveCash</h1>
          <p className="text-xl opacity-90">HBD Wallet for Hive</p>
        </div>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    </div>
  );
};