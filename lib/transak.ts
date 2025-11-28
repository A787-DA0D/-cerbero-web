// lib/transak.ts

const TRANSAK_ENV = process.env.NEXT_PUBLIC_TRANSAK_ENV ?? "STAGING";
const TRANSAK_API_KEY = process.env.NEXT_PUBLIC_TRANSAK_API_KEY ?? "";
const TRANSAK_WIDGET_URL =
  process.env.NEXT_PUBLIC_TRANSAK_WIDGET_URL ?? "https://staging-global.transak.com";

type BuildTransakUrlParams = {
  email: string;
  walletAddress: string;
};

export function buildTransakUrl({ email, walletAddress }: BuildTransakUrlParams) {
  const url = new URL(TRANSAK_WIDGET_URL);

  url.searchParams.set("apiKey", TRANSAK_API_KEY);
  url.searchParams.set("environment", TRANSAK_ENV);
  url.searchParams.set("email", email);
  url.searchParams.set("walletAddress", walletAddress);

  // Default per Cerbero
  url.searchParams.set("fiatCurrency", "EUR");
  url.searchParams.set("cryptoCurrencyCode", "USDC");
  url.searchParams.set("network", "arbitrum"); // adatta se Transak usa altro nome
  url.searchParams.set("disableWalletAddressForm", "true");
  url.searchParams.set("hideMenu", "true");

  return url.toString();
}
