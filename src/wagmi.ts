import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import type { Transport } from "viem";
import { createConfig, http } from "wagmi";

import { pulseTestnet } from "./utils/chains";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error(
    "WalletConnect project ID is not defined. Please check your environment variables.",
  );
}

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, rabbyWallet, coinbaseWallet],
    },
  ],
  { appName: "MORE Staking", projectId: walletConnectProjectId },
);

const transports: Record<number, Transport> = {
  [pulseTestnet.id]: http(),
};

export const wagmiConfig = createConfig({
  chains: [pulseTestnet],
  connectors,
  transports,
  ssr: true,
});
