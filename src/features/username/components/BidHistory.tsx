import Table from '@/components/ui/Table'

const BidHistory = ({ data }: { data: any[] }) => {
  const columns = [
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{row.original.price}</div>
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{row.original.date}</div>
        </div>
      ),
    },
    {
      accessorKey: 'from',
      header: 'From',
      cell: ({ row }: any) => (
        <div className="flex flex-col gap-0">
          <div className="font-semibold text-secondary">{row.original.from}</div>
        </div>
      ),
    },
  ]

  return (
    <div className="rounded-md border border-header ">
      <Table data={data} columns={columns} />
    </div>
  )
}

export default BidHistory
