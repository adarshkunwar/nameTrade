import Table from '@/components/ui/Table';
import Shimmer from '@/components/ui/Shimmer';
import { useGetOffers } from '@/hooks/contract/useGetOffers';
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
        <div className="font-semibold text-white">
          {row.original.offerer}
        </div>
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-header p-4">
        {[...Array(3)].map((_, i) => (
          <Shimmer key={i} />
        ))}
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="flex justify-center items-center rounded-md border border-header p-10">
        <p className="text-gray">No offers yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-header ">
      <Table data={offers} columns={columns} />
    </div>
  );
};

export default OfferHistory;
