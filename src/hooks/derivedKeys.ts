import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

const uint8ToHexNode = (buffer: Uint8Array): string => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const generateKey = (ix: number, words: string) => {
  const seed = bip39.mnemonicToSeedSync(words);
  return uint8ToHexNode(
    bip32.fromSeed(seed).derivePath(`m/44'/0'/0'/0/${ix}`).privateKey! // Operador ! para indicar que sabemos que existe
  );
};

export default generateKey;
