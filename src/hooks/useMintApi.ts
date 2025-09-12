// src/hooks/useMintApi.ts
import { useCallback } from 'react';

const BASE_URL = 'https://cash.hivecuba.com/mint';// DEV

interface mint {
  secret_hash: string;
  amount: number;    
}

export function useMintApi() {
  const mintTokens = useCallback(async (secretHash: string, amount: number) => {
    const callT: mint = { secret_hash: secretHash, amount: amount }
    try {
      const res = await fetch(`${BASE_URL}/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(callT),
      });

      if (!res.ok) {
        const errData = await res.text(); // usa text() para ver el error crudo
        throw new Error(errData || 'Error al generar tokens');
      }

      return (await res.json()) as { signature: string; deposit_uri: string; memo:string; };
    } catch (err) {
      console.error("Error en fetch:", err);
      throw err;
    }


  }, []);

  const checkDeposit = useCallback(async (secretHash: string) => {
    const res = await fetch(`${BASE_URL}/check_deposit/${secretHash}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al verificar depósito');
    return data as { deposit_valid: boolean };
  }, []);

  const internalTransfer = useCallback(async (tx: string, payhash: string) => {
    const res = await fetch(`${BASE_URL}/internal_transfer`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tx,
        payhash
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error en transferencia interna')
    return data as { status: string; message: string }
  }, []);

  const externalTransfer = useCallback(async (tx: string) => {
    const res = await fetch(`${BASE_URL}/external_transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tx }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error en transferencia externa')
    return data as { status: string; message: string }
  }, []);

  const getPublicKey = useCallback(async () => {
    const res = await fetch(`${BASE_URL}/public_key`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al obtener clave pública')
    return data as { public_key_hex: string }
  }, []);

  const getSign = useCallback(async (secretHash: string) => {
    const res = await fetch(`${BASE_URL}/get_sign/${secretHash}`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al obtener firma')
    return data as {
      signature: string
      amount: number
      status: string
      msg: string
    }
  }, []);

  return {
    mintTokens,
    checkDeposit,
    internalTransfer,
    externalTransfer,
    getPublicKey,
    getSign,
  };
};
