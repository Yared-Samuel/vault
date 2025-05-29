import { useContext, useState, useEffect, useMemo } from "react";
import AuthContext from "../context/AuthProvider";
import useRedirectLoggedOutUser from "@/lib/redirect";
import { Button } from "@/components/ui/button";
import TransactionRequestform from '@/components/TransactionRequestform';
import { useRouter } from 'next/router';
import { BadgeSecondary } from '@/components/ui/badge';
import { Eye, X, CreditCard, Ban, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import React from 'react';
import TransactionDetailModal from '@/components/cash/TransactionDetailModal';
import PayModal from '@/components/cash/PayModal';
import RejectButton from '@/components/toasts/reject';
import ApproveButton from '@/components/toasts/approve';
import PayButton from '@/components/toasts/pay';
import CheckButton from '@/components/toasts/check';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  flexRender,
  getExpandedRowModel,
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
import { Badge } from '@/components/ui/badge';
import RejectModal from '@/components/cash/RejectModal';
import SuspenceModal from "@/components/cash/SuspenceModal";
// import { hasRole, useRequireRole } from '@/lib/roles';

// Debounce utility
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function CashPage() {
  useRedirectLoggedOutUser();
  const { auth } = useContext(AuthContext);
  const router = useRouter();
  // const isAuthorized = useRequireRole(['admin', 'accountant']);

  // // Role-based access: only accountant and admin
  // useEffect(() => {
  //   if (auth && !hasRole(auth, [ 'admin', 'accountant'])) {
  //     router.replace('/unauthorized');
  //   }
  // }, [auth, router]);

  // if (!isAuthorized) {
  //   return <div className="text-center text-red-600 font-bold text-xl mt-10">Not authorized</div>;
  // }

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [cashAccounts, setCashAccounts] = useState([]);
  const [payModal, setPayModal] = useState({ open: false, tx: null });
  const [suspenceModal, setSuspenceModal] = useState({ open: false, tx: null });
  const [selectedCashAccount, setSelectedCashAccount] = useState('');
  const [filter, setFilter] = useState('approved');

  // TanStack Table feature states
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing, setColumnSizing] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const [globalFilterInput, setGlobalFilterInput] = useState('');
  const debouncedGlobalFilter = useDebouncedValue(globalFilterInput, 300);

  const [expanded, setExpanded] = useState({});

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTx, setRejectTx] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/transactions?populateVehicle=1');
        const data = await res.json();
        if (data.success) {
          setTransactions(data.data);
        } else {
          setError(data.message || 'Failed to fetch transactions.');
        }
      } catch (err) {
        setError('Failed to fetch transactions.');
      }
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
    const fetchCashAccounts = async () => {
      try {
        const res = await fetch('/api/cash');
        const data = await res.json();
        setCashAccounts(data);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchCashAccounts();
  }, []);

  function formatCurrency(amount) {
    if (typeof amount !== 'number') return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  function formatRequestedAt(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    }).replace(/\./g, ''); // Remove dot from short month if present
  }

  // Calculate counts for Suspence and Pending
  const suspenceCount = transactions.filter(tx => tx.status === 'suspence').length;
  const pendingCount = transactions.filter(tx => tx.status === 'approved').length;

  // Memoize filteredTransactions
  const filteredTransactions = useMemo(() =>
    transactions.filter(tx => filter === 'all' || tx.status === filter),
    [transactions, filter]
  );

  // Memoize columns
  const columns = useMemo(() => {
    // Expander column first
    const expanderCol = {
      id: 'expander',
      header: () => null,
      cell: ({ row }) =>
        row.getCanExpand() ? (
          <button
            onClick={row.getToggleExpandedHandler()}
            className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted transition"
            title={row.getIsExpanded() ? 'Collapse' : 'Expand'}
          >
            {row.getIsExpanded() ? '▼' : '▶'}
          </button>
        ) : null,
      size: 32,
      minSize: 32,
      maxSize: 32,
      enableResizing: false,
    };
    // The rest of your columns
    const rest = [
      {
        header: 'To',
        accessorKey: 'to',
        
        enableResizing: true,
      },
      {
        header: 'Amount',
        accessorKey: 'amount',
        cell: info => (
          <span className="font-bold text-green-700">
            {formatCurrency(info.row.original.amount || info.row.original.suspenceAmount)}
          </span>
        ),
        enableResizing: true,
      },
      
      {
        header: 'Requested By',
        accessorKey: 'requestedBy',
        cell: info => info.row.original.requestedBy?.name || '-',
        enableResizing: true,
      },
      
      {
        header: 'Date',
        accessorKey: 'requestedAt',
        cell: info => formatRequestedAt(info.row.original.requestedAt),
        enableResizing: true,
      },
      
      {
        header: 'Type / Ref',
        accessorKey: 'typeRef',
        cell: info => (
          <div>
            <div>{info.row.original.type === 'receipt_payment'
              ? 'Cash Payment'
              : info.row.original.type === 'suspence_payment'
              ? 'Suspence Payment'
              : info.row.original.type}
              </div>
            <div>{info.row.original.recept_reference ?? ''}</div>
        </div>
        ),
        enableResizing: true,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: info => (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            info.row.original.status === 'paid'
              ? 'bg-green-100 text-green-700'
              : info.row.original.status === 'rejected'
              ? 'bg-rose-100 text-rose-600'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {info.row.original.status}
          </span>
        ),
        enableResizing: true,
      },
      {
        header: 'Actions',
        accessorKey: 'actions',
        cell: info => (
          <div className="flex gap-1">
            <button
              className="bg-gray-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow hover:scale-110 hover:shadow-lg transition cursor-pointer hover:bg-gray-800"
              title="View Detail"
              onClick={() => {
                setSelectedTransaction(info.row.original);
                setShowDetailModal(true);
              }}
            >
              <Eye className="w-4 h-4" />
            </button>
            {info.row.original.status === 'paid' && (
              <button
                className="ml-2 bg-gray-100 text-gray-700 border border-gray-300 w-6 h-6 rounded-full flex items-center justify-center shadow cursor-pointer hover:bg-gray-500 hover:text-white hover:scale-110 hover:shadow-lg transition"
                title="Print Invoice"
                onClick={() => {
                  window.open(`/cash/invoice/${info.row.original._id}`, '_blank');
                }}
              >
                <Printer className="w-4 h-4" />
              </button>
            )}
            
            {info.row.original.status !== 'paid' && (
              <>
                {info.row.original.type !== 'check_payment' && (
                  <button
                    onClick={() => {
                      setPayModal({ open: true, tx: info.row.original });
                      setSelectedCashAccount('');
                    }}
                    className="ml-2 text-xs bg-green-100 text-green-700 border border-green-300  w-6 h-6 rounded-full flex items-center justify-center shadow cursor-pointer hover:bg-green-500 hover:text-white hover:scale-110 hover:shadow-lg transition"
                    title="Pay"
                  >
                    {/* <CreditCard className="w-5 h-5" /> */}
                    PAY
                  </button>
                )}
                {info.row.original.type === 'suspence_payment' && info.row.original.status == 'approved' && (
                  <button
                    onClick={() => {
                      setSuspenceModal({ open: true, tx: info.row.original });
                      setSelectedCashAccount('');
                    }}
                    className="ml-1 px-2 py-0.5 text-[11px] font-semibold uppercase bg-emerald-600 text-white border border-emerald-700 rounded-md shadow-sm cursor-pointer hover:bg-emerald-700 hover:text-gray-100 hover:border-emerald-800 transition"
                    title="Pay"
                  >
                    {/* <CreditCard className="w-5 h-5" /> */}
                    SUS
                  </button>
                )}
                {info.row.original.type === 'suspence_payment' && info.row.original.status == 'suspence' && (
                  <button
                    onClick={() => {
                      toast.success('Print Suspence?', {
                        action: {
                          label: 'Print Invoice (Copy)',
                          onClick: () => window.open( `/cash/suspenceInvoice/${info.row.original._id}`, '_blank'),
                        },
                      });
                    }}
                    className="ml-1 px-2 py-0.5 text-[11px] font-semibold uppercase bg-emerald-600 text-white border border-emerald-700 rounded-md shadow-sm cursor-pointer hover:bg-emerald-700 hover:text-gray-100 hover:border-emerald-800 transition"
                    title="Pay"
                  >
                    {/* <CreditCard className="w-5 h-5" /> */}
                    Print
                  </button>
                )}
                {info.row.original.type !== 'check_payment' && info.row.original.type !== 'suspence_payment' && (
                  <CheckButton
                    onCheck={() => {
                      toast((t) => (
                        <div className="bg-white rounded-xl shadow-lg p-4 min-w-[320px] max-w-xs border border-gray-200">
                          <div className="font-semibold text-gray-800 mb-2">Are you sure you want to convert this transaction to check payment?</div>
                          <div className="flex gap-2 justify-end mt-2">
                            <button
                              className="px-3 py-1 rounded bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300"
                              onClick={() => toast.dismiss(t)}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-3 py-1 rounded bg-blue-500 text-white font-semibold hover:bg-blue-700"
                              onClick={async () => {
                                try {
                                  const res = await fetch('/api/cashToCheck', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ transactionId: info.row.original._id }),
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    toast.dismiss(t);
                                    toast.success('Transaction converted to check payment!');
                                    // Refresh transactions
                                    const txRes = await fetch('/api/transactions?populateVehicle=1');
                                    const txData = await txRes.json();
                                    // if (txData.success) setTransactions(txData.data);
                                  } else {
                                    toast.error(data.message || 'Failed to convert to check payment.');
                                  }
                                } catch (err) {
                                  toast.error('Failed to convert to check payment.');
                                }
                              }}
                            >
                              Yes
                            </button>
                          </div>
                        </div>
                      ), { duration: 10000 });
                    }}
                    className="ml-2"
                    title="Convert to Check Payment"
                  />
                )}
                {info.row.original.type !== 'check_payment' && (
                  <button
                    onClick={() => {
                      setRejectTx(info.row.original);
                      setShowRejectModal(true);
                    }}
                    className="ml-2 bg-rose-100 text-rose-600 border border-rose-300  w-6 h-6 rounded-full flex items-center justify-center shadow cursor-pointer hover:bg-rose-500 hover:text-white hover:scale-110 hover:shadow-lg transition"
                    title="Reject"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        ),
        enableResizing: false,
      },
    ];
    return [expanderCol, ...rest];
  }, [auth]);

  // Table instance
  const table = useReactTable({
    data: filteredTransactions,
    columns,
    state: {
      sorting,
      globalFilter: debouncedGlobalFilter,
      columnVisibility,
      columnSizing,
      rowSelection,
      expanded,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilterInput,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      // Fuzzy search for all columns
      return Object.values(row.original).some(value =>
        rankItem(String(value ?? ''), filterValue).passed
      );
    },
    enableRowSelection: true,
    enableColumnResizing: true,
    getRowCanExpand: () => true,
  });

  return (
    <div className="flex flex-col w-full">
      
      {/* Status Filter and Cash Accounts Badges */}
      <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2 my-4 w-full">
        <div className="flex items-center gap-2 flex-shrink-0">
          <label className="font-semibold text-foreground mr-1">Filter</label>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="rounded-md border border-border bg-muted text-muted-foreground px-4 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm font-semibold transition-all duration-150"
          >
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="suspence">Suspence</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
                          </div>
        {/* All badges in one right-aligned row */}
        <div className="flex flex-wrap gap-2 items-center justify-end w-full mt-2 md:mt-0">
          <span className="inline-block bg-muted text-muted-foreground font-semibold px-3 py-1 rounded-full border border-border">
            Suspence {suspenceCount}
          </span>
          <span className="inline-block bg-muted text-muted-foreground font-semibold px-3 py-1 rounded-full border border-border">
            Pending {pendingCount}
          </span>
          {cashAccounts.length > 0 && cashAccounts.map(account => (
            <span
              key={account._id}
              className="inline-block bg-muted text-muted-foreground font-semibold px-3 py-1 rounded-full border border-border"
            >
              {account.name} &mdash; Balance: {account.balance}
            </span>
          ))}
                          </div>
                          </div>
      {/* Global Search and Column Visibility Controls */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <input
          value={globalFilterInput}
          onChange={e => setGlobalFilterInput(e.target.value)}
          placeholder="Search all columns..."
          className="border border-border bg-background rounded-md px-2 py-1 text-sm w-64 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="flex flex-wrap gap-2 items-center">
          {table.getAllLeafColumns().map(column => (
            column.id !== 'select' && (
              <label key={column.id} className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                  className="accent-blue-500 focus-visible:ring-2 focus-visible:ring-ring"
                />
                {column.columnDef.header}
              </label>
            )
          ))}
                            </div>
                          </div>
      {/* Loading indicator */}
      {loading && (
        <div className="w-full flex justify-center items-center py-8">
          <span className="text-blue-500 font-semibold">Loading transactions...</span>
        </div>
      )}
      {/* Table with shadcn/ui theme */}
      <div className="overflow-x-auto mt-2 bg-card border border-border rounded-lg shadow-sm px-4 py-2">
        <table className="min-w-[900px] w-full text-sm text-foreground">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-muted text-muted-foreground font-semibold">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="p-0 cursor-pointer select-none relative group border-b border-border"
                    style={{ width: header.getSize(), minWidth: header.column.columnDef.minSize, maxWidth: header.column.columnDef.maxSize }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' ▲',
                        desc: ' ▼',
                      }[header.column.getIsSorted()] ?? null}
                          </div>
                    {/* Resizer */}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none group-hover:bg-muted transition"
                        style={{ userSelect: 'none', touchAction: 'none' }}
                      />
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
                    `border-b border-border transition ` +
                    (row.getIsSelected()
                      ? 'bg-accent'
                      : row.index % 2 === 0
                        ? 'bg-card'
                        : 'bg-muted/60 hover:bg-muted')
                  }
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-0">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                {row.getIsExpanded() && (
                  <tr>
                    <td colSpan={row.getVisibleCells().length} className="bg-muted/50 p-2">
                      {/* Custom expanded content for the row */}
                      <div className="my-2 mx-2 p-4 rounded-lg bg-white shadow border flex flex-wrap gap-3 items-center min-h-[56px]">
                        <div className="w-full mb-2 text-sm font-bold text-gray-700 flex items-center gap-2">
                          <span className="inline-block w-1.5 h-4 bg-primary rounded-full mr-2"></span>
                          Transaction Details
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-200"><span className="font-semibold">Plate:</span> {row.original.vehicleId?.plate || '-'}</Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-200"><span className="font-semibold">Reason:</span> {row.original.reason || '-'}</Badge>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border border-yellow-200"><span className="font-semibold">Quantity:</span> {row.original.quantity || '-'}</Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border border-purple-200"><span className="font-semibold">Date:</span> {formatRequestedAt(row.original.requestedAt)}</Badge>
                        <Badge variant="secondary" className="bg-pink-100 text-pink-800 border border-pink-200"><span className="font-semibold">Suspence:</span> {row.original.suspenceAmount ?? '-'}</Badge>
                        <Badge variant="secondary" className="bg-red-100 text-red-800 border border-red-200"><span className="font-semibold">Return:</span> {row.original.returnAmount ?? '-'}</Badge>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
              </div>
      {/* Pagination Controls with shadcn/ui theme */}
      <div className="flex items-center gap-2 mt-4 flex-wrap bg-card border border-border rounded-md shadow-sm px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            className="h-8 w-8 flex items-center justify-center border border-border rounded-md bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            {'<<'}
          </button>
          <button
            className="h-8 w-8 flex items-center justify-center border border-border rounded-md bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            {'<'}
          </button>
          <button
            className="h-8 w-8 flex items-center justify-center border border-border rounded-md bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            {'>'}
          </button>
          <button
            className="h-8 w-8 flex items-center justify-center border border-border rounded-md bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            {'>>'}
          </button>
            </div>
        <span className="ml-2 text-sm">
          Page <strong>{table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</strong>
        </span>
        <span className="text-sm">
          | Go to page:{' '}
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border border-border bg-background rounded-md w-12 px-1 py-0.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ml-1"
            min={1}
            max={table.getPageCount()}
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
          className="border border-border bg-background rounded-md px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ml-2"
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
        {/* Row selection summary */}
        <span className="ml-4 text-xs text-muted-foreground">
          {Object.keys(rowSelection).length} row(s) selected
        </span>
      </div>

      {/* Pay Modal */}
      <PayModal
        open={payModal.open}
        tx={payModal.tx}
        cashAccounts={cashAccounts}
        selectedCashAccount={selectedCashAccount}
        
        onAccountChange={e => setSelectedCashAccount(e.target.value)}
        onClose={() => {
          setPayModal({ open: false, tx: null });
          setSelectedCashAccount('');
        }}
        onPay={async (fields = {}) => {
          try {
            let body = {
              transactionId: payModal.tx._id,
              cashAccountId: selectedCashAccount,
              type: payModal.tx.type,
              recept_reference: fields.recept_reference,
            };
            if (payModal.tx.type === 'receipt_payment') {
              body.relatedReceiptUrl = fields.relatedReceiptUrl;
            } else if (payModal.tx.type === 'suspence_payment') {
              const suspenceAmount = payModal.tx.suspenceAmount || 0;
              const returnAmount = Number(fields.returnAmount) || 0;
              body.returnAmount = returnAmount;
              body.reasonTo = fields.reasonTo;
              body.relatedReceiptUrl = fields.relatedReceiptUrl;
              body.amount = suspenceAmount - returnAmount;
            }
            const res = await fetch('/api/cash', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
              window.open(`/cash/invoice/${payModal.tx._id}?original=1`, '_blank');
              toast.success('Payment successful!', {
                action: {
                  label: 'Print Invoice (Copy)',
                  onClick: () => window.open(`/cash/invoice/${payModal.tx._id}`, '_blank'),
                },
              });
              setPayModal({ open: false, tx: null });
              setSelectedCashAccount('');
              // Refresh transactions and cash accounts
              const txRes = await fetch('/api/transactions');
              const txData = await txRes.json();
              if (txData.success) setTransactions(txData.data);
              const caRes = await fetch('/api/cash');
              const caData = await caRes.json();
              setCashAccounts(caData);
            } else {
              toast.error(data.error || 'Payment failed.');
            }
          } catch (err) {
            toast.error('Payment failed.');
          }
        }}
        payDisabled={!selectedCashAccount}
      />

      <SuspenceModal
        open={suspenceModal.open}
        tx={suspenceModal.tx}
        cashAccounts={cashAccounts}
        selectedCashAccount={selectedCashAccount}
        onAccountChange={e => setSelectedCashAccount(e.target.value)}
        onClose={() => {
          setSuspenceModal({ open: false, tx: null });
          setSelectedCashAccount('');
        }}
        onSuspence={async (fields = {}) => {
          console.log('SuspenceModal fields:', fields);
          try {
            let body = {
              transactionId: suspenceModal.tx._id,
              cashAccountId: selectedCashAccount,
              amount:  fields.newSuspenceAmount,
              reason: fields.reason,
            }
            console.log(body);
            const res = await fetch('/api/suspence', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
              window.open(`/cash/suspenceInvoice/${suspenceModal.tx._id}`, '_blank');
              toast.success('Suspence payment successful!', {
                action: {
                  label: 'Print Invoice (Copy)',
                  onClick: () => window.open( `/cash/suspenceInvoice/${suspenceModal.tx._id}`, '_blank'),
                },
              });
              setSuspenceModal({ open: false, tx: null });
              setSelectedCashAccount('');
              // Refresh transactions and cash accounts
              const txRes = await fetch('/api/transactions');
              const txData = await txRes.json();
              if (txData.success) setTransactions(txData.data);
              const caRes = await fetch('/api/cash');
              const caData = await caRes.json();
              setCashAccounts(caData);
            }
          } catch (error) {
            toast.error('Suspence payment failed.');
          }
        }}
      />

      {/* Reject Modal */}
      <RejectModal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        transaction={rejectTx}
        onSubmit={async (rejectionReason) => {
          try {
            const res = await fetch('/api/transactions', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: rejectTx._id,
                status: 'rejected',
                rejectedBy: auth?.id,
                rejectedReason: rejectionReason.trim(),
              }),
            });
            const data = await res.json();
            if (data.success) {
              setShowRejectModal(false);
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
      />

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        open={showDetailModal}
        transaction={selectedTransaction}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
} 