import Table from '@/components/ui/Table'
import Heading from '@/components/ui/Typography'
import { CONSTANTS } from '../constant/data.const'

const TableData = ({ data }: { data: any[] }) => {
  const columns = [
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">@{row.original.username}</div>
          <div className="text-sm text-secondary">{row.original.usernameFull}</div>
        </div>
      ),
    },
    {
      accessorKey: 'minimumBid',
      header: 'Minimum Bid',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{row.original.minimumBid}</div>
          <div className="text-sm text-gray">Approx: {row.original.approxBid}</div>
        </div>
      ),
    },
    {
      accessorKey: 'auctionEndsIn',
      header: 'Auction Ends In',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-0">
          <div className="font-semibold text-white">{row.original.auctionEndsIn}</div>
          <div className="text-sm text-gray">{row.original.auctionEndsInProper}</div>
        </div>
      ),
    },
  ]

  return (
    <div className=" min-h-screen">
      <div className="mx-auto flex flex-col gap-2">
        <Heading variant="h3" title={CONSTANTS.TABLE.HEADING} color="white" fontWeight={700} />
        <Table data={data} columns={columns} />
      </div>
    </div>
  )
}

export default TableData
