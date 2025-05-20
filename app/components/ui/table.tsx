import * as React from "react"

export function Table({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <table {...props} className="min-w-full divide-y divide-gray-200">
      {children}
    </table>
  )
}

export function TableHeader({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead {...props} className="bg-gray-50">
      {children}
    </thead>
  )
}

export function TableBody({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody {...props} className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  )
}

export function TableRow({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr {...props}>
      {children}
    </tr>
  )
}

export function TableHead({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th {...props} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  )
}

export function TableCell({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td {...props} className="px-6 py-4 whitespace-nowrap">
      {children}
    </td>
  )
}