import Shimmer from '@/components/ui/Shimmer';
import Table from '@/components/ui/Table'

interface HighestBidTableProps {
  highestBid: string;
  highestBidUsd: string;
  bidStep: string;
  bidStepUsd: string;
  minimumBid: string;
  minimumBidUsd: string;
  isLoading: boolean;
}

const HighestBid = ({
  highestBid,
  highestBidUsd,
  bidStep,
  bidStepUsd,
  minimumBid,
  minimumBidUsd,
  isLoading,
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-header p-4">
        <Shimmer />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-header ">
      <Table data={[{}]} columns={columns} />
    </div>
  )
}

export default HighestBid
