import React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import ApproveButton from '@/components/butons/ApproveButton';
import RejectButton from '@/components/butons/RejectButton';
import ViewMoreButton from '@/components/butons/ViewMoreButton';
import PrintButton from '@/components/toasts/print';
import { RequireRole } from '@/lib/roles';

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
      header: 'To / Reason',
      accessorKey: 'toReason',
      enableSorting: false,
      cell: ({ row }) => (
        <>
          <div><span className="font-semibold">To:</span> {row.original.to || '-'}</div>
          <div><span className="font-semibold">Reason:</span> {row.original.reason || '-'}</div>
        </>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ row }) => (
        typeof (row.original.amount || row.original.suspenceAmount) === 'number' ? (
          <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full font-semibold">
            {formatCurrency(row.original.amount || row.original.suspenceAmount)}
          </span>
        ) : '-'
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
      cell: ({ row }) => (
        row.original.type === 'receipt_payment' ? 'Cash Payment' : row.original.type === 'suspence_payment' ? 'Suspence Payment' : row.original.type
      ),
    },
    {
      header: 'Requested By',
      accessorKey: 'requestedBy',
      cell: ({ row }) => row.original.requestedBy?.name || '-',
      sortingFn: (a, b) => {
        const aName = a.original.requestedBy?.name || '';
        const bName = b.original.requestedBy?.name || '';
        return aName.localeCompare(bName);
      },
    },
    {
      header: 'Requested At',
      accessorKey: 'requestedAt',
      cell: ({ row }) => formatRequestedAt(row.original.requestedAt),
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
      cell: ({ row }) => {
        const tx = row.original;
        return (
          <div className="flex flex-row gap-2">
            <div className="relative group">
              <ViewMoreButton
                onView={() => { setSelectedTransaction(tx); setShowDetailModal(true); }}
              />
              <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-blue-600 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-10 whitespace-nowrap">
                View Detail
              </span>
            </div>
            {tx.status !== 'approved' && (
              <div className="relative group">
                <RequireRole roles={["purchaser", "admin"]}>
                <ApproveButton
                  onApprove={() => {
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
                />
                </RequireRole>
                <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-green-600 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-10 whitespace-nowrap">
                  Approve
                </span>
              </div>
            )}
            {tx.status !== 'rejected' && (
              <div className="relative group">
                <RejectButton
                  onReject={() => {
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
                />
                <span className="absolute left-1/2 -translate-x-1/2 -top-8 bg-red-600 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-10 whitespace-nowrap">
                  Reject
                </span>
              </div>
            )}
          </div>
        );
      },
    },
  ], [auth, formatCurrency, formatRequestedAt, setSelectedTransaction, setShowDetailModal, setTransactions, toast]);

  // TanStack Table instance
  const table = useReactTable({
    data: filteredTransactions,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    pageCount: Math.ceil(filteredTransactions.length / pagination.pageSize),
  });

  return (
    <>
      {/* Filter Dropdown and Cash Accounts Badges in one line, responsive */}
      <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2 my-4 w-full">
        <div className="flex items-center gap-2 flex-shrink-0">
          <label>Status:</label>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {transactionStatusesModel.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
            <option value="all">All</option>
          </select>
        </div>
        {cashAccounts.length > 0 && (
          <div className="flex flex-wrap gap-2 md:ml-4">
            {cashAccounts.map(account => (
              <span key={account._id} className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-semibold">
                {account.name} &mdash; Balance: {account.balance}
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
            <table className="min-w-full border text-sm">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="bg-gray-100">
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-2 py-1 border cursor-pointer select-none"
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
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-2 py-1 border">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
              <div key={row.id} className="bg-white rounded shadow border p-4 flex flex-col gap-2">
                {row.getVisibleCells().map(cell => (
                  <div key={cell.id} className="flex flex-col mb-2">
                    <span className="text-xs font-semibold text-gray-500 mb-1">
                      {cell.column.columnDef.header}
                    </span>
                    <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                  </div>
                ))}
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