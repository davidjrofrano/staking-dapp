import { useCallback, useEffect, useMemo, useState, type FC } from "react";

import { Button, VStack, Text } from "@chakra-ui/react";
import { useAccount } from "wagmi";

import { useNotify, useWeb3Client } from "@/hooks";
import { stakingAbi } from "@/utils/abis/staking.abi";
import { STAKING_CONTRACT } from "@/utils/constants";
import { ellipsis } from "@/utils/formatters";
import type { StakeInfo } from "@/utils/types";

const UnstakeForm: FC = () => {
  const { address, chain } = useAccount();
  const { walletClient, web3Client } = useWeb3Client();
  const { notifyError, notifySuccess } = useNotify();
  const [stakeIds, setStakeIds] = useState<number[]>([]);
  const [stakeId, setStakeId] = useState<number>(0);
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | undefined>(undefined);
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
        const stakeInfo = await web3Client.readContract({
          address: STAKING_CONTRACT,
          abi: stakingAbi,
          functionName: "getStakeInfo",
          args: [stakeId],
        });
        setStakeInfo(stakeInfo as StakeInfo);
        return stakeInfo as StakeInfo;
      }
    },
    [address],
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
          You should pay penalty if you unstake earlier than end time.
        </Text>
      )}
      {shouldPayLatePenalty && (
        <Text fontSize="sm" color="orange.700" textAlign="center" fontWeight="medium">
          You should pay penalty as you&apos;re too late to unstake.
        </Text>
      )}
    </VStack>
  );
};

export default UnstakeForm;
