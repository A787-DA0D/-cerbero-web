export const USDC_ABI = [
  "function balanceOf(address)(uint256)",
  "function transfer(address,uint256)(bool)",
  "function allowance(address,address)(uint256)",
  "function decimals()(uint8)",
  "function symbol()(string)",
] as const;
