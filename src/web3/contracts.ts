import { isAddress, type Address } from "viem";

export const vaultAbi = [
  {
    type: "function",
    name: "createDrop",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "unlockTime", type: "uint64" },
      { name: "memo", type: "string" },
    ],
    outputs: [{ name: "dropId", type: "uint256" }],
  },
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [{ name: "dropId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getDrop",
    stateMutability: "view",
    inputs: [{ name: "dropId", type: "uint256" }],
    outputs: [
      {
        name: "drop",
        type: "tuple",
        components: [
          { name: "sender", type: "address" },
          { name: "recipient", type: "address" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "unlockTime", type: "uint64" },
          { name: "claimed", type: "bool" },
          { name: "memo", type: "string" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "recipientDropIds",
    stateMutability: "view",
    inputs: [{ name: "recipient", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "event",
    name: "DropCreated",
    inputs: [
      { indexed: true, name: "dropId", type: "uint256" },
      { indexed: true, name: "sender", type: "address" },
      { indexed: true, name: "recipient", type: "address" },
      { indexed: false, name: "token", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "unlockTime", type: "uint64" },
      { indexed: false, name: "memo", type: "string" },
    ],
  },
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const configuredAddress = (value?: string): Address | undefined =>
  value && isAddress(value) ? value : undefined;

export const vaultAddress =
  configuredAddress(import.meta.env.VITE_STOCKDROP_VAULT_ADDRESS) ??
  "0xD55e75dfe22C28Cb8454bFcDE2Db84d0e18eB561";
export const stockTokens = [
  {
    symbol: "NVDA",
    name: "Nvidia test stock",
    price: "Testnet",
    change: "Mock asset",
    color: "#76b900",
    address:
      configuredAddress(import.meta.env.VITE_NVDA_TOKEN_ADDRESS) ??
      "0x9F52e11E94925410fC182F23cbfd628A5a172365",
  },
  {
    symbol: "TSLA",
    name: "Tesla test stock",
    price: "Testnet",
    change: "Mock asset",
    color: "#e82127",
    address:
      configuredAddress(import.meta.env.VITE_TSLA_TOKEN_ADDRESS) ??
      "0xB876DC3614dB6676D60e6Df2983FeC1A1971942A",
  },
  {
    symbol: "AAPL",
    name: "Apple test stock",
    price: "Testnet",
    change: "Mock asset",
    color: "#171816",
    address:
      configuredAddress(import.meta.env.VITE_AAPL_TOKEN_ADDRESS) ??
      "0xF4ef19a9d1bB18229C6012Cb7e45B3a84582384f",
  },
] as const;
