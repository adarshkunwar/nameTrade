import Table from '@/components/ui/Table'
import { HIGHEST_OFFER_DATA } from '../constant/table.const'

const HighestOffer = () => {
  const columns = [
    {
      accessorKey: 'highestOffer',
      header: 'Highest Offer',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{row.original.highestOffer}</div>
          <div className="text-sm text-secondary">~ {row.original.offerApprox}</div>
        </div>
      ),
    },
    {
      accessorKey: 'offerStep',
      header: 'Offer Step',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{row.original.offerStep}</div>
          <div className="text-sm text-gray">~ {row.original.offerStepApprox}</div>
        </div>
      ),
    },
    {
      accessorKey: 'minimumOffer',
      header: 'Minimum Offer',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-0">
          <div className="font-semibold text-white">{row.original.minimumOffer}</div>
          <div className="text-sm text-gray">~ {row.original.minimumOfferApprox}</div>
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
