"use client";

import React, { useMemo, useState } from "react";
import { Magic } from "magic-sdk";
import { ethers } from "ethers";

const TA = "0xA1c636c5f49d0b6A900Cd7b63c0B54ec7649F12e";
const USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const TO = "0x476aF763dD273D20b587B15176269D5672B17ac0";
const RPC = "https://arb1.arbitrum.io/rpc";

const AMOUNT_USDC = "67.0";

export default function WithdrawUsdcClient() {
  const [status, setStatus] = useState<string>("");

  const magic = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY as string;
    if (!key) return null;
    return new Magic(key, { network: { rpcUrl: RPC, chainId: 42161 } });
  }, []);

  async function login() {
    try {
      setStatus("Logging in Magic...");
      if (!magic) throw new Error("MAGIC key missing");
      await magic.auth.loginWithMagicLink({ email: "info@cerberoai.com" });
      setStatus("Magic login OK");
    } catch (e: any) {
      setStatus(`Login error: ${e?.message || e}`);
      console.error(e);
    }
  }

  async function generateSig() {
    try {
      if (!magic) throw new Error("MAGIC key missing");
      setStatus("Preparing signer...");

      const provider = new ethers.BrowserProvider(magic.rpcProvider as any);
      const signer = await provider.getSigner();
      const owner = await signer.getAddress();

      setStatus(`OWNER: ${owner}`);

      // NOTE: qui dentro metteremo la logica firma EIP-712 WithdrawWithSig
      // Per ora: solo check chainId per assicurarsi che RPC sia OK
      const net = await provider.getNetwork();
      setStatus(`RPC OK. chainId=${net.chainId.toString()} OWNER=${owner}`);
    } catch (e: any) {
      setStatus(`Generate error: ${e?.message || e}`);
      console.error(e);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>Debug: Withdraw 67 USDC (TA V2 → Relayer)</div>
      <div>TA: {TA}</div>
      <div>USDC: {USDC}</div>
      <div>To (relayer): {TO}</div>
      <div>RPC: {RPC}</div>
      <div>Amount: {AMOUNT_USDC} USDC</div>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button onClick={login}>1) Login Magic</button>
        <button onClick={generateSig}>2) Generate signature</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <div><b>Status:</b></div>
        <div style={{ whiteSpace: "pre-wrap" }}>{status}</div>
      </div>
    </div>
  );
}
