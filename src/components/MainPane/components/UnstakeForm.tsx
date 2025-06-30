import { useCallback, useEffect, useMemo, useState, type FC } from "react";

import { Button, VStack, Text, Box, HStack } from "@chakra-ui/react";
import moment from "moment";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

import { useNotify, useTokenInfo, useWeb3Client } from "@/hooks";
import { stakingAbi } from "@/utils/abis/staking.abi";
import { STAKING_CONTRACT, STAKING_TOKEN } from "@/utils/constants";
import { ellipsis } from "@/utils/formatters";
import type { StakeInfo } from "@/utils/types";

const UnstakeForm: FC = () => {
  const { address, chain } = useAccount();
  const { walletClient, web3Client } = useWeb3Client();
  const { notifyError, notifySuccess } = useNotify();
  const { decimals } = useTokenInfo(web3Client, address, STAKING_TOKEN, STAKING_CONTRACT);

  const [stakeIds, setStakeIds] = useState<number[]>([]);
  const [stakeId, setStakeId] = useState<number>(0);
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | undefined>(undefined);
  const [pendingReward, setPendingReward] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStakeInfo = useCallback(
    async (stakeId?: number): Promise<StakeInfo | undefined> => {
      if (!address) return;

      const ids = await web3Client.readContract({
        address: STAKING_CONTRACT,
        abi: stakingAbi,
        functionName: "getStakeIds",
        args: [address],
      });
      setStakeIds(ids as number[]);

      if (stakeId) {
        const [stakeInfo, earned] = await Promise.all([
          web3Client.readContract({
            address: STAKING_CONTRACT,
            abi: stakingAbi,
            functionName: "getStakeInfo",
            args: [stakeId],
          }),
          web3Client.readContract({
            address: STAKING_CONTRACT,
            abi: stakingAbi,
            functionName: "earned",
            args: [stakeId],
          }),
        ]);

        setStakeInfo(stakeInfo as StakeInfo);
        setPendingReward(earned as bigint);
        return stakeInfo as StakeInfo;
      } else {
        setStakeInfo(undefined);
        setPendingReward(0n);
      }
    },
    [address, web3Client],
  );

  useEffect(() => {
    fetchStakeInfo(stakeId);
  }, [address, stakeId, fetchStakeInfo]);

  const handleUnstake = async () => {
    if (!stakeId || !address || !chain) return;

    await fetchStakeInfo(stakeId);

    setIsLoading(true);
    try {
      const hash = await walletClient.writeContract({
        account: address,
        chain,
        address: STAKING_CONTRACT,
        abi: stakingAbi,
        functionName: "unstake",
        args: [stakeId],
      });

      const receipt = await web3Client.waitForTransactionReceipt({ hash });
      if (receipt.status === "success") {
        notifySuccess({
          title: "Success:",
          message: "Unstaking successfully done. " + ellipsis(hash),
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
          message: "Unstaking failed. " + ellipsis(hash),
        });
      }
    } catch (error) {
      console.error("Error unstaking:", error);
    } finally {
      setIsLoading(false);
      setStakeId(0);
      await fetchStakeInfo();
    }
  };

  const shouldPayEarlyPenalty = useMemo(() => {
    if (!stakeInfo) return false;
    return parseInt(stakeInfo.endTime.toString()) >= Math.floor(Date.now() / 1000);
  }, [stakeInfo]);

  const shouldPayLatePenalty = useMemo(() => {
    if (!stakeInfo) return false;
    return parseInt(stakeInfo.endTime.toString()) + 14 * 86400 <= Math.floor(Date.now() / 1000);
  }, [stakeInfo]);

  const deltaPeriod = useMemo(() => {
    let period = 0;
    if (stakeInfo) {
      if (shouldPayEarlyPenalty)
        period = parseInt(stakeInfo.endTime.toString()) - Math.floor(Date.now() / 1000);
      if (shouldPayLatePenalty)
        period =
          Math.floor(Date.now() / 1000) - parseInt(stakeInfo.endTime.toString()) - 14 * 86400;
    }
    return moment.duration(period, "s").humanize();
  }, [stakeInfo, shouldPayEarlyPenalty, shouldPayLatePenalty]);

  const formatAmount = (amount: bigint) => {
    const amountStr = formatUnits(amount, decimals);
    const prefix = +Number(amountStr).toFixed(4) !== +amountStr ? "~" : "";
    return prefix + Number(amountStr).toFixed(4);
  };

  return (
    <VStack gap={4} align="stretch">
      <select
        value={stakeId}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStakeId(Number(e.target.value))}
        disabled={stakeIds.length === 0}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid var(--chakra-colors-gray-200)",
          backgroundColor: "var(--chakra-colors-white)",
          fontSize: "14px",
        }}
      >
        <option value="">Select stake ID to unstake</option>
        {stakeIds.map((id) => (
          <option key={id} value={id}>
            Stake ID: {id}
          </option>
        ))}
      </select>

      {stakeInfo && (
        <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="8px" bg="gray.50">
          <Text fontSize="lg" fontWeight="bold" mb={3} textAlign="center">
            Stake Statistics
          </Text>
          <VStack gap={2} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">
                Staked Amount:
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {formatAmount(stakeInfo.amount)} MORE
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">
                Pending Reward:
              </Text>
              <Text fontSize="sm" fontWeight="medium" color="green.600">
                {formatAmount(pendingReward)} MORE
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">
                Stake Duration:
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {Math.round(parseInt(stakeInfo.duration.toString()) / 86400)} days
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">
                {shouldPayEarlyPenalty ? "Remaining" : "Elapsed"} Time:
              </Text>
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={shouldPayEarlyPenalty || shouldPayLatePenalty ? "orange.500" : "green.600"}
              >
                {deltaPeriod}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">
                End Date:
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {moment.unix(parseInt(stakeInfo.endTime.toString())).format("MMM DD, YYYY HH:mm")}
              </Text>
            </HStack>
          </VStack>
        </Box>
      )}

      <Button
        colorScheme="red"
        onClick={handleUnstake}
        loading={isLoading}
        disabled={!stakeId}
        width="100%"
        alignSelf="center"
      >
        Unstake
      </Button>
      {shouldPayEarlyPenalty && (
        <Text fontSize="sm" color="orange.500" textAlign="center" fontWeight="medium">
          You should pay penalty if you unstake earlier than end time.{" "}
        </Text>
      )}
      {shouldPayLatePenalty && (
        <Text fontSize="sm" color="orange.700" textAlign="center" fontWeight="medium">
          You should pay penalty as you&apos;re too late to unstake.{" "}
        </Text>
      )}
    </VStack>
  );
};

export default UnstakeForm;
