import React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, getExpandedRowModel, flexRender } from '@tanstack/react-table';
import ApproveButton from '@/components/butons/ApproveButton';
import RejectButton from '@/components/butons/RejectButton';
import ViewMoreButton from '@/components/butons/ViewMoreButton';
import PrintButton from '@/components/toasts/print';
import { RequireRole } from '@/lib/roles';
import { ListPlus, ListX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Ellipsis, Eye, Check, Ban } from 'lucide-react';

const TransactionTable = ({
  transactions,
  setTransactions,
  filter,
  setFilter,
  cashAccounts,
  formatCurrency,
  formatRequestedAt,
  setSelectedTransaction,
  setShowDetailModal,
  auth,
  toast,
  loading,
  error,
  transactionStatusesModel
}) => {
  // Search filter state
  const [globalFilter, setGlobalFilter] = React.useState('');
  // Sorting state
  const [sorting, setSorting] = React.useState([]);
  // Pagination state
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  // Expand state
  const [expanded, setExpanded] = React.useState({});

  // Filter transactions based on filter prop and global search
  const filteredTransactions = React.useMemo(() => {
    let txs = filter === 'all' ? transactions : transactions.filter(tx => tx.status === filter);
    if (globalFilter.trim()) {
      const search = globalFilter.trim().toLowerCase();
      txs = txs.filter(tx =>
        (tx.to || '').toLowerCase().includes(search) ||
        (tx.reason || '').toLowerCase().includes(search) ||
        (tx.requestedBy?.name || '').toLowerCase().includes(search)
      );
    }
    return txs;
  }, [transactions, filter, globalFilter]);

  // Define columns for TanStack Table
  const columns = React.useMemo(() => [
    {
      id: 'expander',
      header: '',
      size: 32,
      cell: ({ row }) =>
        row.original.vehicleMaintenance && row.original.vehicleMaintenance.length > 0 ? (
          <button
            className="text-blue-600 hover:text-blue-900 focus:outline-none"
            onClick={() => row.toggleExpanded()}
            aria-label={row.getIsExpanded() ? 'Collapse' : 'Expand'}
          >
            {row.getIsExpanded() ? <ListX /> : <ListPlus />}
          </button>
        ) : null,
      enableSorting: false,
    },
    {
      header: 'To',
      accessorKey: 'to',
      enableSorting: false,
      size: 48,
      minSize: 40,
      maxSize: 56,
    },
    {
      header: 'Reason',
      accessorKey: 'reason',
      enableSorting: false,
      
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      size: 48,
        minSize: 40,
        maxSize: 56,
      cell: ({ row }) => (
        typeof (row.original.amount || row.original.suspenceAmount) === 'number' ? (
          <span className="font-bold text-[#038C4C">
            {formatCurrency(row.original.amount || row.original.suspenceAmount)}
          </span>
        ) : <span className="text-gray-400">-</span>
      ),
      sortingFn: (a, b) => {
        const aVal = a.original.amount || a.original.suspenceAmount || 0;
        const bVal = b.original.amount || b.original.suspenceAmount || 0;
        return aVal - bVal;
      },
    },
    {
      header: 'Type',
      accessorKey: 'type',
      size: 48,
        minSize: 40,
        maxSize: 56,
      cell: ({ row }) => (
        <span className="text-xs font-semibold px-2 rounded bg-blue-50 text-[#A7C1A8">
          {row.original.type === 'receipt_payment' ? 'Cash Payment' : row.original.type === 'suspence_payment' ? 'Suspence Payment' : row.original.type}
        </span>
      ),
    },
    {
      header: 'Requested By',
      accessorKey: 'requestedBy',
      size: 48,
        minSize: 40,
        maxSize: 56,
      cell: ({ row }) => <span className="text-gray-800 font-medium">{row.original.requestedBy?.name || '-'}</span>,
      sortingFn: (a, b) => {
        const aName = a.original.requestedBy?.name || '';
        const bName = b.original.requestedBy?.name || '';
        return aName.localeCompare(bName);
      },
    },
    {
      header: 'Requested At',
      accessorKey: 'requestedAt',
      size: 48,
        minSize: 40,
        maxSize: 56,
      cell: ({ row }) => <span className="text-gray-600">{formatRequestedAt(row.original.requestedAt)}</span>,
      sortingFn: (a, b) => {
        const aDate = new Date(a.original.requestedAt).getTime();
        const bDate = new Date(b.original.requestedAt).getTime();
        return aDate - bDate;
      },
    },
    {
      header: 'Actions',
      id: 'actions',
      enableSorting: false,
      size: 48,
      minSize: 40,
      maxSize: 56,
      cell: ({ row }) => {
        const tx = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-muted transition cursor-pointer" title="Actions">
                <Ellipsis />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setSelectedTransaction(tx); setShowDetailModal(true); }}>
                <Eye className="w-4 h-4 mr-2" /> View Detail
              </DropdownMenuItem>
              {tx.status !== 'approved' && (
                <DropdownMenuItem
                  onClick={() => {
                    toast((t) => (
                      <div className="bg-white rounded-xl shadow-lg p-4 min-w-[320px] max-w-xs border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-semibold text-gray-800">Approve Request</div>
                          <button
                            className="text-gray-400 hover:text-gray-700 text-xl"
                            onClick={() => toast.dismiss(t)}
                            aria-label="Close"
                          >×</button>
                        </div>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-2xl font-bold text-green-600">{formatCurrency(tx.amount || tx.suspenceAmount)}</span>
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">Pending</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {tx.requestedAt ? formatRequestedAt(tx.requestedAt) : ''}
                        </div>
                        <div className="divide-y divide-gray-100 mb-3">
                          <div className="py-1">
                            <span className="font-semibold text-gray-700">To: </span>
                            <span>{tx.to || '-'}</span>
                          </div>
                          <div className="py-1">
                            <span className="font-semibold text-gray-700">Reason: </span>
                            <span>{tx.reason || '-'}</span>
                          </div>
                          <div className="py-1">
                            <span className="font-semibold text-gray-700">Requested By: </span>
                            <span>{tx.requestedBy?.name || '-'}</span>
                          </div>
                          <div className="py-1">
                            <span className="font-semibold text-gray-700">Type: </span>
                            <span>{tx.type === 'receipt_payment' ? 'Cash Payment' : tx.type === 'suspence_payment' ? 'Suspence Payment' : tx.type}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-2">
                          <button
                            className="px-3 py-1 rounded bg-green-500 text-white font-semibold"
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/transactions', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    id: tx._id,
                                    approvedBy: auth?.id,
                                    status: 'requested',
                                  }),
                                });
                                const data = await res.json();
                                if (data.success) {
                                  toast.dismiss(t);
                                  toast.success('Request approved!');
                                  window.location.reload();
                                } else {
                                  toast.error(data.message || 'Failed to approve.');
                                }
                              } catch (err) {
                                toast.error('Failed to approve.');
                              }
                            }}
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ), { duration: 10000 });
                  }}
                >
                  <Check className="w-4 h-4 mr-2" /> Approve
                </DropdownMenuItem>
              )}
              {tx.status !== 'rejected' && (
                <DropdownMenuItem
                  onClick={() => {
                    toast((t) => {
                      const [rejectionReason, setRejectionReason] = React.useState('');
                      return (
                        <div className="bg-white rounded-xl shadow-lg p-4 min-w-[320px] max-w-xs border border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-semibold text-gray-800">Reject Request</div>
                            <button
                              className="text-gray-400 hover:text-gray-700 text-xl"
                              onClick={() => toast.dismiss(t)}
                              aria-label="Close"
                            >×</button>
                          </div>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-2xl font-bold text-green-600">{formatCurrency(tx.amount || tx.suspenceAmount)}</span>
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-semibold">Pending</span>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {tx.requestedAt ? formatRequestedAt(tx.requestedAt) : ''}
                          </div>
                          <div className="divide-y divide-gray-100 mb-3">
                            <div className="py-1">
                              <span className="font-semibold text-gray-700">To: </span>
                              <span>{tx.to || '-'}</span>
                            </div>
                            <div className="py-1">
                              <span className="font-semibold text-gray-700">Reason: </span>
                              <span>{tx.reason || '-'}</span>
                            </div>
                            <div className="py-1">
                              <span className="font-semibold text-gray-700">Requested By: </span>
                              <span>{tx.requestedBy?.name || '-'}</span>
                            </div>
                            <div className="py-1">
                              <span className="font-semibold text-gray-700">Type: </span>
                              <span>{tx.type === 'receipt_payment' ? 'Cash Payment' : tx.type === 'suspence_payment' ? 'Suspence Payment' : tx.type}</span>
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="block font-semibold text-gray-700 mb-1">Rejection Reason: <span className="text-red-500">*</span></label>
                            <textarea
                              className="w-full border rounded px-2 py-1 text-sm"
                              placeholder="Please provide a reason for rejection"
                              value={rejectionReason}
                              onChange={e => setRejectionReason(e.target.value)}
                              rows={2}
                              required
                            />
                          </div>
                          <div className="flex gap-2 justify-end mt-2">
                            <button
                              className="px-3 py-1 rounded bg-red-500 text-white font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                              disabled={!rejectionReason.trim()}
                              onClick={async () => {
                                if (!rejectionReason.trim()) return;
                                try {
                                  const res = await fetch('/api/transactions', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      id: tx._id,
                                      status: 'rejected',
                                      rejectedBy: auth?.id,
                                      rejectedReason: rejectionReason.trim(),
                                    }),
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    toast.dismiss(t);
                                    toast.success('Request rejected!');
                                    // Optionally refresh transactions
                                    const res = await fetch('/api/transactions');
                                    const data = await res.json();
                                    if (data.success) {
                                      setTransactions(data.data);
                                    }
                                  } else {
                                    toast.error(data.message || 'Failed to reject.');
                                  }
                                } catch (err) {
                                  toast.error('Failed to reject.');
                                }
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    }, { duration: 10000 });
                  }}
                >
                  <Ban className="w-4 h-4 mr-2" /> Reject
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [auth, formatCurrency, formatRequestedAt, setSelectedTransaction, setShowDetailModal, setTransactions, toast]);

  // TanStack Table instance
  const table = useReactTable({
    data: filteredTransactions,
    columns,
    state: { sorting, pagination, expanded },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: false,
    pageCount: Math.ceil(filteredTransactions.length / pagination.pageSize),
    getRowCanExpand: row => !!(row.original.vehicleMaintenance && row.original.vehicleMaintenance.length > 0),
  });

  return (
    <>
      {/* Filter Dropdown and Cash Accounts Badges in one line, responsive */}
      <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2 my-4 w-full">
        <div className="flex items-center gap-2 flex-shrink-0">
          <label className="font-semibold text-foreground mr-1">Status:</label>
          <div className="relative">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="rounded-md border border-border bg-muted text-muted-foreground px-4 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm font-semibold transition-all duration-150 pr-8"
            >
              {transactionStatusesModel.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
              <option value="all">All</option>
            </select>
            {/* Dropdown Icon */}
            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {cashAccounts.length > 0 && (
          <div className="flex flex-wrap gap-2 md:ml-4">
            {cashAccounts.map(account => (
              <span
                key={account._id}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 via-lime-100 to-emerald-100 text-[#02733E] px-4 py-2 rounded-full font-semibold shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg border border-green-200"
              >
                {/* Wallet Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#02733E" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 18.75v-12zM19.5 8.25h-15m0 0V18.75m0-10.5V4.5" />
                </svg>
                <span className="font-bold text-green-900">{account.name}</span>
                <span className="text-green-700 font-medium">&mdash; Balance: <span className="font-bold">${Number(account.balance).toLocaleString()}</span></span>
              </span>
            ))}
          </div>
        )}
        {/* Search input */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto mt-2 md:mt-0">
          <input
            type="text"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            className="border rounded px-2 py-1 min-w-[180px]"
          />
        </div>
      </div>
      {/* Transactions Table/List */}
      {loading ? (
        <div className="py-4">Loading transactions...</div>
      ) : error ? (
        <div className="text-red-600 py-4">{error}</div>
      ) : filteredTransactions.length === 0 ? (
        <div className="py-4">No transactions found.</div>
      ) : (
        <div className="overflow-x-auto mt-4">
          {/* Responsive Table: Table for md+ screens, Cards for <md */}
          <div className="hidden md:block">
            <div className="shadow-sm rounded-lg overflow-hidden border border-blue-100">
              <table className="min-w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="text-black font-bold bg-gray-100">
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="p-2 text-sm cursor-pointer select-none relative group border border-gray-600"
                          style={{ width: header.getSize(), minWidth: header.column.columnDef.minSize, maxWidth: header.column.columnDef.maxSize }}
                          onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                        >
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="ml-1">
                              {header.column.getIsSorted() === 'asc' ? '▲' : header.column.getIsSorted() === 'desc' ? '▼' : ''}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                {table.getRowModel().rows.map(row => (
              <React.Fragment key={row.id}>
                <tr
                  className={
                    `border border-border transition ` +
                    (row.getIsSelected()
                      ? 'bg-white'
                      : row.index % 2 === 0
                        ? 'bg-white'
                        : 'bg-[#F5F5F5] hover:bg-muted')
                  }
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="pl-1 align-bottom border border-gray-400">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                {row.getIsExpanded() && (
                  <tr>
                    <td colSpan={row.getVisibleCells().length} className="bg-white px-10">
                      
                      {Array.isArray(row.original.vehicleMaintenance) && row.original.vehicleMaintenance.length > 0 ? (
                        <div className="w-full overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200 bg-white font-[Roboto,Arial,sans-serif]">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-2 py-1 border border-gray-400 text-left">Plate</th>
                                <th className="px-2 py-1 border border-gray-400 text-left">Model</th>
                                <th className="px-2 py-1 border border-gray-400 text-left">Description</th>
                                <th className="px-2 py-1 border border-gray-400 text-left">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.original.vehicleMaintenance.map((vm, idx) => (
                                <tr key={vm._id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-2 py-1 border-r border-b border-gray-300">{vm.vehicleId?.plate || '-'}</td>
                                  <td className="px-2 py-1 border-r border-b border-gray-300">{vm.vehicleId?.model || '-'}</td>
                                  <td className="px-2 py-1 border-r border-b border-gray-300">{vm.description || '-'}</td>
                                  <td className="px-2 py-1 border-r border-b border-gray-300">{formatCurrency(vm.amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <span className="text-gray-500">No vehicle maintenance records.</span>
                      )}

                      {/* Custom expanded content for the row */}
                      <div className="mx-2 px-2 rounded-lg   flex flex-wrap gap-5 items-center ">
                        <div className="w-full mb-2 text-sm font-bold text-gray-700 flex items-center gap-2">
                          <span className="inline-block w-1.5 h-4 bg-primary rounded-full mr-2"></span>
                          {row.original.reason} 
                          <span className="inline-block w-1.5 h-4 bg-primary rounded-full mr-2"></span>
                          Quantity: {row.original.quantity}
                          <span className="inline-block w-1.5 h-4 bg-primary rounded-full mr-2"></span>
                          Suspence: {row.original.suspenceAmount}
                          <span className="inline-block w-1.5 h-4 bg-primary rounded-full mr-2"></span>
                          Return: {row.original.returnAmount}
                        </div>
                        
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
                </tbody>
              </table>
            </div>
            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  {'<<'}
                </button>
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {'<'}
                </button>
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {'>'}
                </button>
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  {'>>'}
                </button>
                <span className="ml-2">
                  Page{' '}
                  <strong>
                    {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </strong>
                </span>
              </div>
              <div>
                <select
                  className="border rounded px-2 py-1"
                  value={table.getState().pagination.pageSize}
                  onChange={e => table.setPageSize(Number(e.target.value))}
                >
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {/* Card layout for small screens */}
          <div className="md:hidden flex flex-col gap-4">
            {table.getRowModel().rows.map(row => (
              <div key={row.id} className="bg-white rounded-lg shadow-sm border border-blue-100 p-4 flex flex-col gap-2">
                {/* Expand button for mobile */}
                {row.original.vehicleMaintenance && row.original.vehicleMaintenance.length > 0 && (
                  <button
                    className="self-end text-blue-600 hover:text-blue-900 focus:outline-none mb-2"
                    onClick={() => row.toggleExpanded()}
                    aria-label={row.getIsExpanded() ? 'Collapse' : 'Expand'}
                  >
                    {row.getIsExpanded() ? '▼ Hide Details' : '▶ Show Details'}
                  </button>
                )}
                {row.getVisibleCells().map(cell => (
                  <div key={cell.id} className="flex flex-col mb-2">
                    <span className="text-xs font-semibold text-gray-500 mb-1">
                      {cell.column.columnDef.header}
                    </span>
                    <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                  </div>
                ))}
                {/* Expanded vehicleMaintenance for mobile */}
                {row.getIsExpanded() && row.original.vehicleMaintenance && row.original.vehicleMaintenance.length > 0 && (
                  <div className="mt-2 bg-blue-50 rounded-lg p-2">
                    <div className="font-semibold text-blue-900 mb-1">Vehicle Maintenance</div>
                    <table className="min-w-[300px] w-full text-xs border border-blue-100 rounded-lg">
                      <thead>
                        <tr className="bg-blue-100 text-blue-900">
                          <th className="px-2 py-1 text-left">Vehicle ID</th>
                          <th className="px-2 py-1 text-left">Description</th>
                          <th className="px-2 py-1 text-left">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {row.original.vehicleMaintenance.map(vm => (
                          <tr key={vm._id} className="border-b last:border-b-0">
                            <td className="px-2 py-1 font-mono text-blue-800">
                              {vm.vehicleId && typeof vm.vehicleId === 'object' ? (
                                <>
                                  <span>{vm.vehicleId.plate}</span>
                                  {vm.vehicleId.model && (
                                    <span className="text-xs text-gray-500 ml-1">({vm.vehicleId.model})</span>
                                  )}
                                </>
                              ) : (
                                vm.vehicleId
                              )}
                            </td>
                            <td className="px-2 py-1">{vm.description}</td>
                            <td className="px-2 py-1 text-green-700 font-semibold">{formatCurrency ? formatCurrency(vm.amount) : vm.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
            {/* Pagination controls for mobile */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  {'<<'}
                </button>
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {'<'}
                </button>
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {'>'}
                </button>
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  {'>>'}
                </button>
                <span className="ml-2">
                  Page{' '}
                  <strong>
                    {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </strong>
                </span>
              </div>
              <div>
                <select
                  className="border rounded px-2 py-1"
                  value={table.getState().pagination.pageSize}
                  onChange={e => table.setPageSize(Number(e.target.value))}
                >
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionTable;