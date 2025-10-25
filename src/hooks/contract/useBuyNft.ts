import { type Address } from 'viem';
import { useNameTradeWriteMutation, type NameTradeWriteHookOptions } from './useNameTradeWrite';
import { normalizeAddress, toBigInt } from '@/utils/address';

export interface UseBuyNftVariables {
  nft: Address;
  tokenId: bigint;
  price: bigint;
}

export const useBuyNft = (options: NameTradeWriteHookOptions<UseBuyNftVariables> = {}) => {
  return useNameTradeWriteMutation<UseBuyNftVariables>({
    ...options,
    functionName: 'buy',
    getArgs: (variables) => [normalizeAddress(variables.nft), toBigInt(variables.tokenId)],
    getValue: (variables) => toBigInt(variables.price),
  });
};
