import Table from '@/components/ui/Table'
import { walletAddress } from '@/utils/username'
import { useGetOffers } from '@/hooks/contract/useGetOffers'
import { formatEther } from 'viem'

type Props = {
  nft: `0x${string}`
  tokenId: bigint
}

const HighestOffer = ({ nft, tokenId }: Props) => {
  const { offers, isLoading } = useGetOffers(nft, tokenId)

  const highest = offers.length > 0 ? offers.reduce((max, o) => (o.amount > max.amount ? o : max), offers[0]) : null

  const data = highest ? [{ address: highest.offerer, offer: `${formatEther(highest.amount)} ETH` }] : []

  

  const columns = [
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{walletAddress(row.original.address)}</div>
        </div>
      ),
    },
    {
      accessorKey: 'offer',
      header: 'Offer',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-0">
          <div className="font-semibold text-white">{row.original.offer}</div>
        </div>
      ),
    },
  ]

  return (
    <div className="rounded-md border border-header ">
      <Table data={data} columns={columns} isLoading={isLoading} emptyMessage="No offers yet." skeletonRowCount={1} />
    </div>
  )
}

export default HighestOffer
