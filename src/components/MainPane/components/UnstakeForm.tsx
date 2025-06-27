import { useCallback, useEffect, useState, type FC } from "react";

import { Button, Input, Text, VStack, Flex } from "@chakra-ui/react";
import { useAccount } from "wagmi";

const UnstakeForm: FC = () => {
  const { address } = useAccount();
  const [stakedBalance, setStakedBalance] = useState<string>("0");
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address) {
      fetchStakedBalance();
    }
  }, [address]);

  const fetchStakedBalance = useCallback(async () => {
    if (!address) return;

    try {
      // TODO: Implement fetching staked balance from staking contract
      // This would typically call a function like balanceOf(address) on the staking contract
      setStakedBalance("0");
    } catch (error) {
      console.error("Error fetching staked balance:", error);
    }
  }, [address]);

  const handleUnstake = async () => {
    if (!amount || !address) return;

    setIsLoading(true);
    try {
      // TODO: Implement unstaking logic
      console.log("Unstaking amount:", amount);
    } catch (error) {
      console.error("Error unstaking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(stakedBalance);
  };

  const handleClearClick = () => {
    setAmount("");
  };

  return (
    <VStack gap={4} align="stretch">
      <Text fontSize="sm" color="gray.500">
        Staked Balance: {stakedBalance}
      </Text>

      <Flex gap={2} mb={4}>
        <Input
          placeholder="Enter amount to unstake"
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

      <Button
        colorScheme="red"
        onClick={handleUnstake}
        loading={isLoading}
        disabled={
          !amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(stakedBalance)
        }
        width="100%"
        alignSelf="center"
      >
        Unstake
      </Button>
    </VStack>
  );
};

export default UnstakeForm;
