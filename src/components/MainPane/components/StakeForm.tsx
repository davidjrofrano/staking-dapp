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

  const years = [3, 6, 9, 12];
  const days = [1, 1000, 2000, 3000, 4000, 5000, 5555];

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
              {years.map((year) => (
                <Text
                  key={year}
                  cursor="pointer"
                  fontSize="sm"
                  fontWeight={stakeDuration === year * 365 ? "bold" : "normal"}
                  color={stakeDuration === year * 365 ? "blue.500" : "gray.500"}
                  onClick={() => setStakeDuration(year * 365)}
                  position="absolute"
                  left={`${((year * 365 - 1) / (5555 - 1)) * 100}%`}
                  transform="translateX(-50%)"
                >
                  {year}y
                </Text>
              ))}
            </Flex>
            <input
              type="range"
              min={1}
              max={5555}
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
          <Box position="relative" width="100%" mb={5}>
            <Flex justify="space-between" width="100%" fontSize="xs" color="gray.500">
              {days.map((day) => (
                <Text
                  key={day}
                  cursor="pointer"
                  fontSize="sm"
                  fontWeight={stakeDuration === day ? "bold" : "normal"}
                  color={stakeDuration === day ? "blue.500" : "gray.500"}
                  onClick={() => setStakeDuration(day)}
                  position="absolute"
                  left={`${((day - 1) / (5555 - 1)) * 100}%`}
                  transform="translateX(-50%)"
                >
                  {day === 5555 ? "MAX" : `${day}d`}
                </Text>
              ))}
            </Flex>
          </Box>
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
