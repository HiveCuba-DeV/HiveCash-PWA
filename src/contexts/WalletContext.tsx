import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { generateKey } from '../hooks/derivedKeys';
import { useMintApi } from '../hooks/useMintApi';
import { useSCRYPT } from '../hooks/useSCRYPT';
import { useEncrypt } from '../hooks/useEcrypt';
import { tencdec, hexToBase64url } from '../hooks/tencdec';

import { useAuth } from './AuthContext';

export interface UTXO {
  index: number;
  hash: string;
  sign: string;
  amount: number;
  status: string;
  timestamp: Date;
  used: boolean;
}

export interface TxOff {
  in: string[][];
  ch: string[];
  payamount?: number;
  out?: (string | number)[];
  version?: number;
}

export interface TxOnChain {
  tx: string;
}

export interface TxOffChain {
  tx: string;
  amount: number;
}

export interface TxEOffChain {
  tx: string;
  amount: number;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  origin: 'onchain' | 'offline';
  amount: number;
  status: 'pending' | 'confirmed' | 'used' | 'rejected';
  timestamp: Date;
  recipient?: string;
  memo?: string;
}

/*
export function eliminarDuplicadosPorAtributo<T>(array: T[], atributo: keyof T): T[] {
  const valoresUnicos = new Set();
  return array.filter((objeto) => {
    const valor = objeto[atributo];
    if (valoresUnicos.has(valor)) {
      return false;
    }
    valoresUnicos.add(valor);
    return true;
  });
}*/

export const isnavigate = () => { return navigator.onLine };

export const backEndPubhex = '02133ffe174fc9aa50ad6d426eccc1ab23d6e0001b0e2d527615c036415fa4fb18';


interface WalletContextType {
  balance: number;
  utxos: UTXO[];
  tokens: TxEOffChain[];
  lastDerivationIndex: number;
  transactions: Transaction[];
  resetWallet: () => void;
  addOrUpdateTransaction: (inputT: Transaction) => Promise<void>;
  addOrUpdateUTXO: (inputT: UTXO) => Promise<void>;
  deriveNext: () => Promise<string>;
  incrementIndex: () => void;
  syncBalances: () => Promise<void>;
  sendOffline: (amount: number, selectedUTXOs: UTXO[]) => Promise<string | undefined>;
  receiveOffline: (qrData: string) => Promise<void>;
  sendOnchain: (recipient: string, amount: number, memo: string, selectedUTXOs: UTXO[]) => Promise<void>;
  receiveOnchain: (index: number, hash: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentMnemonic } = useAuth();
  const { deriveKey, } = useSCRYPT();
  const { checkDeposit, getSign, externalTransfer, internalTransfer } = useMintApi();
  const { encrypt } = useEncrypt();
  const { serializeToBase64, deserializeFromBase64 } = tencdec();


  // Carga inicial desde localStorage
  const [utxos, setUtxos] = useState<UTXO[]>(() => {
    const saved = localStorage.getItem('walletUtxos');
    return saved ? JSON.parse(saved).map((utxo: any) => ({
      ...utxo,
      timestamp: new Date(utxo.timestamp)
    })) : [];
  });

