"use client";

import React, { useMemo, useState } from "react";
import { Magic } from "magic-sdk";
import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  parseUnits,
} from "ethers";

const CHAIN_ID = 42161;

const ARB_RPC =
  process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ||
  "https://arb1.arbitrum.io/rpc";

const MAGIC_KEY = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;

const USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const USDC_DECIMALS = 6;

// TA_V1 e TA_V2 hardcoded per debug (puoi metterli in env dopo)
const TA_V1 = "0xCF7c56FED88aE69450777698daCB62c89D886Eff";
const TA_V2 = "0xA1c636c5f49d0b6A900Cd7b63c0B54ec7649F12e";
const AMOUNT_USDC = "167"; // debug

const TA_ABI = [
  "function owner() view returns (address)",
  "function nonces(address owner) view returns (uint256)",
];

export default function DebugMigrateV1ToV2() {
  const [email, setEmail] = useState("info@cerberoai.com");
  const [status, setStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const amount = useMemo(() => parseUnits(AMOUNT_USDC, USDC_DECIMALS), []);

  function getMagicArbitrum() {
    if (!MAGIC_KEY) throw new Error("NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY mancante");
    return new Magic(MAGIC_KEY, {
      network: { rpcUrl: ARB_RPC, chainId: CHAIN_ID },
    });
  }

  async function login() {
    setStatus("Login Magic in corso...");
    setTxHash("");
    const magic = getMagicArbitrum();
    await magic.auth.loginWithMagicLink({ email });
    setStatus("✅ Login ok");
  }

  async function signOnlyAndAskRelayerToMigrate() {
    setStatus("Preparazione firma EIP-712...");
    setTxHash("");

    // Signer Magic (firma)
    const magic = getMagicArbitrum();
    const browserProvider = new BrowserProvider(magic.rpcProvider as any);
    const signer = await browserProvider.getSigner();
    const ownerAddr = await signer.getAddress();

    // Letture on-chain *via RPC* (più stabile per nonce)
    const readProvider = new JsonRpcProvider(ARB_RPC);
    const ta = new Contract(TA_V1, TA_ABI, readProvider);

    const nonce: bigint = await ta.nonces(ownerAddr);
    const deadline = Math.floor(Date.now() / 1000) + 15 * 60; // 15 minuti

    // EIP-712 domain + types (come nel contract)
    const domain = {
      name: "CerberoTradingAccount",
      version: "1",
      chainId: CHAIN_ID,
      verifyingContract: TA_V1,
    } as const;

    const types = {
      Withdraw: [
        { name: "token", type: "address" },
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    } as const;

    const message = {
      token: USDC,
      to: TA_V2,
      amount: amount,
      nonce: nonce,
      deadline: BigInt(deadline),
    };

    // Firma typed data (MAGIC firma, zero gas)
    const sig = await signer.signTypedData(domain as any, types as any, message as any);

    setStatus("✅ Firma ok. Invio al relayer (backend)...");
    const resp = await fetch("/api/debug/migrate-v1-to-v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner: ownerAddr,
        token: USDC,
        to: TA_V2,
        amount: amount.toString(),
        deadline,
        sig,
      }),
    });

    const json = await resp.json();
    if (!resp.ok || !json?.ok) {
      throw new Error(json?.error || "Errore backend/relayer");
    }

    setTxHash(json.txHash);
    setStatus("✅ Migrazione inviata dal relayer. Controlla saldo su TA_V2.");
  }

  return (
    <main className="min-h-screen p-6 text-white bg-black">
      <h1 className="text-2xl font-semibold mb-4">
        Debug: Migrazione USDC TA_V1 → TA_V2 (EIP-712) — FIRMA ONLY
      </h1>

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
          <div>TA_V1: <span className="font-mono">{TA_V1}</span></div>
          <div>TA_V2: <span className="font-mono">{TA_V2}</span></div>
          <div>USDC: <span className="font-mono">{USDC}</span></div>
          <div>Importo: <span className="font-mono">{AMOUNT_USDC} USDC</span></div>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-emerald-600" onClick={login}>
            1) Login Magic
          </button>
          <button className="px-4 py-2 rounded-lg bg-cyan-600" onClick={signOnlyAndAskRelayerToMigrate}>
            2) Firma (EIP-712) → Relayer invia tx
          </button>
        </div>

        {status ? (
          <pre className="whitespace-pre-wrap text-sm bg-white/10 p-3 rounded-lg">
            {status}
          </pre>
        ) : null}

        {txHash ? (
          <div className="text-sm">
            Tx hash: <span className="font-mono">{txHash}</span>
          </div>
        ) : null}

        <p className="text-xs opacity-70">
          Nota: questa pagina è SOLO debug. In produzione la firma resta uguale, ma l’invio tx lo fa sempre relayer/coordinator.
        </p>
      </div>
    </main>
  );
}
