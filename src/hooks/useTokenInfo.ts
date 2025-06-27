import { useCallback, useState } from "react";

import { erc20Abi, formatUnits, isAddress, type PublicClient } from "viem";

export interface UseTokenInfoReturn {
  decimals: number;
  balance: string;
  allowance: string;
  fetchTokenInfo: () => Promise<void>;
}

export function useTokenInfo(
  client: PublicClient,
  account?: `0x${string}`,
  token?: `0x${string}`,
  spender?: `0x${string}`,
): UseTokenInfoReturn {
  const [decimals, setDecimals] = useState(0);
  const [balance, setBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");

  const fetchTokenInfo = useCallback(
    async (skipDecimals = true) => {
      if (!client || !account || !token || !isAddress(account) || !isAddress(token)) return;

      let decimals_ = decimals;
      try {
        if (!skipDecimals) {
          decimals_ = await client.readContract({
            address: token,
            abi: erc20Abi,
            functionName: "decimals",
          });
          setDecimals(decimals_);
        }

        const balance_ = await client.readContract({
          address: token,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [account],
        });
        setBalance(formatUnits(balance_, decimals_));

        if (!spender || !isAddress(spender)) return;

        const allowance_ = await client.readContract({
          address: token,
          abi: erc20Abi,
          functionName: "allowance",
          args: [account, spender],
        });
        setAllowance(formatUnits(allowance_, decimals_));
      } catch (error) {
        console.error("Error fetching token info:", error);
        setDecimals(0);
        setBalance("0");
        setAllowance("0");
      }
    },
    [client, account, token, spender, decimals],
  );

  fetchTokenInfo(false);

  return { decimals, balance, allowance, fetchTokenInfo };
}
