"use client";

import React, { useMemo, useState } from "react";
import { Magic } from "magic-sdk";
import { BrowserProvider, Contract } from "ethers";

const ARB_RPC =
  process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ||
  "https://arb-mainnet.g.alchemy.com/v2/INCOLLA_LA_TUA_KEY";

const CHAIN_ID = 42161; // Arbitrum One

// Founder TA (V3)
const TA_ADDRESS = "0x5Ef03958c1fECA31f12B508a17e8a9F0B5e2A3cc";
// Delegate = Ponte
const DELEGATE = "0x7C0cf0540B053DB33840Ccb42e24b2cD02794121";

const TA_ABI = [
  "function nonces(address) view returns (uint256)",
  "function setTradingDelegateWithSig(address delegate,uint256 deadline,bytes sig) external",
];

export default function DelegateMagicPage() {
  const [email, setEmail] = useState("info@cerberoai.com");
  const [status, setStatus] = useState<string>("");
  const [tx, setTx] = useState<string>("");

  const domain = useMemo(
    () => ({
      name: "TradingAccountV3",
      version: "1",
      chainId: CHAIN_ID,
      verifyingContract: TA_ADDRESS,
    }),
    []
  );

  const types = useMemo(
    () => ({
      SetDelegate: [
        { name: "delegate", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    }),
    []
  );

  function getMagicArbitrum() {
    const key = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
    if (!key) throw new Error("NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY mancante");
    return new Magic(key, {
      network: {
        rpcUrl: ARB_RPC,
        chainId: CHAIN_ID,
      },
    });
  }

  async function loginMagic() {
    setStatus("Login Magic in corso...");
    setTx("");
    const magic = getMagicArbitrum();
    await magic.auth.loginWithMagicLink({ email });
    setStatus("✅ Login Magic ok");
  }

  async function signAndSend() {
    try {
      setStatus("Preparazione provider Magic (Arbitrum)...");
      setTx("");

      const magic = getMagicArbitrum();
      const provider = new BrowserProvider(magic.rpcProvider as any);
      const signer = await provider.getSigner();

      const owner = await signer.getAddress();
      setStatus(`Wallet Magic connesso (owner): ${owner}`);

      const ta = new Contract(TA_ADDRESS, TA_ABI, provider);

      setStatus("Leggo nonce da TA...");
      const nonce: bigint = await ta.nonces(owner);

      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const value = {
        delegate: DELEGATE,
        nonce,
        deadline,
      };

      setStatus("Firma EIP-712 (Magic)...");
      // ethers v6: signTypedData(domain, types, value)
      const sig = await signer.signTypedData(domain as any, types as any, value as any);

      setStatus("Invio tx setTradingDelegateWithSig...");
      const taWithSigner = new Contract(TA_ADDRESS, TA_ABI, signer);
      const txResp = await taWithSigner.setTradingDelegateWithSig(DELEGATE, deadline, sig);

      setTx(txResp.hash);
      setStatus("⏳ Attendo conferma...");
      await txResp.wait();

      setStatus("✅ Delegate impostato on-chain");
    } catch (e: any) {
      console.error(e);
      setStatus("❌ error: " + (e?.message || "unknown"));
    }
  }

  return (
    <main className="min-h-screen p-6 text-white bg-black">
      <h1 className="text-2xl font-semibold mb-4">Admin: Set Trading Delegate (FOUNDER via Magic)</h1>

      <div className="space-y-3 max-w-xl">
        <div className="space-y-1">
          <label className="text-sm opacity-80">Email (Magic owner)</label>
          <input
            className="w-full rounded-lg px-3 py-2 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="text-sm opacity-80">
          TA: <span className="font-mono">{TA_ADDRESS}</span>
          <br />
          Delegate (Ponte): <span className="font-mono">{DELEGATE}</span>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-emerald-600" onClick={loginMagic}>
            1) Login Magic
          </button>
          <button className="px-4 py-2 rounded-lg bg-cyan-600" onClick={signAndSend}>
            2) Sign & Set Delegate
          </button>
        </div>

        {status ? <pre className="whitespace-pre-wrap text-sm bg-white/10 p-3 rounded-lg">{status}</pre> : null}

        {tx ? (
          <div className="text-sm">
            Tx hash: <span className="font-mono">{tx}</span>
          </div>
        ) : null}

        <p className="text-xs opacity-70">
          Nota: pagina admin temporanea. Dopo la prova la possiamo nascondere o rimuovere.
        </p>
      </div>
    </main>
  );
}
