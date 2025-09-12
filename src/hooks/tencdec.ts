import { gzip, ungzip } from 'pako';
import { useSCRYPT } from './useSCRYPT';

export const hexToBase64 = (hex: string) => {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  return btoa(String.fromCharCode(...bytes));
};

export const base64AHex = (base64: string) => {
  const binario = atob(base64);
  return Array.from(binario, char =>
    char.charCodeAt(0).toString(16).padStart(2, '0')
  ).join('');
}

export const arrayBufferToBase64 = (buffer: Uint8Array) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};



export const compressText = (text: string) => {

  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);


  const compressed = gzip(encoded, { level: 9 });


  return arrayBufferToBase64(compressed)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};


export const base64ToArrayBuffer = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const decompressText = (base64Str: string) => {
  const standardBase64 = base64Str
    .replace(/-/g, '+')
    .replace(/_/g, '/') +
    '=='.substring(0, (3 - (base64Str.length % 4)) % 3);

  const binary = base64ToArrayBuffer(standardBase64);

  const decompressed = ungzip(binary);

  return new TextDecoder().decode(decompressed);
};

// Conversión optimizada de hexadecimal a bytes
export function hexToBytes(hex: string): Uint8Array {
  if (!/^[\da-f]*$/i.test(hex) || hex.length % 2 !== 0) {
    throw new Error("Formato hexadecimal inválido");
  }

  return Uint8Array.from(
    { length: hex.length / 2 },
    (_, i) => parseInt(hex.substr(i * 2, 2), 16)
  );
}

// Conversión optimizada de bytes a hexadecimal
export function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

// Codificación Base64URL optimizada
export function hexToBase64url(hex: string): string {
  const bytes = hexToBytes(hex);
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
  return btoa(binary)
    .replace(/[+/]/g, m => ({ '+': '-', '/': '_' }[m]!))
    .replace(/=+$/, '');
}

// Decodificación Base64URL mejorada
export function base64urlToHex(b64url: string): string {
  const padding = b64url.length % 4;
  const b64 = b64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    + (padding ? '==='.slice(padding) : '');

  try {
    const binary = atob(b64);
    return bytesToHex(Uint8Array.from(binary, c => c.charCodeAt(0)));
  } catch (error) {
    throw new Error(`Error en Base64: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Codifica una cadena UTF-8 a Base64URL sin padding
 * @param str - Cadena de texto a codificar
 * @returns Cadena codificada en Base64URL sin padding
 */
export function encodeBase64Url(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  let base64 = btoa(String.fromCharCode(...data));

  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decodifica una cadena Base64URL sin padding a UTF-8
 * @param base64Url - Cadena codificada en Base64URL
 * @returns Cadena original decodificada
 */
export function decodeBase64Url(base64Url: string): string {
  let base64 = base64Url
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Calcular y añadir padding faltante
  const padLength = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(padLength);

  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new TextDecoder().decode(bytes);
  } catch (error) {
    throw new Error(`Error de decodificación: ${error instanceof Error ? error.message : 'Formato inválido'}`);
  }
}


export const tencdec = () => {

  const { deriveKey } = useSCRYPT();

  const serializeToBase64 = async (obj: object): Promise<string> => {
    // Convertir el objeto a una cadena JSON
    const jsonString = JSON.stringify(obj);

    //Change HERE
    // Usar TextEncoder para codificar la cadena JSON en un Uint8Array
    //const encoder = new TextEncoder();
    //const data = encoder.encode(jsonString);
    // Codificar el Uint8Array en Base64
    //const base64String = btoa(String.fromCharCode(...data));
    const base64String = encodeBase64Url(jsonString);
    // Calcular el checksum usando el hash SHA-256
    const hashHex = await deriveKey(base64String);
    const checksum = hashHex.slice(-5); // Tomar los últimos 5 caracteres del hash

    // Componer el texto final
    const finalString = `HiveCash${base64String}${checksum}`;

    return finalString;
  }

  const deserializeFromBase64 = async (finalString: string): Promise<object | null> => {
    // Extraer el Base64 y el checksum del texto final
    const prefix = "HiveCash";

    if (!finalString.startsWith(prefix)) {
      throw new Error("Invalid format");
    }

    const base64WithChecksum = finalString.slice(prefix.length);

    // Separar el Base64 del checksum
    const base64String = base64WithChecksum.slice(0, -5);
    const checksum = base64WithChecksum.slice(-5);

    // Verificar el checksum
    const expectedChecksum = await deriveKey(base64String);
    if (expectedChecksum.slice(-5) !== checksum) {
      throw new Error("Checksum does not match");
    }

    //Changes Here
    // Decodificar el Base64 a un Uint8Array
    //const binaryString = atob(base64String);
    //const len = binaryString.length;
    //const bytes = new Uint8Array(len);

    //for (let i = 0; i < len; i++) {
    // bytes[i] = binaryString.charCodeAt(i);
    //}

    // Usar TextDecoder para convertir el Uint8Array de nuevo a una cadena JSON
    //const decoder = new TextDecoder();
    //const jsonString = decoder.decode(bytes);

    const jsonString = decodeBase64Url(base64String)

    // Convertir la cadena JSON de nuevo a un objeto
    return JSON.parse(jsonString);
  }


  return {
    serializeToBase64,
    deserializeFromBase64
  }
}

