import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { transactionTypes, transactionStatusesModel, paymentTypesModel } from '@/lib/constants';

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
  import { rankItem } from "@tanstack/match-sorter-utils";
import { Eye, FilePlus, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast, Toaster } from 'sonner';

const PaymentReport = () => {
    const [filters, setFilters] = useState({
        paymentType: '',
        status: '',
        type: '',
        startDate: '',
        endDate: '',
        serialNumber: '',
        isPiticash: true,
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sorting, setSorting] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [columnSizing, setColumnSizing] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });

    function formatCurrency(amount) {
        if (typeof amount !== "number") return "-";
        return new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: true,
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

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        if(filters.startDate && !filters.endDate){
            toast.warning("Please select end date");
            setLoading(false);
            return;
        }else if(!filters.startDate && filters.endDate){
            toast.warning("Please select start date");
            setLoading(false);
            return;
        }
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/report/paymentReport?${queryParams}`);
            const result = await response.json();
            if (result.success) {
                setTransactions(result.data);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to fetch report.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const columns =
        [
          {
            header: "To",
            accessorKey: "to",        
            enableResizing: true,
            size: 250,
            // cell: (info) => {
            //   const value = info.row.original.to || "-";
            //   return value.length > 20 ? (
            //     <span title={value}>{value.slice(0, 25) + "..."}</span>
            //   ) : (
            //     value
            //   );
            // },
          },
          {
            header: "Reason",
            accessorKey: "reason",
            enableResizing: true,
            size: 300,
            // cell: (info) => {
            //   const value = info.row.original.reason || "-";
            //   return value.length > 20 ? (
            //     <span title={value}>{value.slice(0, 17) + "..."}</span>
            //   ) : (
            //     value
            //   );
            // },
          },
          {
            header: "Amount",
            accessorKey: "amount",
            size: 120,
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
            header: "Date",
            accessorKey: "requestedAt",
            size: 100,
    
            cell: (info) => formatRequestedAt(info.row.original.requestedAt),
            enableResizing: true,
          },          
          {
            header: "Reference",
            accessorKey: "recept_reference",
            size: 150,
    
            cell: (info) => (
              <div>
                <div>{info.row.original.recept_reference ?? ""}</div>
              </div>
            ),
            enableResizing: true,
          },
          {
            header: "PV No",
            accessorKey: "serialNumber",
            size: 100,
    
            cell: (info) => (
              <div>
                <div>{info.row.original.serialNumber ?? ""}</div>
              </div>
            ),
            enableResizing: true,
          },
          {
            header: "Status",
            accessorKey: "status",
            size: 80,
            cell: (info) => (
              <span
                className={` text-xs font-semibold ${
                  info.row.original.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : info.row.original.status === "rejected"
                    ? "bg-rose-100 text-rose-600"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {info.row.original.status}
              </span>
            ),
            enableResizing: true,
          },
     
        ];

        const table = useReactTable({
            data: transactions,
            columns,
            state: {
              sorting,
              columnVisibility,
              columnSizing,
              rowSelection,
              pagination,
            },
            onSortingChange: setSorting,
            onColumnVisibilityChange: setColumnVisibility,
            onColumnSizingChange: setColumnSizing,
            onRowSelectionChange: setRowSelection,
            onPaginationChange: setPagination,
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
              return Object.values(row.original).some(
                (value) => rankItem(String(value ?? ""), filterValue).passed
              );
            },
            enableRowSelection: true,
            enableColumnResizing: true,
            getRowCanExpand: () => true,
          });
       

    return (
        <div className="w-full">
            <h3 className='test-lg ml-6 mt-4 font-bold'>Payment Report</h3>
                    <div className="flex flex-col sm:flex-row gap-4 m-4 justify-between  outline-1 outline-gray-300 rounded-md p-4">
                      <div className='flex flex-wrap gap-4'>

                      
                        <div className=''>
                            <label className="text-xs font-semibold text-foreground mr-1 block mb-1">Payment Type</label>
                            <select
                                onChange={(e) => handleFilterChange('paymentType', e.target.value)}
                                value={filters.paymentType}
                                className="rounded-md border border-border bg-muted text-muted-foreground px-1 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs font-semibold transition-all duration-150"
                            >
                                <option value="">All</option>
                                {paymentTypesModel.map(item => (
                                    <option key={item.value} value={item.value}>{item.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="text-xs font-semibold text-foreground mr-1 block mb-1">Status</label>
                            <select
                                id="status"
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                value={filters.status}
                                className="rounded-md border border-border bg-muted text-muted-foreground px-4 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs font-semibold transition-all duration-150"
                            >
                                <option value="">All</option>
                                {transactionStatusesModel.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="type" className="text-xs font-semibold text-foreground mr-1 block mb-1">Type</label>
                            <select
                                id="type"
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                value={filters.type}
                                className="rounded-md border border-border bg-muted text-muted-foreground px-1 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs font-semibold transition-all duration-150"
                            >
                                <option value="">All</option>
                                {transactionTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="startDate" className="text-xs font-semibold text-foreground mr-1 block mb-1">Start Date</label>
                            <Input
                                type="date"
                                id="startDate"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="rounded-md border border-border bg-muted text-muted-foreground px-2 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs font-semibold transition-all duration-150"
                                
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="text-xs font-semibold text-foreground mr-1 block mb-1">End Date</label>
                            <Input
                                type="date"
                                id="endDate"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="rounded-md border border-border bg-muted text-muted-foreground px-2 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm font-semibold transition-all duration-150"
                            />
                        </div>
                        <div>
                            <label htmlFor="serialNumber" className="text-xs font-semibold text-foreground mr-1 block mb-1">CPV No (From)</label>
                            <Input
                                type="text"
                                id="serialNumber"
                                value={filters.serialNumber}
                                onChange={(e) => handleFilterChange('serialNumber', e.target.value)}
                                className="rounded-md border border-border bg-muted text-muted-foreground px-2 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm font-semibold transition-all duration-150 max-w-[100px]"
                            />
                        </div>
                        </div>
                    <div className='flex items-end mt-4'>  

                    
                    <div className='flex gap-4 mb-4'>
                    <Button onClick={fetchReport} disabled={loading} className='flex items-center gap-1 bg-white text-black font-bold px-1 py-2 rounded-lg transition border border-gray-300 cursor-pointer hover:bg-[#EEEFE0] disabled:opacity-60'>
                    <Eye size={20} />   {loading ? 'Loading...' : 'View'}
                    </Button>
                    <Button 
                    onClick={()=> {
                      localStorage.setItem('queryParams', JSON.stringify({
                        transactions: transactions,
                        startDate: filters.startDate,
                        endDate: filters.endDate,
                        serialNumber: filters.serialNumber,
                      }));
                      window.open('/reports/paymentReport/print', '_blank');
                    }}
                    className='flex items-center gap-1 bg-white text-black font-bold px-1 py-2 rounded-lg transition border border-gray-300 cursor-pointer hover:bg-[#EEEFE0] disabled:opacity-60'>
                        <Printer size={18} /> Print
                    </Button>
                    <Button
                      onClick={() => {
                        // Prepare data for export
                        const exportData = transactions.map(tx => ({
                          'To': tx.to || '-',
                          'Reason': tx.reason || '-',
                          'Amount': formatCurrency(tx.amount || tx.suspenceAmount),
                          'Date': formatRequestedAt(tx.requestedAt),
                          'Reference': tx.recept_reference || '-',
                          'PV No': tx.serialNumber || '-',
                          'Status': tx.status || '-',
                        }));
                        const ws = XLSX.utils.json_to_sheet(exportData);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, 'Payment Report');
                        XLSX.writeFile(wb, 'payment_report.xlsx');
                      }}
                      className='flex items-center gap-1 bg-white text-black font-bold px-1 py-2 rounded-lg transition border border-gray-300 cursor-pointer hover:bg-[#EEEFE0] disabled:opacity-60'
                    >
                      <FilePlus size={18} /> Excel
                    </Button>


                    </div>
                    </div>
                    </div>
                

            {error && <p className="text-red-500 mt-4">{error}</p>}

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
            <React.Fragment key={row.id}>
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
      {/* Pagination Controls with shadcn/ui theme */}
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
          {[15, 20, 30, 40, 50].map((pageSize) => (
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
};

export default PaymentReport;