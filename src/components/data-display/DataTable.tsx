import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export interface DataTableColumn<TData> {
  key: keyof TData
  header: string
  render?: (value: TData[keyof TData], row: TData) => ReactNode
  className?: string
}

interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[]
  rows: TData[]
  rowKey: (row: TData) => string
  className?: string
  emptyText?: string
}

export function DataTable<TData extends object>({
  columns,
  rows,
  rowKey,
  className,
  emptyText = 'No rows available.',
}: DataTableProps<TData>) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-border', className)}>
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-elevated">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn('px-4 py-3 font-medium text-text-muted', column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-5 text-text-muted" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          ) : null}
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-t border-border/70 bg-surface/60">
              {columns.map((column) => {
                const value = row[column.key]
                return (
                  <td
                    key={String(column.key)}
                    className={cn('px-4 py-3 text-text', column.className)}
                  >
                    {column.render ? column.render(value, row) : String(value)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
