import { useQuery } from '@tanstack/react-query';

const getEthToUsdRate = async () => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    if (!response.ok) {
      throw new Error('Failed to fetch ETH to USD rate');
    }
    const data = await response.json();
    return data.ethereum.usd as number;
  } catch (error) {
    console.error('[getEthToUsdRate] Error fetching price:', error);
    return 0; // Return 0 or a default value in case of an error
  }
};

export const useEthToUsd = () => {
  const { data: ethToUsdRate = 0, isLoading } = useQuery<number>({
    queryKey: ['ethToUsdRate'],
    queryFn: getEthToUsdRate,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  return { ethToUsdRate, isLoading };
};
