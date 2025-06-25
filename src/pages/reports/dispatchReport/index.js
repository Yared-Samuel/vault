import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { transactionAction, vehicleComponentsCatagory, vehicleComponents } from '@/lib/constants';
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

  
  const DispatchReport = () => {
    const [filters, setFilters] = useState({
        vehicleId: '',
        action: '',
        vehicleComponentCategory: '',
        vehicleComponents: '',
        startDate: '',
        endDate: '',
    
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sorting, setSorting] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [columnSizing, setColumnSizing] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [vehicles, setVehicles] = useState([]);
  const [showVehicleList, setShowVehicleList] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');


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
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/report/maintenanceReport?${queryParams}`);
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
        header: "Vehicle",
        accessorKey: "vehicleId",
        size: 100,
        cell: (info) => info.row.original.vehicleId.plate,
        enableResizing: true,
      },
      
      {
        header: "Date",
        accessorKey: "createdAt",
        size: 100,

        cell: (info) => formatRequestedAt(info.row.original.createdAt),
        enableResizing: true,
      },          
      {
        header: "Action",
        accessorKey: "action",
        enableResizing: true,
      },
      {
        header: "Component Cat",
        accessorKey: "vehicleComponentCategory",
        size: 100,

        enableResizing: true,
      },
      {
        header: "Components",
        accessorKey: "vehicleComponents",
       
        enableResizing: true,
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
 
    ];

    const table = useReactTable({
        data: transactions,
        columns,
        state: {
          sorting,
          columnVisibility,
          columnSizing,
          rowSelection,
        },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnSizingChange: setColumnSizing,
        onRowSelectionChange: setRowSelection,
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


        // Fetch vehicles for filter
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        if (data.success) {
          setVehicles(data.data);
        } else {
          setError('Failed to fetch vehicles');
        }
      } catch (err) {
        setError('Failed to fetch vehicles');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  
  // Filtered vehicles for combobox
  const filteredVehicles = vehicles.filter(v =>
    (v.plate + ' ' + (v.model || '')).toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  // Close vehicle dropdown on outside click
  useEffect(() => {
    if (!showVehicleList) return;
    function handleClick(e) {
      if (!e.target.closest('.vehicle-combobox')) setShowVehicleList(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showVehicleList]);


    return (
      <div className='w-full'>
        <div className='flex flex-wrap gap-4 mb-4'>
            
        
          {/* Vehicle Filter Combobox */}
          <div className="vehicle-combobox" style={{ position: 'relative' }}>
          <label htmlFor="vehicle" className="font-semibold text-foreground mr-1 block mb-1">Vehicle</label>
            <Input
              type="text"
              value={
                selectedVehicleId
                  ? (vehicles.find(v => v._id === selectedVehicleId)?.plate || '') +
                    (vehicles.find(v => v._id === selectedVehicleId)?.model ? ' - ' + vehicles.find(v => v._id === selectedVehicleId)?.model : '')
                  : vehicleSearch
              }
              onChange={e => {
                handleFilterChange('vehicleId', e.target.value);
                setShowVehicleList(true);
                setSelectedVehicleId('');
              }}
              onFocus={() => setShowVehicleList(true)}
              placeholder="Search vehicle..."              
              autoComplete="off"
              style={{ width: '100%' }}
              readOnly={!!selectedVehicleId}
              className="rounded-md border border-border bg-muted text-muted-foreground   shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs font-semibold transition-all duration-150"
            />
            {selectedVehicleId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedVehicleId('');
                  setVehicleSearch('');
                  setShowVehicleList(false);
                }}
                className="ml-2 px-2 py-1 border rounded"
                style={{ position: 'absolute', right: 4, top: 4, zIndex: 101 }}
              >
                Clear
              </button>
            )}
            {showVehicleList && !selectedVehicleId && (
              <ul
                style={{
                  position: 'absolute',
                  zIndex: 100,
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: 4,
                  width: '100%',
                  maxHeight: 180,
                  overflowY: 'auto',
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  top: '110%',
                  left: 0
                }}
              >
                {filteredVehicles.length === 0 && (
                  <li style={{ padding: 8, color: '#888' }}>No vehicles found</li>
                )}
                {filteredVehicles.map(v => (
                  <li
                    key={v._id}
                    style={{ padding: 8, cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedVehicleId(v._id);
                      setVehicleSearch('');
                      setShowVehicleList(false);
                      handleFilterChange('vehicleId', v._id);
                    }}
                  >
                    {v.plate} {v.model ? `- ${v.model}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>

            <div>
                <label className="font-semibold text-foreground mr-1 block mb-1">Action</label>
                <select
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    value={filters.action}
                    className="rounded-md border border-border bg-muted text-muted-foreground px-1 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs font-semibold transition-all duration-150"
                >
                    <option value="">All</option>
                    {transactionAction.map((action) => (
                        <option key={action.value} value={action.value}>{action.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="font-semibold text-foreground mr-1 block mb-1">Component Cat</label>
                <select
                    onChange={(e) => handleFilterChange('vehicleComponentCategory', e.target.value)}
                    value={filters.vehicleComponentCategory}
                    className="rounded-md border border-border bg-muted text-muted-foreground px-1 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs font-semibold transition-all duration-150"
                >
                    <option value="">All</option>
                    {vehicleComponentsCatagory.map((category) => (
                        <option key={category.key} value={category.key}>{category.label}</option>
                    ))}
                </select>
            </div>
            <div >
                <label className="font-semibold text-foreground mr-1 block mb-1">Components</label>
                <select
                    onChange={(e) => handleFilterChange('vehicleComponents', e.target.value)}
                    value={filters.vehicleComponents}
                    className="rounded-md border border-border bg-muted text-muted-foreground px-1 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs font-semibold transition-all duration-150 max-w-[140px]"
                >
                    <option value="">All</option>
                    {vehicleComponents.map((component) => (
                        <option key={component.key} value={component.key}>{component.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="font-semibold text-foreground mr-1 block mb-1">Start Date</label>
                <input
                    type="date"
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    value={filters.startDate}
                    className="rounded-md border border-border bg-muted text-muted-foreground px-1 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs font-semibold transition-all duration-150"
                />
            </div>
            <div>
                            <label htmlFor="endDate" className="font-semibold text-foreground mr-1 block mb-1">End Date</label>
                            <input
                                type="date"
                                id="endDate"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="rounded-md border border-border bg-muted text-muted-foreground px-1 py-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs font-semibold transition-all duration-150"
                            />
                        </div>
        
      </div>
      <div className='flex gap-4 mb-4'>
                    <Button onClick={fetchReport} disabled={loading} className='flex items-center gap-1 bg-white text-black font-bold px-1 py-2 rounded-lg transition border border-gray-300 cursor-pointer hover:bg-[#EEEFE0] disabled:opacity-60 '>
                    <Eye size={20} />   {loading ? 'Loading...' : 'View'}
                    </Button>
                    <Button 
                    disabled
                    onClick={()=> {
                      localStorage.setItem('queryParams', JSON.stringify({
                        transactions: transactions,
                        startDate: filters.startDate,
                        endDate: filters.endDate,
                        vehicleId: filters.vehicleId,
                        action: filters.action,
                        vehicleComponentCategory: filters.vehicleComponentCategory,
                        vehicleComponents: filters.vehicleComponents,
                      }));
                      window.open('/reports/dispatchReport/print', '_blank');
                    }}
                    className='flex items-center gap-1 bg-white text-black font-bold px-1 py-2 rounded-lg transition border border-gray-300 cursor-pointer hover:bg-[#EEEFE0] disabled:opacity-60 disabled:cursor-not-allowed  disabled:text-gray-400'>
                        <Printer size={18} /> Print
                    </Button>
                    <Button
                    disabled
                      onClick={() => {
                        // Prepare data for export
                        const exportData = transactions.map(tx => ({
                          'Vehicle': tx.vehicleId.plate + ' - ' + tx.vehicleId.model || '-',
                          'Action': tx.action || '-',
                          'Component Category': tx.vehicleComponentCategory || '-',
                          'Components': tx.vehicleComponents || '-',
                          'Amount': formatCurrency(tx.amount || tx.suspenceAmount),
                          'Date': formatRequestedAt(tx.createdAt),
                        }));
                        const ws = XLSX.utils.json_to_sheet(exportData);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, 'Payment Report');
                        XLSX.writeFile(wb, 'payment_report.xlsx');
                      }}
                      className='flex items-center gap-1 bg-white text-black font-bold px-1 py-2 rounded-lg transition border border-gray-300 cursor-pointer hover:bg-[#EEEFE0] disabled:opacity-60 disabled:cursor-not-allowed  disabled:text-gray-400'
                    >
                      <FilePlus size={18} /> Excel
                    </Button>


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
    )
  }
  
  export default DispatchReport