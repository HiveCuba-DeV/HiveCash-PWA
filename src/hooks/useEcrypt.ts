import { useCallback } from 'react';
import { utils, getPublicKey, getSharedSecret } from '@noble/secp256k1';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';

// Convierte un string hex a Uint8Array
function hexToBytes(hex: string): Uint8Array {
    const pairs = hex.match(/[\da-f]{2}/gi) || [];
    return new Uint8Array(pairs.map((byte) => parseInt(byte, 16)));
}

// Convierte Uint8Array a base64
function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
}

export function useEncrypt() {
    const encrypt = useCallback(
        async (plaintext: string, recipientPubHex: string): Promise<string> => {
            // 1) Codificar datos de entrada
            const plainBytes = new TextEncoder().encode(plaintext);
            const recipientPubBytes = hexToBytes(recipientPubHex);

            // 2) Generar clave efímera (32 bytes)
            const ephemeralPriv = utils.randomPrivateKey();
            const ephemeralPub = getPublicKey(ephemeralPriv, true); // comprimida

            // 3) ECDH para obtener secreto compartido
            //    getSharedSecret devuelve 65 bytes (0x04 || X || Y)
            const fullSecret = await getSharedSecret(ephemeralPriv, recipientPubBytes);
            const sharedSecret = fullSecret.slice(1); // sólo X (32 bytes)

            // 4) Derivar clave AES-256 usando HKDF(SHA-256)
            const info = new TextEncoder().encode('ecdh-encryption');
            const salt = undefined;
            const rawKey = hkdf(sha256, sharedSecret, salt, info, 32);
            const aesKeyBytes = new Uint8Array(rawKey);


            // 5) Cifrar con AES-GCM
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                aesKeyBytes,
                { name: 'AES-GCM' },
                false,
                ['encrypt']
            );
            const encryptedBuffer = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                cryptoKey,
                plainBytes
            );
            const encryptedBytes = new Uint8Array(encryptedBuffer);

            // 6) Separar ciphertext y tag (últimos 16 bytes)
            const tag = encryptedBytes.slice(-16);
            const ciphertext = encryptedBytes.slice(0, -16);

            // 7) Empaquetar en JSON + Base64
            const payload = {
                ephemeral_public: bytesToBase64(ephemeralPub),
                iv: bytesToBase64(iv),
                ciphertext: bytesToBase64(ciphertext),
                tag: bytesToBase64(tag),
            };

            // 8) Devolver Base64(JSON)
            return btoa(JSON.stringify(payload));
        },
        []
    );

    return { encrypt };
}
