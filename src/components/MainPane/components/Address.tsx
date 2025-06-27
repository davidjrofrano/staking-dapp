import { type FC } from "react";

import { useAccount, useEnsName } from "wagmi";

import { InfoText } from "@/components";
import { useWindowSize } from "@/hooks";
import { ellipsis } from "@/utils/formatters";

const Address: FC = () => {
  const { address } = useAccount();
  const { data: ensName, isLoading: isEnsLoading } = useEnsName({ address });
  const { isTablet } = useWindowSize();

  const displayedAddress = isTablet && address ? ellipsis(address, 4) : address;
  const finalValue = isEnsLoading ? "Loading..." : (ensName ?? displayedAddress);

  return <InfoText label="Address" value={finalValue} />;
};

export default Address;
