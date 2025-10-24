import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import { useNameTradeCancel, useNameTradeList } from '@/hooks/contract/useNameTradeListingsMutations';
import { useNameTradeStartAuction } from '@/hooks/contract/useNameTradeAuctionsMutations';
import { parseEther, type Address } from 'viem';
import { useBaseAuth } from '@/hooks/auth/useBaseAuth';
import { getNameTradePublicClient, getNameTradeWalletClient } from '@/config/contract/client';
import { resolveNameTradeContractConfig } from '@/config/contract/config';
import ListModal from './ListModal';
import { ERC721_APPROVAL_ABI } from '../constant/approval.const';
import AuctionModal from './AuctionModal';

type ActionsProps = { contractAddress: string; tokenId: string; isListed: boolean };

function OwnedUsernameActions({ contractAddress, tokenId, isListed }: ActionsProps) {
  const [listError, setListError] = useState<string | null>(null);
  const [auctionError, setAuctionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const listMutation = useNameTradeList();
  const cancelMutation = useNameTradeCancel();
  const startAuctionMutation = useNameTradeStartAuction();
  const { switchToNameTradeChain } = useBaseAuth();

  const ensureApproved = useCallback(async (nftAddress: string) => {
    const publicClient = getNameTradePublicClient();
    const walletClient = getNameTradeWalletClient();
    if (!walletClient) throw new Error('Wallet unavailable');

    const [owner] = await walletClient.getAddresses();
    if (!owner) throw new Error('No wallet address available');

    const { address: operator, chain } = resolveNameTradeContractConfig();

    const approved = (await publicClient.readContract({
      address: nftAddress as Address,
      abi: ERC721_APPROVAL_ABI,
      functionName: 'isApprovedForAll',
      args: [owner as Address, operator as Address],
    })) as boolean;

    if (!approved) {
      const hash = await walletClient.writeContract({
        address: nftAddress as Address,
        abi: ERC721_APPROVAL_ABI,
        functionName: 'setApprovalForAll',
        args: [operator as Address, true],
        account: owner,
        chain,
      });
      await publicClient.waitForTransactionReceipt({ hash });
    }
  }, []);

  const handleSubmitList = async (data: { price: number }) => {
    const { price } = data;
    setListError(null);
    setIsSubmitting(true);

    try {
      if (!price || Number(price) <= 0) {
        throw new Error('Enter a valid price in ETH.');
      }

      const transactionPromise = async () => {
        await switchToNameTradeChain();
        await ensureApproved(contractAddress);
        const tx = await listMutation.mutateAsync({
          nft: contractAddress,
          tokenId,
          price: parseEther(String(price)),
        });
        await tx.waitForReceipt();
      };

      const delayPromise = new Promise((resolve) => setTimeout(resolve, 5000));

      await Promise.all([transactionPromise(), delayPromise]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list. Try again.';
      setListError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAuction = async (data: { reservePrice: number; duration: number }) => {
    const { reservePrice, duration } = data;
    setAuctionError(null);
    setIsSubmitting(true);

    try {
      if (!reservePrice || Number(reservePrice) <= 0 || !duration || Number(duration) <= 0) {
        throw new Error('Enter a valid reserve price in ETH.');
      }

      const transactionPromise = async () => {
        await switchToNameTradeChain();
        await ensureApproved(contractAddress);
        const tx = await startAuctionMutation.mutateAsync({
          nft: contractAddress,
          tokenId,
          reservePrice: parseEther(String(reservePrice)),
          duration: duration,
        });
        await tx.waitForReceipt();
      };

      const delayPromise = new Promise((resolve) => setTimeout(resolve, 5000));

      await Promise.all([transactionPromise(), delayPromise]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start auction. Try again.';
      setAuctionError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    await switchToNameTradeChain();
    await cancelMutation.mutateAsync({
      nft: contractAddress,
      tokenId,
    });
  };

  if (isListed) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCancel}
        loading={cancelMutation.isPending}
        disabled={cancelMutation.isPending}
      >
        Cancel Listing
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ListModal
        onSubmit={handleSubmitList}
        loading={isSubmitting}
        disabled={isSubmitting}
        error={listError}
        triggerSize="sm"
      />
      <AuctionModal
        onSubmit={handleSubmitAuction}
        loading={isSubmitting}
        disabled={isSubmitting}
        error={auctionError}
        triggerSize="sm"
      />
    </div>
  );
}

export default OwnedUsernameActions;
