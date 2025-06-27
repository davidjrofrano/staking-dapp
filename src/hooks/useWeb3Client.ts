import { useState } from "react";

import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type PublicClient,
  type WalletClient,
} from "viem";

import { pulse, pulseTestnet } from "@/utils/chains";

export interface UseWeb3ClientReturn {
  web3Client: PublicClient;
  walletClient: WalletClient;
  switchChain: (chain: "testnet" | "mainnet") => void;
}

export function useWeb3Client(): UseWeb3ClientReturn {
  const testnetWeb3Config = createPublicClient({
    chain: pulseTestnet,
    transport: http(),
  });

  const mainnetWeb3Config = createPublicClient({
    chain: pulse,
    transport: http(),
  });

  const testnetWalletConfig = createWalletClient({
    chain: pulseTestnet,
    transport: custom(window.ethereum),
  });

  const mainnetWalletConfig = createWalletClient({
    chain: pulse,
    transport: custom(window.ethereum),
  });

  const [web3Client, setClient] = useState<PublicClient>(testnetWeb3Config);
  const [walletClient, setWalletClient] = useState<WalletClient>(testnetWalletConfig);

  const switchChain = (chain: "testnet" | "mainnet") => {
    if (chain === "testnet") {
      setClient(testnetWeb3Config);
      setWalletClient(testnetWalletConfig);
    } else {
      setClient(mainnetWeb3Config);
      setWalletClient(mainnetWalletConfig);
    }
  };

  return { web3Client, walletClient, switchChain };
}
