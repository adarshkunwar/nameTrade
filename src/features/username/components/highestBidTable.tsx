import Table from '@/components/ui/Table'

interface HighestBidTableProps {
  highestBid: string;
  highestBidUsd: string;
  bidStep: string;
  bidStepUsd: string;
  minimumBid: string;
  minimumBidUsd: string;
  isLoading: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
}

const HighestBid = ({
  highestBid,
  highestBidUsd,
  bidStep,
  bidStepUsd,
  minimumBid,
  minimumBidUsd,
  isLoading,
  isEmpty,
  emptyMessage,
}: HighestBidTableProps) => {
  const columns = [
    {
      accessorKey: 'highestBid',
      header: 'Highest Bid',
      cell: () => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{highestBid} ETH</div>
          <div className="text-sm text-secondary">{highestBidUsd}</div>
        </div>
      ),
    },
    {
      accessorKey: 'bidStep',
      header: 'Bid Step',
      cell: () => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{bidStep} ETH</div>
          <div className="text-sm text-secondary">{bidStepUsd}</div>
        </div>
      ),
    },
    {
      accessorKey: 'minimumBid',
      header: 'Minimum Bid',
      cell: () => (
        <div className="flex flex-col gap-0">
          <div className="font-semibold text-white">{minimumBid} ETH</div>
          <div className="text-sm text-secondary">{minimumBidUsd}</div>
        </div>
      ),
    },
  ]

  return (
    <div className="rounded-md border border-header ">
      <Table
        data={isEmpty ? [] : [{}]}
        columns={columns}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        skeletonRowCount={1}
      />
    </div>
  )
}

export default HighestBid
