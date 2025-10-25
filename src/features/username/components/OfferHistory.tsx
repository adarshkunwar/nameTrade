import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { useGetOffers } from '@/hooks/contract/useGetOffers';
import { walletAddress } from '@/utils/username'
import { formatEther } from 'viem';
import type { NameTradeOffer } from '@/types/trade';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNameTradeRemoveOffer } from '@/hooks/contract/useNameTradeOffersMutations';
import { useBaseAuth } from '@/hooks/auth/useBaseAuth';
import { useQueryClient } from '@tanstack/react-query';
import { resolveDefaultNetwork } from '@/config/contract/config';

interface OfferHistoryProps {
  nft: `0x${string}`;
  tokenId: bigint;
}

const OfferHistory: React.FC<OfferHistoryProps> = ({ nft, tokenId }) => {
  const { offers, isLoading } = useGetOffers(nft, tokenId);
  const { user } = useAuth();
  const { switchToNameTradeChain } = useBaseAuth();
  const removeOfferMutation = useNameTradeRemoveOffer();
  const queryClient = useQueryClient();
  const network = resolveDefaultNetwork();

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
        if (!isMine) return null;
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
        return (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onCancel} loading={removeOfferMutation.isPending} disabled={removeOfferMutation.isPending}>
              Cancel
            </Button>
          </div>
        );
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
