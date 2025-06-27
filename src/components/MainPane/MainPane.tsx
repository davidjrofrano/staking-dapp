"use client";

import { useState, type FC } from "react";

import { Box, Heading } from "@chakra-ui/react";
import { useTheme } from "next-themes";

import styles from "@/styles/mainPane.module.css";

import { StakingTabs } from "./components";

const MainPane: FC = () => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");

  return (
    <Box
      className={styles.container}
      border={isDarkMode ? "1px solid rgba(152, 161, 192, 0.24)" : "none"}
    >
      <Heading as="h2" fontSize="2rem" mb={10} className="text-shadow">
        {activeTab === "stake" ? "Stake" : "Unstake"} Form
      </Heading>

      <Box className={styles.content}>
        <StakingTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </Box>
    </Box>
  );
};

export default MainPane;
