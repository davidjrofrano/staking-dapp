import { type FC } from "react";

import { Box, Button, Flex } from "@chakra-ui/react";

import StakeForm from "./StakeForm";
import UnstakeForm from "./UnstakeForm";

const StakingTabs: FC<{
  activeTab: "stake" | "unstake";
  setActiveTab: (tab: "stake" | "unstake") => void;
}> = ({ activeTab, setActiveTab }) => {
  return (
    <Box>
      <Flex
        mb={8}
        borderBottom="2px solid"
        borderColor="orange.300"
        bg="orange.50"
        borderRadius="0"
        borderTopRadius="lg"
      >
        <Button
          variant={activeTab === "stake" ? "solid" : "ghost"}
          colorScheme="orange"
          borderRadius="0"
          borderTopLeftRadius="md"
          fontSize="lg"
          fontWeight="semibold"
          py={4}
          px={8}
          flex={1}
          onClick={() => setActiveTab("stake")}
          bg={activeTab === "stake" ? "orange.600" : "transparent"}
          color={activeTab === "stake" ? "white" : "orange.600"}
          _hover={{
            bg: activeTab === "stake" ? "orange.700" : "orange.300",
          }}
        >
          Stake
        </Button>
        <Button
          variant={activeTab === "unstake" ? "solid" : "ghost"}
          colorScheme="orange"
          borderRadius="0"
          borderTopRightRadius="md"
          fontSize="lg"
          fontWeight="semibold"
          py={4}
          px={8}
          flex={1}
          onClick={() => setActiveTab("unstake")}
          bg={activeTab === "unstake" ? "orange.600" : "transparent"}
          color={activeTab === "unstake" ? "white" : "orange.600"}
          _hover={{
            bg: activeTab === "unstake" ? "orange.700" : "orange.300",
          }}
        >
          Unstake
        </Button>
      </Flex>

      <Box>{activeTab === "stake" ? <StakeForm /> : <UnstakeForm />}</Box>
    </Box>
  );
};

export default StakingTabs;
