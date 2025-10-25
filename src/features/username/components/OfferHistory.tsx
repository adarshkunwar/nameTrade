import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { useGetOffers } from '@/hooks/contract/useGetOffers';
import { walletAddress } from '@/utils/username'
import { formatEther } from 'viem';
import type { NameTradeOffer } from '@/types/trade';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNameTradeRemoveOffer, useNameTradeAcceptOffer } from '@/hooks/contract/useNameTradeOffersMutations';
import { useBaseAuth } from '@/hooks/auth/useBaseAuth';
import { useQueryClient } from '@tanstack/react-query';
import { resolveDefaultNetwork } from '@/config/contract/config';
import { useNftOwner } from '@/hooks/contract/useNftOwner';

interface OfferHistoryProps {
  nft: `0x${string}`;
  tokenId: bigint;
}

const OfferHistory: React.FC<OfferHistoryProps> = ({ nft, tokenId }) => {
  const { offers, isLoading } = useGetOffers(nft, tokenId);
  const { user } = useAuth();
  const { switchToNameTradeChain } = useBaseAuth();
  const removeOfferMutation = useNameTradeRemoveOffer();
  const acceptOfferMutation = useNameTradeAcceptOffer();
  const queryClient = useQueryClient();
  const network = resolveDefaultNetwork();
  const { owner } = useNftOwner(nft, tokenId, { enabled: true });

  const columns = [
    {
      accessorKey: 'offerer',
      header: 'Offerer',
      cell: ({ row }: { row: { original: NameTradeOffer } }) => (
        <div className="font-semibold text-white">{walletAddress(row.original.offerer)}</div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: { row: { original: NameTradeOffer } }) => (
        <div className="font-semibold text-white">
          {formatEther(row.original.amount)} ETH
        </div>
      ),
    },
    {
      accessorKey: 'expiry',
      header: 'Expires In',
      cell: ({ row }: { row: { original: NameTradeOffer } }) => (
        <div className="font-semibold text-white">
          {formatDistanceToNow(new Date(Number(row.original.expiry) * 1000), { addSuffix: true })}
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: '',
      size: 110,
      cell: ({ row }: { row: { original: NameTradeOffer } }) => {
        const isMine = user?.address && row.original.offerer?.toLowerCase() === user.address.toLowerCase();
        const isOwner = owner && user?.address && owner.toLowerCase() === user.address.toLowerCase();

        const onCancel = async () => {
          await switchToNameTradeChain();
          const tx = await removeOfferMutation.mutateAsync({ nft, tokenId, offerer: row.original.offerer });
          const receipt = await tx.waitForReceipt();
          console.log('[OfferHistory] cancel success', { hash: receipt.transactionHash });
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['nameTrade', network, 'getAllOffersForNft', nft, tokenId.toString()] }),
            queryClient.invalidateQueries({ queryKey: ['nameTrade', network, 'getOffer', nft, tokenId.toString()] }),
            queryClient.invalidateQueries({ queryKey: ['nameTrade', network, 'offers'] }),
          ]);
        };

        const onAccept = async () => {
          await switchToNameTradeChain();
          const tx = await acceptOfferMutation.mutateAsync({ nft, tokenId, offerer: row.original.offerer });
          const receipt = await tx.waitForReceipt();
          console.log('[OfferHistory] accept success', { hash: receipt.transactionHash });
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['nameTrade', network, 'getAllOffersForNft', nft, tokenId.toString()] }),
            queryClient.invalidateQueries({ queryKey: ['nameTrade', network, 'getOffer', nft, tokenId.toString()] }),
            queryClient.invalidateQueries({ queryKey: ['nameTrade', network, 'offers'] }),
            queryClient.invalidateQueries({ queryKey: ['nft', 'ownerOf', network, nft, tokenId.toString()] }),
          ]);
        };

        if (isMine) {
          return (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={onCancel} loading={removeOfferMutation.isPending} disabled={removeOfferMutation.isPending}>
                Cancel
              </Button>
            </div>
          );
        }

        if (isOwner) {
          return (
            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={onAccept} loading={acceptOfferMutation.isPending} disabled={acceptOfferMutation.isPending}>
                Accept
              </Button>
            </div>
          );
        }

        return null;
      },
    },
  ];

  return (
    <div className="rounded-md border border-header ">
      <Table data={offers} columns={columns} isLoading={isLoading} emptyMessage="No offers yet." />
    </div>
  );
};

export default OfferHistory;
