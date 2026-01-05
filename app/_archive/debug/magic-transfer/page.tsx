"use client";

import React, { useMemo, useState } from "react";
import { Magic } from "magic-sdk";
import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";

const ARB_RPC =
  process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ||
  "https://arb-mainnet.g.alchemy.com/v2/INCOLLA_LA_TUA_KEY";

const CHAIN_ID = 42161; // Arbitrum One
const USDC_NATIVE = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // USDC native Arbitrum One
const USDC_DECIMALS = 6;

const USDC_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

export default function MagicTransferDebugPage() {
  const [email, setEmail] = useState("info@cerberoai.com");
  const [status, setStatus] = useState<string>("");
  const [tx, setTx] = useState<string>("");

  // ✅ METTI QUI IL TUO SMART CONTRACT (wallet trading)
  const TRADING_ADDRESS = useMemo(
    () => "0x3581769c52e263FE9644463A6bf8b5725b65594B",
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

  async function login() {
    setStatus("Login Magic in corso...");
    setTx("");
    const magic = getMagicArbitrum();
    await magic.auth.loginWithMagicLink({ email });
    setStatus("✅ Login ok");
  }

  async function transfer57() {
    setStatus("Preparazione provider Magic (Arbitrum)...");
    setTx("");

    const magic = getMagicArbitrum();
    const provider = new BrowserProvider(magic.rpcProvider as any);
    const signer = await provider.getSigner();

    const from = await signer.getAddress();
    setStatus(`Wallet Magic connesso: ${from}`);

    const usdc = new Contract(USDC_NATIVE, USDC_ABI, signer);

    const balRaw: bigint = await usdc.balanceOf(from);
    const bal = Number(formatUnits(balRaw, USDC_DECIMALS));
    setStatus(`Saldo USDC su wallet Magic: ${bal} USDC`);

    if (bal < 57) {
      throw new Error(`Saldo insufficiente: ${bal} < 57`);
    }

    setStatus("Invio transfer(TradingAddress, 57 USDC)...");
    const amount = parseUnits("57", USDC_DECIMALS);

    const txResp = await usdc.transfer(TRADING_ADDRESS, amount);
    setTx(txResp.hash);

    setStatus("⏳ Attendo conferma...");
    await txResp.wait();

    setStatus("✅ Transfer completato. Ora ricarica dashboard / tenant summary.");
  }

  return (
    <main className="min-h-screen p-6 text-white bg-black">
      <h1 className="text-2xl font-semibold mb-4">Debug: Magic → Trading (Arbitrum)</h1>

      <div className="space-y-3 max-w-xl">
        <div className="space-y-1">
          <label className="text-sm opacity-80">Email</label>
          <input
            className="w-full rounded-lg px-3 py-2 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="text-sm opacity-80">
          Trading address: <span className="font-mono">{TRADING_ADDRESS}</span>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-emerald-600" onClick={login}>
            1) Login Magic
          </button>
          <button className="px-4 py-2 rounded-lg bg-cyan-600" onClick={transfer57}>
            2) Transfer 57 USDC
          </button>
        </div>

        {status ? <pre className="whitespace-pre-wrap text-sm bg-white/10 p-3 rounded-lg">{status}</pre> : null}

        {tx ? (
          <div className="text-sm">
            Tx hash: <span className="font-mono">{tx}</span>
          </div>
        ) : null}

        <p className="text-xs opacity-70">
          Nota: questa pagina è SOLO debug. Dopo la prova la cancelliamo.
        </p>
      </div>
    </main>
  );
}
