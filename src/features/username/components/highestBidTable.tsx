import { HIGHEST_BID_DATA } from '../constant/table.const'
import Table from '@/components/ui/Table'

const HighestBid = () => {
  const columns = [
    {
      accessorKey: 'highestBid',
      header: 'Highest Bid',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{row.original.highestBid}</div>
          <div className="text-sm text-secondary">~ {row.original.bidApprox}</div>
        </div>
      ),
    },
    {
      accessorKey: 'bidStep',
      header: 'Bid Step',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{row.original.bidStep}</div>
          <div className="text-sm text-gray">~ {row.original.bidStepApprox}</div>
        </div>
      ),
    },
    {
      accessorKey: 'minimumBid',
      header: 'Minimum Bid',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-0">
          <div className="font-semibold text-white">{row.original.minimumBid}</div>
          <div className="text-sm text-gray">~ {row.original.minimumBidApprox}</div>
        </div>
      ),
    },
  ]

  return (
    <div className="rounded-md border border-header ">
      <Table data={HIGHEST_BID_DATA} columns={columns} />
    </div>
  )
}

export default HighestBid
