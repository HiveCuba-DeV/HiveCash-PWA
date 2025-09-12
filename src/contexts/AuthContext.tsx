import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import CryptoJS from 'crypto-js';

interface AuthContextType {
  encryptedMnemonic: string | null;
  isUnlocked: boolean;
  currentMnemonic: string | null;
  unlock: (password: string) => boolean;
  lock: () => void;
  reset: () => void;
  saveMnemonic: (mnemonic: string, password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [encryptedMnemonic, setEncryptedMnemonic] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentMnemonic, setCurrentMnemonic] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('hivecash_encrypted_mnemonic');
    if (stored) {
      setEncryptedMnemonic(stored);
    }
  }, []);

  const unlock = (password: string): boolean => {
    if (!encryptedMnemonic) return false;
    
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedMnemonic, password);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (decrypted && decrypted.split(' ').length === 12) {
        setCurrentMnemonic(decrypted);
        setIsUnlocked(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Unlock error:', error);
      return false;
    }
  };

  const lock = () => {
    setCurrentMnemonic(null);
    setIsUnlocked(false);
  };

  const reset = () => {
    localStorage.removeItem('hivecash_encrypted_mnemonic');
    setEncryptedMnemonic(null);
    setCurrentMnemonic(null);
    setIsUnlocked(false);
  };

  const saveMnemonic = (mnemonic: string, password: string) => {
    const encrypted = CryptoJS.AES.encrypt(mnemonic, password).toString();
    localStorage.setItem('hivecash_encrypted_mnemonic', encrypted);
    setEncryptedMnemonic(encrypted);
    setCurrentMnemonic(mnemonic);
    setIsUnlocked(true);
  };

  return (
    <AuthContext.Provider value={{
      encryptedMnemonic,
      isUnlocked,
      currentMnemonic,
      unlock,
      lock,
      reset,
      saveMnemonic
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};