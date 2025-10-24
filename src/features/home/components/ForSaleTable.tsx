import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Shimmer from '@/components/ui/Shimmer';
import { useGetListedNfts } from '@/hooks/contract/useGetListedNfts';
import { formatEther } from 'viem';
import type { NameTradeListing } from '@/types/trade';

const ForSaleTable = () => {
  const { listings, isLoading } = useGetListedNfts();

  const columns = [
    {
      accessorKey: 'tokenId',
      header: 'Username',
      cell: ({ row }: { row: { original: NameTradeListing } }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">@{row.original.tokenId.toString()}</div>
          <div className="text-sm text-secondary">@{row.original.tokenId.toString()}</div>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }: { row: { original: NameTradeListing } }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{formatEther(row.original.price)} ETH</div>
          <div className="text-sm text-gray">Approx: ${Number(formatEther(row.original.price)) * 3250}</div>
        </div>
      ),
    },
    {
        accessorKey: 'action',
        header: '',
        cell: () => (
            <Button variant="secondary" size="sm">Buy</Button>
        ),
    }
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
      <Table data={listings} columns={columns} />
    </div>
  );
};

export default ForSaleTable;
