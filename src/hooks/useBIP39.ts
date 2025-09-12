import { useState, useCallback } from 'react';

import * as bip39 from 'bip39';

/*
function rng(size: number): Uint8Array {
  const array = new Uint8Array(size);
  crypto.getRandomValues(array); // Web Crypto API
  return array;
}
*/

export const useBIP39 = () => {
  const [mnemonic, setMnemonic] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  const generateMnemonic = useCallback((): string => {
    const newMnemonic = bip39.generateMnemonic(128);
    setMnemonic(newMnemonic);
    setIsValid(true);
    return newMnemonic;
  }, []);

  const validateMnemonic = useCallback((words: string): boolean => {
    const wordArray = words.trim().toLowerCase().split(/\s+/);
    if (wordArray.length !== 12) return false;

    const isValidWords = bip39.validateMnemonic(words);
    setIsValid(isValidWords);
    return isValidWords;
  }, []);

  const setAndValidate = useCallback(
    (words: string) => {
      setMnemonic(words);
      validateMnemonic(words);
    },
    [validateMnemonic]
  );

  return {
    mnemonic,
    isValid,
    generateMnemonic,
    validateMnemonic,
    setMnemonic: setAndValidate,
  };
};
