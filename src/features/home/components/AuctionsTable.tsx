import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Shimmer from '@/components/ui/Shimmer';
import { useGetActiveAuctions } from '@/hooks/contract/useGetActiveAuctions';
import { formatEther } from 'viem';
import type { NameTradeAuction } from '@/types/trade';
import { formatDateTime } from '@/utils/date';

const AuctionsTable = () => {
  const { auctions, isLoading } = useGetActiveAuctions();

  const data = auctions.map((auction) => ({
    ...auction,
    name: auction.name || auction.tokenId.toString(),
  }));

  const columns = [
    {
      accessorKey: 'name',
      header: 'Username',
      cell: ({ row }: { row: { original: { name: string } } }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">@{row.original.name}</div>
          <div className="text-sm text-secondary">@{row.original.name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'reservePrice',
      header: 'Reserve Price',
      cell: ({ row }: { row: { original: NameTradeAuction } }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{formatEther(row.original.reservePrice)} ETH</div>
        </div>
      ),
    },
    {
      accessorKey: 'endTime',
      header: 'End Time',
      cell: ({ row }: { row: { original: NameTradeAuction } }) => {
        const endTimeMs = Number(row.original.endTime) * 1000;
        const endDate = new Date(endTimeMs);
        return <div className="font-semibold text-white">{formatDateTime(endDate.toISOString())}</div>;
      },
    },
    {
      accessorKey: 'action',
      header: '',
      cell: () => (
        <Button variant="secondary" size="sm">Place Bid</Button>
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
      <Table data={data} columns={columns} />
    </div>
  );
};

export default AuctionsTable;
