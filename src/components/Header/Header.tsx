"use client";
import { useEffect, type FC } from "react";

import { HStack, Heading } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { useWeb3Client, useWindowSize } from "@/hooks";
import { pulse } from "@/utils/chains";

import { DarkModeButton } from "../DarkModeButton";

const Header: FC = () => {
  const { isTablet } = useWindowSize();
  const { isConnected, chain } = useAccount();
  const { switchChain } = useWeb3Client();

  useEffect(() => {
    if (isConnected) {
      if (chain?.id === pulse.id) {
        switchChain("mainnet");
      } else {
        switchChain("testnet");
      }
    }
  }, [isConnected, chain]);

  return (
    <HStack
      as="header"
      p="1.5rem"
      position="sticky"
      top={0}
      zIndex={10}
      justifyContent="space-between"
    >
      <HStack>
        {!isTablet && (
          <Heading as="h1" fontSize="1.5rem" className="text-shadow">
            MORE Staking
          </Heading>
        )}
      </HStack>

      <HStack>
        <ConnectButton />
        <DarkModeButton />
      </HStack>
    </HStack>
  );
};

export default Header;
