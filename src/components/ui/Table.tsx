import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import Shimmer from '@/components/ui/Shimmer'
import { forwardRef, type ReactNode } from 'react'

interface TableProps {
  data: any[]
  columns: any[]
  isLoading?: boolean
  skeletonRowCount?: number
  skeletonCellWidths?: Record<string, string | number>
  emptyMessage?: ReactNode
}

const Table = forwardRef<HTMLDivElement, TableProps>(
  ({ data, columns, isLoading, skeletonRowCount = 5, skeletonCellWidths = {}, emptyMessage }, ref) => {
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })
    const headerGroups = table.getHeaderGroups()
    const firstHeaderGroup = headerGroups[0]
    const colCount = firstHeaderGroup?.headers?.length ?? 0
    const getColWidth = (colId: string) => {
      const col = table.getAllColumns().find((c) => c.id === colId)
      const definedWidth = col?.getSize?.()
      const override = skeletonCellWidths[colId]
      return override ?? (definedWidth ? `${definedWidth}px` : '100%')
    }
    return (
      <>
      <div className="w-full overflow-x-auto border border-header rounded-md">
        <table className="w-full border-collapse">
          <thead className="bg-primary text-white">
            {headerGroups.map((hg) => (
              <tr key={hg.id} className="text-left border-b border-header">
                {hg.headers.map((header) => (
                  <th key={header.id} className="py-2 px-4" style={{ width: getColWidth(header.column.id) }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`} className="border-b border-header">
                    {firstHeaderGroup.headers.map((header) => (
                      <td key={header.id} className="py-3 px-4" style={{ width: getColWidth(header.column.id) }}>
                        <Shimmer height={14} width="100%" rounded="md" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0 && emptyMessage
              ? (
                  <tr className="border-b border-header">
                    <td colSpan={colCount} className="py-6 px-4 text-center text-white">
                      {emptyMessage}
                    </td>
                  </tr>
                )
              : table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-header hover:bg-header transition-colors duration-150">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="text-left py-3 px-4" style={{ width: getColWidth(cell.column.id) }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div ref={ref}></div>
      </>
    )
  }
)

Table.displayName = 'Table'

export default Table
