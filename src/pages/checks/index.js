import React, { useEffect, useState, useMemo } from "react";
import { banks, checkTypes } from "@/lib/constants";
import { toWords } from "number-to-words";
import { useRouter } from "next/router";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRequireRole } from '@/lib/roles';
import CheckPayModal from '@/components/checks/CheckPayModal';
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
} from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Ellipsis, Eye, NotebookPen, Printer, SquareCheck, X, Check } from "lucide-react";

function formatCurrency(amount) {
  if (typeof amount !== "number") return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatRequestedAt(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
    .replace(/\./g, ""); // Remove dot from short month if present
}
// Utility to capitalize the first letter of every word
function capitalizeWords(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Utility to convert birr and cents to words
function birrToWords(amount) {
  const [birr, cents] = Number(amount).toFixed(2).split(".");
  let words = capitalizeWords(toWords(Number(birr))) + " Birr";
  if (Number(cents) > 0) {
    words += " and " + capitalizeWords(toWords(Number(cents))) + " Cents";
  }
  words += " Only";
  return words;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ChecksPage() {

  const router = useRouter();
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing, setColumnSizing] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState("approved");
    
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');
    
  const [selectedCashAccount, setSelectedCashAccount] = useState('');
  const [cashAccounts, setCashAccounts] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    async function fetchChecks() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/report/paymentReport?type=check_payment`);
        const data = await res.json();
        if (res.ok && data.success) {
          setChecks(data.data);
        } else {
          setError(data.message || "Failed to fetch check requests.");
        }
      } catch (err) {
        setError("Failed to fetch check requests.");
      }
      setLoading(false);
    }
    fetchChecks();
  }, []);



  const columns = useMemo(() => [
    {
      header: "To",
      accessorKey: "to",        
      enableResizing: true,
      cell: (info) => {
        const value = info.row.original.to || "-";
        return value.length > 20 ? (
          <span title={value}>{value.slice(0, 17) + "..."}</span>
        ) : (
          value
        );
      },
    },
    {
      header: "Reason",
      accessorKey: "reason",
      enableResizing: true,
      cell: (info) => {
        const value = info.row.original.reason || "-";
        return value.length > 20 ? (
          <span title={value}>{value.slice(0, 17) + "..."}</span>
        ) : (
          value
        );
      },
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (info) => (
        <span className="font-bold text-[#02733E]">
          {formatCurrency(
            info.row.original.amount || info.row.original.suspenceAmount
          )}
        </span>
      ),
      enableResizing: true,
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: (info) => info.row.original.quantity || "-",
      enableResizing: true,
    },

    // {
    //   header: "Requested At",
    //   accessorKey: "requestedAt",

    //   cell: (info) => formatRequestedAt(info.row.original.requestedAt),
    //   enableResizing: true,
    // },

    
    {
      header: "Reference",
      accessorKey: "recept_reference",
      cell: (info) => {
        if (editingRowId === info.row.original._id) {
          return (
            <input
              className="border-green-600 border-2 rounded px-1 py-0.5 w-full"
              value={editValues.recept_reference || ""}
              onChange={e => setEditValues(v => ({ ...v, recept_reference: e.target.value }))}
            />
          );
        }
        return (
          <div>{info.row.original.recept_reference ?? ""}</div>
        );
      },
      enableResizing: true,
    },
    {
      header: "CPV",
      accessorKey: "checkSerialNumber",

      cell: (info) => (
        <div>
          <div>{String(info.row.original.checkSerialNumber).padStart(6,'0') ?? ""}</div>
        </div>
      ),
      enableResizing: true,
    },
    {
      header: "Requested By",
      accessorKey: "requestedBy",

      cell: (info) => info.row.original.requestedBy?.name || "-",
      enableResizing: true,
    },

    {
      header: "Status",
      accessorKey: "status",
      cell: (info) => (
        
          <span>
            {info.row.original.checkRequestId ? info.row.original.checkRequestId.status : info.row.original.status}
          </span>
      ),
      enableResizing: true,
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (info) => {
        const isEditing = editingRowId === info.row.original._id;
        return isEditing ? (
          <div className="flex gap-2">
            <button
              className="p-1 rounded bg-green-500 text-white hover:bg-green-600"
              onClick={async () => {
                try {
                  const res = await fetch(`/api/checkTransaction/checkPrepare/${info.row.original._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ recept_reference: editValues.recept_reference }),
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    toast.success("Transaction Paid Successfully.");
                    setChecks(checks => checks.map(c => c._id === info.row.original._id ? { ...c, recept_reference: editValues.recept_reference, status: "paid" } : c));
                    setEditingRowId(null);
                  } else {
                    toast.error(data.message || "Failed to update.");
                  }
                } catch (err) {
                  toast.error("Failed to update.");
                }
              }}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              className="p-1 rounded bg-red-500 text-white hover:bg-red-600"
              onClick={() => setEditingRowId(null)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 rounded hover:bg-muted transition cursor-pointer"
                title="Actions"
              >
                <Ellipsis />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              { info.row.original.checkRequestId?.status == "prepared" && (
                <DropdownMenuItem
                  onClick={() => {
                    setEditingRowId(info.row.original._id);
                    setEditValues({
                      recept_reference: info.row.original.recept_reference,
                    });
                  }}
                >
                  <SquareCheck enableBackground={true} color="green" className="w-4 h-4 mr-2 " /> <span className="text-green-600 font-semibold"> Pay</span>
                </DropdownMenuItem>
              )}
            
                
                { info.row.original.type == "check_payment" && (
                    <DropdownMenuItem
                        onClick={() => router.push(`/checks/${info.row.original._id}`)}
                    >
                      <NotebookPen  className="w-4 h-4 mr-2" /> {info.row.original.checkRequestId?.status == "prepared" ? "Edit" : "Prepare"}
                    </DropdownMenuItem>
                  )}
                
                
               
              <DropdownMenuItem
                onClick={() => {
                  window.open(
                    `/transactions/${info.row.original._id}`,
                    "_blank"
                  );
                }}
              >
                <Eye className="w-4 h-4 mr-2" /> View Detail
              </DropdownMenuItem>
              
                <DropdownMenuItem
                  onClick={() =>
                    window.open(
                      `/checks/invoice/${info.row.original._id}`,
                      "_blank"
                    )
                  }
                >
                  <Printer className="w-4 h-4 mr-2" /> Print Invoice
                </DropdownMenuItem>
             
             
       
              
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableResizing: false,
    },
  ], [editingRowId, editValues]);

  const table = useReactTable({
    data: checks,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnSizing,
      rowSelection,
      expanded,
    },
    onSortingChange: setSorting,
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
    enableRowSelection: true,
    enableColumnResizing: true,
    getRowCanExpand: () => true,
    getRowId: row => row._id,
  });

  useEffect(() => {
    async function fetchCashAccounts() {
      try {
        const res = await fetch('/api/cash');
        const data = await res.json();
        setCashAccounts(data);
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchCashAccounts();
  }, []);

  // Handler for status change (calls backend API)
  

  return (
    <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2 my-4 w-full">
            <div className="flex items-center gap-2 flex-shrink-0">
          <label className="font-semibold text-foreground mr-1">Status</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-border bg-muted text-muted-foreground px-4 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm font-semibold transition-all duration-150"
          >
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="suspence">Suspence</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>

      </div>
     <table className="w-full text-sm text-foreground font-[Roboto,Arial,sans-serif] p-1">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className=" text-black font-bold bg-gray-100"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="p-2 text-sm cursor-pointer select-none relative group border border-gray-600 "
                  style={{
                    width: header.getSize(),
                    minWidth: header.column.columnDef.minSize,
                    maxWidth: header.column.columnDef.maxSize,
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: " ▲",
                      desc: " ▼",
                    }[header.column.getIsSorted()] ?? null}
                  </div>
                  {/* Resizer */}
                  {header.column.getCanResize() && (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none group-hover:bg-muted transition"
                      style={{ userSelect: "none", touchAction: "none" }}
                    />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.original._id}>
              <tr
                className={
                  `border border-border transition ` +
                  (row.getIsSelected()
                    ? "bg-white"
                    : row.index % 2 === 0
                    ? "bg-white"
                    : "bg-[#F5F5F5] hover:bg-muted")
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="pl-1 align-bottom border border-gray-400"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2 mt-4 flex-wrap bg-card border border-border rounded-md shadow-sm px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            className="h-8 w-8 flex items-center justify-center border border-border rounded-md bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            {"<<"}
          </button>
          <button
            className="h-8 w-8 flex items-center justify-center border border-border rounded-md bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            {"<"}
          </button>
          <button
            className="h-8 w-8 flex items-center justify-center border border-border rounded-md bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            {">"}
          </button>
          <button
            className="h-8 w-8 flex items-center justify-center border border-border rounded-md bg-background text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            {">>"}
          </button>
        </div>
        <span className="ml-2 text-sm">
          Page{" "}
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="text-sm">
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
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
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="border border-border bg-background rounded-md px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ml-2"
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
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
    </div>
  );
}