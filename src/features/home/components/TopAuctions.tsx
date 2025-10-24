import { useGetAuctions } from '@/hooks/contract/useGetAuctions';
import Shimmer from '@/components/ui/Shimmer';
import Table from '@/components/ui/Table';
import { formatEther } from 'viem';
import { formatDistanceToNow } from 'date-fns';
import type { NameTradeAuction } from '@/types/trade';

const TopAuctions = () => {
  const { auctions, isLoading } = useGetAuctions();

  const columns = [
    {
      accessorKey: 'tokenId',
      header: 'Username',
      cell: ({ row }: { row: { original: NameTradeAuction } }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">@{row.original.tokenId.toString()}</div>
          <div className="text-sm text-secondary">@{row.original.tokenId.toString()}</div>
        </div>
      ),
    },
    {
      accessorKey: 'reservePrice',
      header: 'Minimum Bid',
      cell: ({ row }: { row: { original: NameTradeAuction } }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{formatEther(row.original.reservePrice)} ETH</div>
          <div className="text-sm text-gray">Approx: ${Number(formatEther(row.original.reservePrice)) * 3250}</div>
        </div>
      ),
    },
    {
      accessorKey: 'endTime',
      header: 'Auction Ends In',
      cell: ({ row }: { row: { original: NameTradeAuction } }) => (
        <div className="flex flex-col gap-0">
          <div className="font-semibold text-white">
            {formatDistanceToNow(new Date(Number(row.original.endTime) * 1000), { addSuffix: true })}
          </div>
          <div className="text-sm text-gray">{new Date(Number(row.original.endTime) * 1000).toLocaleString()}</div>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-header p-4">
        {[...Array(5)].map((_, i) => (
          <Shimmer key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-header ">
      <Table data={auctions} columns={columns} />
    </div>
  );
};

export default TopAuctions;
