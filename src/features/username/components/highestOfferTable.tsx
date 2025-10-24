import Table from '@/components/ui/Table'
import { HIGHEST_OFFER_DATA } from '../constant/table.const'
import { walletAddress } from '@/utils/username'

const HighestOffer = () => {
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
      <Table data={HIGHEST_OFFER_DATA} columns={columns} />
    </div>
  )
}

export default HighestOffer
