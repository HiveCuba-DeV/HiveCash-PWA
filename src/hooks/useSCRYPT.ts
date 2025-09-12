import { useState, useCallback } from 'react';
import { scrypt } from 'scrypt-js';

const salt = new TextEncoder().encode('HiveCash');

const SCRYPT_PARAMS = {
  dkLen: 32,       // Longitud de clave derivada (equivalente a length)
  N: 16384,        // Factor de costo de CPU/memoria
  r: 8,            // Tamaño de bloque
  p: 1             // Factor de paralelización
};



export const useSCRYPT = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deriveKey = useCallback(async (password: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const passwordBuffer = new TextEncoder().encode(password);

      const derived = await scrypt(passwordBuffer, salt,
        SCRYPT_PARAMS.N,
        SCRYPT_PARAMS.r,
        SCRYPT_PARAMS.p,
        SCRYPT_PARAMS.dkLen);
      const hex = Array.from(derived).map(b => b.toString(16).padStart(2, '0')).join('');

      return hex;
    } catch (err) {
      setError('Key derivation failed');
      console.error('SCRYPT error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deriveKey,
    loading,
    error,
  };
};