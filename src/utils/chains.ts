import { defineChain } from "viem";

export const pulseTestnet = defineChain({
  id: 943,
  name: "PulseChain Testnet V4",
  nativeCurrency: {
    name: "tPLS",
    symbol: "tPLS",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.v4.testnet.pulsechain.com"],
    },
    public: {
      http: ["https://rpc.v4.testnet.pulsechain.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Scan",
      url: "https://scan.v4.testnet.pulsechain.com/#",
    },
  },
});

export const pulse = defineChain({
  id: 369,
  name: "PulseChain",
  nativeCurrency: {
    name: "PLS",
    symbol: "PLS",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.pulsechain.com"],
    },
    public: {
      http: ["https://rpc.pulsechain.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Scan",
      url: "https://scan.pulsechainfoundation.org/#",
    },
  },
});
