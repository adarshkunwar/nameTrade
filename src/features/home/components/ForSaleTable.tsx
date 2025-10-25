import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import { useBuyNft } from '@/hooks/contract/useBuyNft'
import { useGetListedNfts } from '@/hooks/contract/useGetListedNfts'
import { formatEther } from 'viem'
import type { NameTradeListing } from '@/types/trade'

const ForSaleTable = () => {
  const { listings, isLoading } = useGetListedNfts()
  const buyNft = useBuyNft()

  const data = (listings ?? []).map((listing) => ({
    ...listing,
    name: listing.name || listing.tokenId.toString(),
  }))

  const columns = [
    {
      accessorKey: 'name',
      header: 'Username',
      cell: ({ row }: { row: { original: { name: string } } }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">@{row.original.name?.split('.base')?.[0]}</div>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }: { row: { original: NameTradeListing } }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{formatEther(row.original.price)} ETH</div>
        </div>
      ),
    },
    {
      accessorKey: 'action',
      size: 100,
      header: '',
      cell: ({ row }: { row: { original: NameTradeListing } }) => (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm"      onClick={() => {
            if (row.original.nft && row.original.tokenId && row.original.price) {
              buyNft.mutate({ nft: row.original.nft, tokenId: row.original.tokenId, price: row.original.price })
            }
          }}>
            Buy
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Table data={data} columns={columns} isLoading={isLoading} emptyMessage="No Usernames found listed" />
  )
}

export default ForSaleTable
