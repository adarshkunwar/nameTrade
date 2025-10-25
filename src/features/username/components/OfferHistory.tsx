import Table from '@/components/ui/Table';
import { useGetOffers } from '@/hooks/contract/useGetOffers';
import { walletAddress } from '@/utils/username'
import { formatEther } from 'viem';
import type { NameTradeOffer } from '@/types/trade';
import { formatDistanceToNow } from 'date-fns';

interface OfferHistoryProps {
  nft: `0x${string}`;
  tokenId: bigint;
}

const OfferHistory: React.FC<OfferHistoryProps> = ({ nft, tokenId }) => {
  const { offers, isLoading } = useGetOffers(nft, tokenId);

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
  ];

  return (
    <div className="rounded-md border border-header ">
      <Table data={offers} columns={columns} isLoading={isLoading} emptyMessage="No offers yet." />
    </div>
  );
};

export default OfferHistory;
