import Table from '@/components/ui/Table'
import { useGetActiveAuctions } from '@/hooks/contract/useGetActiveAuctions'
import { formatEther } from 'viem'
import type { NameTradeAuction } from '@/types/trade'
import { formatDateTime } from '@/utils/date'
import { Link } from 'react-router-dom'
import { cryptic } from '@/lib/utils'
import { ellipsiAtEnd } from '@/utils/username'

const AuctionsTable = () => {
  const { auctions, isLoading } = useGetActiveAuctions()
  const { urlSafeEncrypt } = cryptic()

  const data = (auctions ?? []).map((auction) => ({
    ...auction,
    name: auction.name || auction.tokenId.toString(),
  }))

  const columns = [
    {
      accessorKey: 'name',
      header: 'Username',
      cell: ({ row }: { row: { original: NameTradeAuction & { name: string } } }) => {
        const usernameValue = row.original?.name
        const display = `@${usernameValue?.split('.base')?.[0]}`
        const tokenId = row.original?.tokenId
        return (
          <div className="flex flex-col gap-1">
            <Link
              to={`/username/${urlSafeEncrypt(String(tokenId ?? ''))}`}
              state={{ username: usernameValue }}
              className="font-semibold text-white transition "
            >
              {ellipsiAtEnd(display, 15)}
            </Link>
          </div>
        )
      },
    },
    {
      accessorKey: 'reservePrice',
      header: 'Reserve Price',
      cell: ({ row }: { row: { original: NameTradeAuction } }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{formatEther(row.original.reservePrice)} ETH</div>
        </div>
      ),
    },
    {
      accessorKey: 'endTime',
      header: 'End Time',
      cell: ({ row }: { row: { original: NameTradeAuction } }) => {
        const endTimeMs = Number(row.original.endTime) * 1000
        const endDate = new Date(endTimeMs)
        return <div className="font-semibold text-white">{formatDateTime(endDate.toISOString())}</div>
      },
    },
  ]

  return (
    <Table data={data} columns={columns} isLoading={isLoading} />
  )
}

export default AuctionsTable
