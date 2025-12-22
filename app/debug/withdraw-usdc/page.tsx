export const dynamic = "force-dynamic";
export const revalidate = 0;

"use client";

import React, { useMemo, useState } from "react";
import { Magic } from "magic-sdk";
import { ethers } from "ethers";

const CHAIN_ID = 42161; // Arbitrum One

const DEFAULT_RPC =
  process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ||
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://rpc.ankr.com/arbitrum";

// >>> METTI QUI I TUOI VALORI (li hai già)
const TA = "0xA1c636c5f49d0b6A900Cd7b63c0B54ec7649F12e";
const USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const RELAYER_TO = "0x476aF763dD273D20b587B15176269D5672B17ac0";

// 67 USDC (6 decimali)
const AMOUNT = "67000000";

export default function WithdrawUSDCPage() {
  const [status, setStatus] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [nonce, setNonce] = useState<string>("");
  const [deadline, setDeadline] = useState<number>(0);
  const [sig, setSig] = useState<string>("");

  const magic = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
    if (!key) {
      // render utile con errore chiaro
      return null;
    }
    return new Magic(key, { network: { rpcUrl: DEFAULT_RPC, chainId: CHAIN_ID } });
  }, []);

  async function loginMagic() {
    if (!magic) {
      setStatus("Missing NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY");
      return;
    }
    setStatus("Logging in with Magic...");
    await magic.auth.loginWithMagicLink({ email: "info@cerberoai.com" });
    setStatus("Magic login OK");
  }

  async function generateSig() {
    if (!magic) {
      setStatus("Missing NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY");
      return;
    }
    setStatus("Preparing signer...");

    // ethers v5
    const provider = new ethers.BrowserProvider(magic.rpcProvider as any);
    const signer = await provider.getSigner();

    const ownerAddr = await signer.getAddress();
    setOwner(ownerAddr);

    // read nonce from TA
    const taAbi = [
      "function nonces(address) view returns (uint256)",
      "function owner() view returns (address)",
    ];
    const ta = new ethers.Contract(TA, taAbi, provider);

    const onchainOwner = await ta.owner();
    if (onchainOwner.toLowerCase() !== ownerAddr.toLowerCase()) {
      setStatus(
        `OWNER mismatch: signer=${ownerAddr} but TA.owner=${onchainOwner}. Devi essere loggato con l'email del TA.`
      );
      return;
    }

    const n = await ta.nonces(ownerAddr);
    setNonce(n.toString());

    const dl = Math.floor(Date.now() / 1000) + 3600; // 1 ora
    setDeadline(dl);

    // EIP-712
    const domain = {
      name: "CerberoTradingAccount",
      version: "1",
      chainId: CHAIN_ID,
      verifyingContract: TA,
    };

    const types = {
      Withdraw: [
        { name: "token", type: "address" },
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const value = {
      token: USDC,
      to: RELAYER_TO,
      amount: AMOUNT,
      nonce: n.toString(),
      deadline: dl,
    };

    setStatus("Signing typed data (Magic popup)...");
    const signature = await (signer as any)._signTypedData(domain, types, value);

    setSig(signature);
    setStatus("Signature OK. Copia SIG e vai a STEP 2 (cast send).");
  }

  const castCmd = sig
    ? `RPC="$(gcloud secrets versions access latest --secret=ALCHEMY_HTTP_ARBITRUM)"
RELAYER_PK="$(gcloud secrets versions access latest --secret=relayer-private-key)"
TA="${TA}"
USDC="${USDC}"
TO="${RELAYER_TO}"
AMOUNT="${AMOUNT}"
DEADLINE="${deadline}"
SIG="${sig}"

cast send "$TA" "withdrawWithSig(address,address,uint256,uint256,bytes)" "$USDC" "$TO" "$AMOUNT" "$DEADLINE" "$SIG" --rpc-url "$RPC" --private-key "$RELAYER_PK"`
    : "";

  return (
    <div style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Debug: Withdraw 67 USDC (TA V2 → Relayer)</h1>
      <p style={{ opacity: 0.8 }}>
        TA: <code>{TA}</code><br />
        USDC: <code>{USDC}</code><br />
        To (relayer): <code>{RELAYER_TO}</code><br />
        RPC: <code>{DEFAULT_RPC}</code>
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={loginMagic} style={btn}>1) Login Magic</button>
        <button onClick={generateSig} style={btn}>2) Generate signature</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <div><b>Status:</b> {status}</div>
        {owner && <div><b>OWNER:</b> <code>{owner}</code></div>}
        {nonce && <div><b>NONCE:</b> <code>{nonce}</code></div>}
        {!!deadline && <div><b>DEADLINE:</b> <code>{deadline}</code></div>}
        {sig && (
          <>
            <div style={{ marginTop: 10 }}><b>SIGNATURE:</b></div>
            <textarea readOnly value={sig} style={taStyle} />
            <div style={{ marginTop: 10 }}><b>CAST COMMAND (CloudShell):</b></div>
            <textarea readOnly value={castCmd} style={taStyle} />
          </>
        )}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  cursor: "pointer",
};

const taStyle: React.CSSProperties = {
  width: "100%",
  height: 140,
  padding: 12,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.45)",
  color: "white",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};
