"use client";

import React, { useMemo, useState } from "react";
import { Magic } from "magic-sdk";
import { BrowserProvider, Contract } from "ethers";

const ARB_RPC =
  process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ||
  "https://arb1.arbitrum.io/rpc";

const CHAIN_ID = 42161;

// === Cerbero on-chain constants (prod) ===
const TRADING_ACCOUNT_V2 = "0xA1c636c5f49d0b6A900Cd7b63c0B54ec7649F12e";
const NEW_PONTE_V2 = "0x7C0cf0540B053DB33840Ccb42e24b2cD02794121";

const TRADING_ACCOUNT_ABI = [
  "function owner() view returns (address)",
  "function executor() view returns (address)",
  "function setExecutor(address _executor)",
  "function setTradingDelegate(address delegate)",
];

export default function DefiSetupPage() {
  const [email, setEmail] = useState("info@cerberoai.com");
  const [status, setStatus] = useState<string>("");
  const [tx1, setTx1] = useState<string>("");
  const [tx2, setTx2] = useState<string>("");

  const target = useMemo(() => TRADING_ACCOUNT_V2, []);
  const newPonte = useMemo(() => NEW_PONTE_V2, []);

  function getMagicArbitrum() {
    const key = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
    if (!key) throw new Error("NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY mancante");
    return new Magic(key, {
      network: { rpcUrl: ARB_RPC, chainId: CHAIN_ID },
    });
  }

  async function login() {
    setStatus("Login Magic in corso...");
    setTx1("");
    setTx2("");
    const magic = getMagicArbitrum();
    await magic.auth.loginWithMagicLink({ email });
    setStatus("✅ Login ok");
  }

  async function runSetup() {
    setStatus("Preparazione provider Magic (Arbitrum)...");
    setTx1("");
    setTx2("");

    const magic = getMagicArbitrum();
    const provider = new BrowserProvider(magic.rpcProvider as any);
    const signer = await provider.getSigner();

    const signerAddr = await signer.getAddress();
    setStatus(`Wallet Magic connesso: ${signerAddr}\nConnessione al TradingAccount V2...`);

    const ta = new Contract(target, TRADING_ACCOUNT_ABI, signer);

    const onchainOwner = (await ta.owner()) as string;
    const onchainExecutor = (await ta.executor()) as string;

    setStatus(
      `TradingAccount V2: ${target}\n` +
        `Owner on-chain: ${onchainOwner}\n` +
        `Executor on-chain: ${onchainExecutor}\n` +
        `New Ponte: ${newPonte}\n\n` +
        `Invio setExecutor(newPonte)...`
    );

    const r1 = await ta.setExecutor(newPonte);
    setTx1(r1.hash);
    setStatus((prev) => prev + `\n⏳ Attendo conferma setExecutor...\nTx1: ${r1.hash}`);
    await r1.wait();

    setStatus((prev) => prev + `\n✅ setExecutor confermato.\nInvio setTradingDelegate(newPonte)...`);

    const r2 = await ta.setTradingDelegate(newPonte);
    setTx2(r2.hash);
    setStatus((prev) => prev + `\n⏳ Attendo conferma setTradingDelegate...\nTx2: ${r2.hash}`);
    await r2.wait();

    const execAfter = (await ta.executor()) as string;

    setStatus(
      `✅ Setup completato!\n\n` +
        `Executor ora: ${execAfter}\n` +
        `Ora vai su Cloud Shell per fare approveToken(USDC -> NewPonte) via executor.\n`
    );
  }

  return (
    <main className="min-h-screen p-6 text-white bg-black">
      <h1 className="text-2xl font-semibold mb-4">Debug: DeFi Setup TradingAccount V2</h1>

      <div className="space-y-3 max-w-2xl">
        <div className="space-y-1">
          <label className="text-sm opacity-80">Email</label>
          <input
            className="w-full rounded-lg px-3 py-2 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="text-sm opacity-80 space-y-1">
          <div>
            TradingAccount V2: <span className="font-mono">{target}</span>
          </div>
          <div>
            New Ponte V2: <span className="font-mono">{newPonte}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-emerald-600" onClick={login}>
            1) Login Magic
          </button>
          <button className="px-4 py-2 rounded-lg bg-cyan-600" onClick={runSetup}>
            2) Set executor + delegate
          </button>
        </div>

        {status ? <pre className="whitespace-pre-wrap text-sm bg-white/10 p-3 rounded-lg">{status}</pre> : null}

        {tx1 ? <div className="text-sm">Tx1: <span className="font-mono">{tx1}</span></div> : null}
        {tx2 ? <div className="text-sm">Tx2: <span className="font-mono">{tx2}</span></div> : null}

        <p className="text-xs opacity-70">
          Questa pagina è temporanea (ops). Dopo go-live la togliamo o la proteggiamo.
        </p>
      </div>
    </main>
  );
}
