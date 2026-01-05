'use client';

import { useState } from 'react';
import { ethers } from 'ethers';

const TA_ADDRESS = '0x5Ef03958c1fECA31f12B508a17e8a9F0B5e2A3cc'; // TA founder
const DELEGATE = '0x7C0cf0540B053DB33840Ccb42e24b2cD02794121'; // Ponte

const ABI = [
  'function nonces(address) view returns (uint256)',
  'function setTradingDelegateWithSig(address delegate,uint256 deadline,bytes sig)'
];

export default function DelegatePage() {
  const [status, setStatus] = useState<string>('idle');
  const [tx, setTx] = useState<string | null>(null);

  async function signAndSend() {
    try {
      setStatus('connecting');

      // Magic / injected provider
      // @ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const owner = await signer.getAddress();

      const ta = new ethers.Contract(TA_ADDRESS, ABI, provider);
      const nonce = await ta.nonces(owner);

      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const domain = {
        name: 'TradingAccountV3',
        version: '1',
        chainId: 42161,
        verifyingContract: TA_ADDRESS,
      };

      const types = {
        SetDelegate: [
          { name: 'delegate', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      };

      const value = {
        delegate: DELEGATE,
        nonce,
        deadline,
      };

      setStatus('signing');
      const sig = await signer.signTypedData(domain, types, value);

      setStatus('sending');
      const taWithSigner = ta.connect(signer);
      const txResp = await taWithSigner.setTradingDelegateWithSig(
        DELEGATE,
        deadline,
        sig
      );

      setTx(txResp.hash);
      setStatus('done');
    } catch (e: any) {
      console.error(e);
      setStatus('error: ' + (e?.message || 'unknown'));
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Set Trading Delegate (FOUNDER)</h1>
      <p>TA: {TA_ADDRESS}</p>
      <p>Delegate: {DELEGATE}</p>

      <button onClick={signAndSend} style={{ padding: 12, marginTop: 20 }}>
        Sign & Set Delegate
      </button>

      <pre style={{ marginTop: 20 }}>
        status: {status}
        {tx && `\nTX: ${tx}`}
      </pre>
    </div>
  );
}
