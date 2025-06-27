import { useEffect, useState, type FC } from "react";

import { Button, Input, Text, VStack, Flex, Box } from "@chakra-ui/react";
import { erc20Abi, parseUnits } from "viem";
import { useAccount } from "wagmi";

import { useNotify, useTimer, useTokenInfo, useWeb3Client } from "@/hooks";
import { stakingAbi } from "@/utils/abis/staking.abi";
import { STAKING_CONTRACT, STAKING_TOKEN } from "@/utils/constants";
import { ellipsis } from "@/utils/formatters";

const StakeForm: FC = () => {
  const { address, chain } = useAccount();
  const { walletClient, web3Client } = useWeb3Client();
  const { decimals, balance, allowance, fetchTokenInfo } = useTokenInfo(
    web3Client,
    address,
    STAKING_TOKEN,
    STAKING_CONTRACT,
  );
  const { timer } = useTimer();
  const { notifyError, notifySuccess } = useNotify();

  const [amount, setAmount] = useState<string>("");
  const [stakeDuration, setStakeDuration] = useState<number>(30); // Default to 30 days
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (address) {
      fetchTokenInfo();
    }
  }, [address, timer]);

  const handleStake = async () => {
    if (!amount || !address || !chain) return;

    await fetchTokenInfo();

    const isRoundInProgress = await web3Client.readContract({
      address: STAKING_CONTRACT,
      abi: stakingAbi,
      functionName: "isRoundInProgress",
    });

    if (!isRoundInProgress) {
      return notifyError({
        title: "Alert:",
        message: "No round in progress. Please try again later.",
      });
    }

    setIsLoading(true);

    try {
      if (parseUnits(amount, decimals) > parseUnits(allowance, decimals)) {
        await walletClient.writeContract({
          chain,
          account: address,
          address: STAKING_TOKEN,
          abi: erc20Abi,
          functionName: "approve",
          args: [STAKING_CONTRACT, parseUnits(amount, decimals)],
        });
      }

      const hash = await walletClient.writeContract({
        chain,
        account: address,
        address: STAKING_CONTRACT,
        abi: stakingAbi,
        functionName: "stake",
        args: [parseUnits(amount, decimals), stakeDuration * 86400],
      });

      const receipt = await web3Client.waitForTransactionReceipt({ hash });
      if (receipt.status === "success") {
        notifySuccess({
          title: "Success:",
          message: "Staking successfully done. " + ellipsis(hash),
          action: {
            label: `View on ${chain.name}`,
            onClick: () => {
              window.open(`${chain.blockExplorers?.default?.url}/tx/${hash}`, "_blank");
            },
          },
        });
      } else {
        notifyError({
          title: "Error:",
          message: "Staking failed. " + ellipsis(hash),
        });
      }
    } catch (error) {
      console.error("Error staking:", error);
    } finally {
      setIsLoading(false);
      await fetchTokenInfo();
    }
  };

  const handleMaxClick = () => {
    setAmount(balance);
  };

  const handleClearClick = () => {
    setAmount("");
  };

  return (
    <VStack gap={4} align="stretch">
      <Text fontSize="sm" color="gray.500" textAlign="right">
        Token Balance: {balance}
      </Text>

      <Flex gap={2} mb={4}>
        <Input
          placeholder="Enter amount to stake"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          px={4}
          py={3}
          flex="2"
          textAlign="center"
        />
        <Button size="md" variant="outline" onClick={handleClearClick} flex="1">
          Clear
        </Button>
        <Button size="md" variant="outline" onClick={handleMaxClick} flex="1">
          Max
        </Button>
      </Flex>

      <Box pt={6} pb={2}>
        <Text fontSize="sm" color="gray.500" mb={2} textAlign="right">
          Stake Duration: <span style={{ fontWeight: "bold" }}>{stakeDuration}</span> day
          {stakeDuration > 1 ? "s" : ""}
        </Text>
        <VStack gap={2}>
          <Box position="relative" width="100%">
            <Flex justify="space-between" width="100%" fontSize="xs" color="gray.500" mb={5}>
              <Text
                cursor="pointer"
                fontSize="sm"
                fontWeight={stakeDuration === 365 ? "bold" : "normal"}
                color={stakeDuration === 365 ? "blue.500" : "gray.500"}
                onClick={() => setStakeDuration(365)}
                position="absolute"
                left="36.5%"
                transform="translateX(-50%)"
              >
                1y
              </Text>
              <Text
                cursor="pointer"
                fontSize="sm"
                fontWeight={stakeDuration === 730 ? "bold" : "normal"}
                color={stakeDuration === 730 ? "blue.500" : "gray.500"}
                onClick={() => setStakeDuration(730)}
                position="absolute"
                left="73%"
                transform="translateX(-50%)"
              >
                2y
              </Text>
            </Flex>
            <input
              type="range"
              min={1}
              max={1000}
              value={stakeDuration}
              onChange={(e) => setStakeDuration(Number(e.target.value))}
              style={{
                width: "100%",
                height: "8px",
                borderRadius: "4px",
                background: "var(--chakra-colors-gray-200)",
                outline: "none",
              }}
            />
          </Box>
          <Flex justify="space-between" width="100%" fontSize="xs" color="gray.500">
            <Text
              cursor="pointer"
              fontSize="sm"
              fontWeight={stakeDuration === 1 ? "bold" : "normal"}
              color={stakeDuration === 1 ? "blue.500" : "gray.500"}
              onClick={() => setStakeDuration(1)}
            >
              1d
            </Text>
            <Text
              cursor="pointer"
              fontSize="sm"
              fontWeight={stakeDuration === 250 ? "bold" : "normal"}
              color={stakeDuration === 250 ? "blue.500" : "gray.500"}
              onClick={() => setStakeDuration(250)}
            >
              250d
            </Text>
            <Text
              cursor="pointer"
              fontSize="sm"
              fontWeight={stakeDuration === 500 ? "bold" : "normal"}
              color={stakeDuration === 500 ? "blue.500" : "gray.500"}
              onClick={() => setStakeDuration(500)}
            >
              500d
            </Text>
            <Text
              cursor="pointer"
              fontSize="sm"
              fontWeight={stakeDuration === 750 ? "bold" : "normal"}
              color={stakeDuration === 750 ? "blue.500" : "gray.500"}
              onClick={() => setStakeDuration(750)}
            >
              750d
            </Text>
            <Text
              cursor="pointer"
              fontSize="sm"
              fontWeight={stakeDuration === 1000 ? "bold" : "normal"}
              color={stakeDuration === 1000 ? "blue.500" : "gray.500"}
              onClick={() => setStakeDuration(1000)}
            >
              1000d
            </Text>
          </Flex>
        </VStack>
      </Box>

      <Button
        colorScheme="blue"
        onClick={handleStake}
        loading={isLoading}
        disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(balance)}
        width="100%"
        alignSelf="center"
      >
        Stake
      </Button>
    </VStack>
  );
};

export default StakeForm;