  const [tokens, setTokens] = useState<TxEOffChain[]>(() => {
    try {
      const stored = localStorage.getItem('walletTokens');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return parsed as TxEOffChain[];
    } catch {
      return [];
    };
  });


  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('walletTransactions');
    return saved ? JSON.parse(saved).map((tx: any) => ({
      ...tx,
      timestamp: new Date(tx.timestamp)
    })) : [];
  });

  const [lastDerivationIndex, setLastDerivationIndex] = useState<number>(() => {
    const saved = localStorage.getItem('lastDerivationIndex');
    const savenumber = saved ? parseInt(saved) : 0;
    return savenumber < 0 ? 0 : savenumber;
  });

  const [firsSync, setFirstSync] = useState<boolean>(() => {
    const saved = localStorage.getItem('firstSync');
    return saved ? saved === 'true' : false;
  });

  const [balance, setBalance] = useState(0);



  // Persistencia automática
  useEffect(() => {
    localStorage.setItem('firstSync', firsSync ? 'true' : 'false');
  }, [firsSync]);

  useEffect(() => {
    localStorage.setItem('walletUtxos',
      JSON.stringify(utxos.map(utxo => ({
        ...utxo,
        timestamp: utxo.timestamp.toISOString()
      })))
    );
  }, [utxos]);

  useEffect(() => {
    if (transactions)
      localStorage.setItem('walletTransactions',
        JSON.stringify(transactions.map(tx => ({
          ...tx,
          timestamp: tx.timestamp.toISOString()
        })))
      );
  }, [transactions]);

  useEffect(() => {
    if (tokens)
      localStorage.setItem('walletTokens', JSON.stringify(tokens));
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem('lastDerivationIndex', lastDerivationIndex.toString());
  }, [lastDerivationIndex]);

  const resetWallet = (): void => {
    setUtxos([]);
    setTransactions([]);
    setTokens([]);
    setLastDerivationIndex(0);
    setBalance(0);
    setFirstSync(false);
  };

  const addOrUpdateUTXO = async (inputT: UTXO): Promise<void> => {
    if (!currentMnemonic) return;
    const tindex = utxos.findIndex(tx => tx.hash === inputT.hash);
    if (tindex !== -1) {//Already exist
      setUtxos(prev => {
        const update = [...prev];
        update[tindex] = { ...update[tindex], ...inputT }
        return update;
      });
      return;
    }
    //Add New one
    setUtxos(prev => [...prev, inputT]);
  };

  const addOrUpdateTransaction = async (inputT: Transaction): Promise<void> => {
    if (!currentMnemonic) return;
    const tindex = transactions.findIndex(tx => tx.id === inputT.id);
    if (tindex !== -1) {//Already exist
      setTransactions(prev => {
        const update = [...prev];
        update[tindex] = { ...update[tindex], ...inputT }
        return update;
      });
      return;
    }
    //Add New one
    setTransactions(prev => [...prev, inputT]);
  };


  const deriveNext = async (): Promise<string> => {
    try {
      const key = generateKey(lastDerivationIndex, currentMnemonic!);
      return await deriveKey(key);
    } catch (e) {
      console.error("Error en deriveNext:", e);
      throw e;
    }
  };

  const getLasIndex = () => {
    return lastDerivationIndex;
  }

  const incrementIndex = () => {
    setLastDerivationIndex(lastDerivationIndex + 1);
  }

  const getUTXOs = () => {
    return utxos;
  }

  /*const getTrans = () => {
    return transactions;
  }*/

  // Sync Balance OK
  const syncBalances = async (): Promise<void> => {
    let sumBalance: number = 0;
    if (!currentMnemonic) return;

    //Restore Wallet from seed
    if (utxos.length === 0 && !firsSync && isnavigate()) {
      let sindex: number = 0;
      let unmintindex: number = 0;
      let boolx = true;
      let mams: number = 0;
      const maxunmint = 10;//Explore almost 10 unmint
      try {
        do {
          //console.log("Go to: ", sindex);
          const key = generateKey(sindex, currentMnemonic!);
          const fhas = await deriveKey(key);
          const rsy = await getSign(fhas);
          //console.log({ index: sindex, status: rsy.status });
          if (rsy.status === 'unmint') {
            unmintindex++;
            if (unmintindex > maxunmint) boolx = false; //end loop
          } else {
            unmintindex = 0; //reset unmintindex
            const syUto: UTXO = {
              index: sindex,
              hash: fhas,
              sign: rsy.signature,
              amount: rsy.amount,
              status: rsy.status,
              timestamp: new Date(),
              used: rsy.status === 'used'
            };
            addOrUpdateUTXO(syUto);
            const syTx: Transaction = {
              id: fhas,
              type: 'receive',
              origin: 'offline',
              amount: rsy.amount,
              status: rsy.status === 'used' ? 'used' :
                rsy.status === 'payed' ? 'confirmed' : 'pending',
              timestamp: new Date()
            }
            addOrUpdateTransaction(syTx);
            mams += rsy.status === 'payed' ? rsy.amount*1.e-3 : 0;
            setBalance(mams);
            setLastDerivationIndex(sindex + 1); //Count the last found
          }
          sindex++;
        } while (boolx);
        setFirstSync(true);
        setBalance(mams); //only for safe
        return; 
      } catch (error) {
        console.error("Error No First Sync: ", error);
      }
    }


    //Normal Sync
    if (isnavigate()) {
      //Process offline token first if any
      const toElimitate: string[] = [];
      try {
        for (let tt of tokens) {
          const findex = getLasIndex();
          const key = generateKey(findex, currentMnemonic!);
          const payhash = await deriveKey(key);

          const rf = await internalTransfer(tt.tx, payhash);
          const newTransaction: Transaction = {
            id: payhash,
            type: 'receive',
            origin: 'offline',
            amount: tt.amount,
            status: rf.status === 'error' ? 'rejected' : 'confirmed',
            timestamp: new Date(),
          };
          const newUTX: UTXO = {
            index: lastDerivationIndex,
            hash: payhash,
            sign: '',
            amount: tt.amount,
            status: rf.status === 'error' ? 'unmint' : 'new',
            timestamp: new Date(),
            used: false,
          };

          if (rf.status==='success') sumBalance+=tt.amount*1.e-3;

          addOrUpdateTransaction(newTransaction);
          addOrUpdateUTXO(newUTX);
          toElimitate.push(tt.tx);
          incrementIndex();
        };
      } catch (error) {
        console.error("Error on tokens preoccess: ", error);
      }
      for (let stx of toElimitate) {
        setTokens(prevTokens => {
          const nuevosTokens = prevTokens.filter(token => token.tx !== stx);
          return nuevosTokens;
        });
      }

      const unusedTokens = getUTXOs().filter(x => x.status !== 'used');



      for (let tx of unusedTokens) {
        try {

          await checkDeposit(tx.hash);

          const response = await getSign(tx.hash);

          const newUTXO: UTXO = {
            index: tx.index,
            hash: tx.hash,
            sign: response.signature,
            amount: response.amount,
            status: response.status,
            timestamp: tx.timestamp || new Date(),
            used: response.status === 'used'
          };

          addOrUpdateUTXO(newUTXO);

          const tindex = transactions.findIndex(x => x.id === tx.hash);

          if (tindex !== -1) {
            const ntt: Transaction = {
              ...transactions[tindex],
              status: response.status === 'used' ? 'used' :
                response.status === 'payed' ? 'confirmed' : 'pending',
              timestamp: transactions[tindex].timestamp || new Date()
            };

            await addOrUpdateTransaction(ntt);
          } else {
            throw new Error("Transaction nos asociated");
          }

          if (response.status === 'payed' && tx.status !== 'used') { sumBalance += response.amount * 1.e-3; };

        } catch (error) {
          console.error('Error en syncBalances:', error);
        }

      };

    } else {
      for (let tt of utxos) {
        if (tt.status === 'payed') { sumBalance += tt.amount * 1.e-3; };
      }
    };
    setBalance(sumBalance);
  };


  const sendOffline = async (amount: number, selectedUTXOs: UTXO[]): Promise<string | undefined> => {
    if (!currentMnemonic) throw new Error(" No Mnemonic");
    if (!selectedUTXOs) throw new Error(" No UTXOs selection");
    try {
      const changeHash = await deriveNext();

      const ins: string[][] = [];

      let outmount = 0;
      for (let tx of selectedUTXOs) {
        const key = generateKey(tx.index, currentMnemonic!);
        ins.push([hexToBase64url(key)]); //Change to version 1 hex -> b64 unpadding
        outmount += tx.amount;
      }

      if (outmount < amount) throw new Error("Bad amount on transaction");

      const ch: string[] = [hexToBase64url(changeHash)];

      const tosend: TxOff = {
        in: ins,
        ch: ch,
        payamount: amount,
        version: 1
      }

      const ctx = await encrypt(JSON.stringify(tosend), backEndPubhex);

      const token: TxOffChain = {
        tx: ctx,
        amount: amount
      };

      const newTransaction: Transaction = {
        id: changeHash,
        type: 'send',
        origin: 'offline',
        amount: amount,
        status: 'pending',
        timestamp: new Date()
      };

      const unuseUt: UTXO = {
        index: getLasIndex(),
        amount: outmount - amount,
        hash: changeHash,
        status: 'unmint',
        sign: '',
        timestamp: new Date(),
        used: false
      };

      await addOrUpdateTransaction(newTransaction);

      setUtxos(prev => {
        const update = [...prev];
        for (let tx of selectedUTXOs) {
          const findex = update.findIndex(x => x.index === tx.index)
          update[findex] = {
            ...update[findex],
            status: 'used',
            used: true
          };
        };
        return [...update, unuseUt];
      });

      incrementIndex();
      return await serializeToBase64(token);
    } catch (error) {
      console.error("Error offchain send: ", error);
    }
  };

  const receiveOffline = async (qrData: string) => {
    if (!qrData) throw new Error("Receive QR data Fail");
    try {
      const data = await deserializeFromBase64(qrData) as TxOffChain;

      const tkk: TxEOffChain = {
        tx: data.tx,
        amount: data.amount
      }

      setTokens(prev => {
        const update = prev.filter(x => x.tx !== tkk.tx);
        return [...update, tkk];
      });

    } catch (error) {
      console.error('Error processing offline receive:', error);
    }
  };

  const sendOnchain = async (recipient: string, amount: number, memo: string, selectedUTXOs: UTXO[]): Promise<void> => {
    if (!currentMnemonic) throw new Error(" No Mnemonic");
    if (!selectedUTXOs) throw new Error(" No UTXOs selection");

    const intAmount = parseInt((amount * 1000).toString());
    const nh = await deriveNext();

    /// Use Version 0 as default === HEX

    const ch: string[] = [nh]; //Cahge hash
    const out: (string | number)[] = [recipient, intAmount, memo]; //To HIVE
    const ins: string[][] = []; //Input utxos

    let inam: number = 0;

    for (let tx of selectedUTXOs) {
      const key = generateKey(tx.index, currentMnemonic!);
      ins.push([key]);
      inam += tx.amount;
    }

    const tosend: TxOff = {
      in: ins,
      ch: ch,
      out: out
    }

    //Encrypt with public key of HBD Mint
    const ctx = await encrypt(JSON.stringify(tosend), backEndPubhex);

    if (isnavigate()) {
      try {
        const resp = await externalTransfer(ctx);

        if (resp.status !== 'error') {

          const unuseUt: UTXO = { //Update when sync
            index: lastDerivationIndex,
            amount: inam - intAmount,
            hash: nh,
            status: 'new',
            sign: '',
            timestamp: new Date(),
            used: false
          }

          setUtxos(prev => {
            const update = [...prev];
            for (let tx of selectedUTXOs) {
              const findex = update.findIndex(tl => tl.hash === tx.hash)
              update[findex] = {
                ...update[findex],
                status: 'used',
                used: true
              };
            };
            return [...update, unuseUt];
          });

          incrementIndex();

          const newTransaction: Transaction = {
            id: nh,
            type: 'send',
            origin: 'onchain',
            amount: intAmount,
            status: 'confirmed',
            timestamp: new Date(),
            recipient,
            memo,
          };

          setTransactions(prev => {
            const update = [...prev];
            for (let tx of selectedUTXOs) {
              const findex = update.findIndex(tl => tl.id === tx.hash)
              update[findex] = { ...update[findex], status: 'used' }
            }
            return [...update, newTransaction];
          });
        }
      } catch (error) {
        console.error("Send onchain Fail:", error);
      }
    }
  };

  const receiveOnchain = async (index: number, hash: string): Promise<void> => {
    if (!currentMnemonic) return;
    try {

      const response1 = await checkDeposit(hash);

      const response = await getSign(hash);

      //safe receive
      if (response.amount === 0 ||
        response.status === 'unmint' ||
        response.msg === 'error') return;


      if (response1.deposit_valid) {
        const newUTXO: UTXO = {
          index,
          hash: hash,
          sign: response.signature,
          amount: response.amount,
          status: response.status,
          timestamp: new Date(),
          used: response.status === 'used',
        };

        const tt: Transaction = {
          id: hash,
          type: 'receive',
          origin: 'onchain',
          amount: response.amount,
          status: 'confirmed',
          timestamp: newUTXO.timestamp,
        };
        await addOrUpdateUTXO(newUTXO);
        await addOrUpdateTransaction(tt);
      }
    } catch (error) {
      console.error("Receive onchain Fail:", error);
    }

  };



  return (
    <WalletContext.Provider value={{
      balance,
      utxos,
      tokens,
      lastDerivationIndex,
      transactions,
      resetWallet,
      addOrUpdateTransaction,
      addOrUpdateUTXO,
      deriveNext,
      incrementIndex,
      syncBalances,
      sendOffline,
      receiveOffline,
      sendOnchain,
      receiveOnchain
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};


