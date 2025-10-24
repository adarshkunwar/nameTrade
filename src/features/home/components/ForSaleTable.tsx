import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Shimmer from '@/components/ui/Shimmer';
import { useGetListedNfts } from '@/hooks/contract/useGetListedNfts';
import { formatEther } from 'viem';
import type { NameTradeListing } from '@/types/trade';

const ForSaleTable = () => {
  const { listings, isLoading } = useGetListedNfts();

  const data = listings.map((listing) => ({
    ...listing,
    name: listing.tokenId.toString(),
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

export default ForSaleTable;
