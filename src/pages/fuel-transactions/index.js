import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FuelPump from "@/components/FuelPump";
import useRedirectLoggedOutUser from "@/lib/redirect";
import { toast } from 'sonner';
import {
  Fuel,
  Droplet,
  Gauge,
  DollarSign,
  Calendar,
  User,
  Car,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';

export default function FuelTransactionsPage() {
  useRedirectLoggedOutUser();
  const [fuelTransaction, setFuelTransaction] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchFuelTransactions = async () => {
      try {
        const res = await fetch("/api/fuel-transactions");
        const data = await res.json();
        setFuelTransaction(data.data || []);
      } catch (err) {
        toast.error("Failed to fetch fuel transactions");
      }
    };
    fetchFuelTransactions();
  }, []);

  useEffect(() => {
    if (!showModal) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") setShowModal(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  // Helper for formatting
  function formatDateShort(date) {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  }
  function formatNumber(n, decimals = 2) {
    return Number(n).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  // Only show plate, liters, km/l, total cost, odometer, date, recordedBy
  const columns = [
    {
      header: <span>Plate</span>,
      accessorKey: "vehicleId.plate",
      cell: info => <Badge>{info.getValue()}</Badge>,
    },
    {
      header: <span>Liters</span>,
      accessorKey: "liters",
      cell: info => <Badge variant="secondary">{formatNumber(info.getValue(), 2)} Lt</Badge>,
    },
    {
      header: <span>KM/L</span>,
      accessorKey: "km_lit",
      cell: info => <Badge variant="secondary">{formatNumber(info.getValue(), 2)} KM/L</Badge>,
    },
    {
      header: <span>Total Cost</span>,
      accessorKey: "totalCost",
      cell: info => <Badge variant="primary">${formatNumber(info.getValue(), 2)}</Badge>,
    },
    {
      header: <span>Odometer</span>,
      accessorKey: "odometer",
      cell: info => <Badge variant="secondary">{formatNumber(info.getValue(), 0)} KM</Badge>,
    },
    {
      header: <span>Date</span>,
      accessorKey: "pumpedAt",
      cell: info => <Badge variant="secondary">{formatDateShort(info.getValue())}</Badge>,
    },
    {
      header: <span>By</span>,
      accessorKey: "recordedBy.name",
      cell: info => info.getValue(),
    },
  ];

  // Responsive: show cards on mobile, table on desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 700;

  const table = useReactTable({
    data: fuelTransaction,
    columns,
    state: { sorting, pagination, columnFilters },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: false,
    pageCount: Math.ceil(fuelTransaction.length / pagination.pageSize),
  });

  return (
    <div style={{ maxWidth: "100%", margin: "5px auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 20, fontWeight: 400, color: "#1a202c", display: "flex", alignItems: "center", gap: 12, letterSpacing: 1 }}>
          <Fuel style={{ color: "#3182ce", width: 36, height: 36 }} />
          Fuel Consumption
        </h2>
        <Button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 16 }}>
          <Fuel style={{ width: 20, height: 20 }} /> Fuel Pump
        </Button>
      </div>
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 8,
              minWidth: 320,
              minHeight: 120,
              boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
              position: "relative",
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "transparent",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
              }}
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <FuelPump />
          </div>
        </div>
      )}
      {/* Modern Card List for Mobile/Tablet */}
      <style>{`
        @media (max-width: 700px) {
          .fuel-table { display: none !important; }
          .fuel-card-list { display: block !important; }
        }
        @media (min-width: 701px) {
          .fuel-card-list { display: none !important; }
        }
      `}</style>
      <div className="fuel-card-list" style={{ display: 'none', marginTop: 16 }}>
        {fuelTransaction.map((tx, idx) => (
          <div key={tx._id || idx} style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            marginBottom: 18,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Car style={{ width: 20, height: 20, color: '#3182ce' }} />
              <span style={{ fontWeight: 700, fontSize: 18 }}>{tx.vehicleId?.plate}</span>
              <Badge variant="secondary">{formatDateShort(tx.pumpedAt)}</Badge>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 2 }}>
              <Badge variant="secondary"><Droplet style={{ width: 14, height: 14, marginRight: 4 }} /> {formatNumber(tx.liters, 2)} Lt</Badge>
              <Badge variant="secondary"><Gauge style={{ width: 14, height: 14, marginRight: 4 }} /> {formatNumber(tx.km_lit, 2)} KM/L</Badge>
              <Badge variant="primary"><DollarSign style={{ width: 14, height: 14, marginRight: 4 }} /> {formatNumber(tx.totalCost, 2)}</Badge>
              <Badge variant="secondary"><Gauge style={{ width: 14, height: 14, marginRight: 4 }} /> {formatNumber(tx.odometer, 0)} KM</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <User style={{ width: 14, height: 14, marginRight: 2, color: '#4a5568' }} />
              <span style={{ fontSize: 14, color: '#4a5568' }}>{tx.recordedBy?.name}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Responsive Table Wrapper for Desktop */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          background: "#fff",
          marginTop: 16,
        }}
      >
        <table className="fuel-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 16 }}>
          <thead style={{ background: "#f7fafc" }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{ padding: "14px 10px", borderBottom: "2px solid #e2e8f0", textAlign: "left", fontWeight: 700, color: "#2d3748" }}>
                    <div
                      style={{ cursor: header.column.getCanSort() ? "pointer" : undefined, display: "flex", alignItems: "center", gap: 4 }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        header.column.getIsSorted() === "asc" ? <ArrowUp style={{ color: "#3182ce", width: 18, height: 18 }} /> :
                        header.column.getIsSorted() === "desc" ? <ArrowDown style={{ color: "#3182ce", width: 18, height: 18 }} /> :
                        <ArrowUpDown style={{ color: "#a0aec0", width: 18, height: 18 }} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid #e2e8f0", background: row.index % 2 === 0 ? "#f9fafb" : "#fff" }}>
                {row.getVisibleCells().map((cell, idx) => (
                  <td
                    key={cell.id}
                    style={{ padding: "12px 10px", color: "#2d3748" }}
                    data-label={table.getAllColumns()[idx]?.columnDef?.header?.props ? table.getAllColumns()[idx]?.columnDef?.header?.props.children[0] : table.getAllColumns()[idx]?.columnDef?.header}
                  >
                    {flexRender(
                      cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} style={{ padding: 8 }}>
            <ChevronsLeft style={{ width: 18, height: 18 }} />
          </Button>
          <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} style={{ padding: 8 }}>
            <ChevronLeft style={{ width: 18, height: 18 }} />
          </Button>
          <span style={{ margin: "0 8px", fontWeight: 500 }}>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} style={{ padding: 8 }}>
            <ChevronRight style={{ width: 18, height: 18 }} />
          </Button>
          <Button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            style={{ padding: 8 }}
          >
            <ChevronsRight style={{ width: 18, height: 18 }} />
          </Button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Go to page:</span>
          <input
            type="number"
            min={1}
            max={table.getPageCount()}
            value={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            style={{ width: 60, padding: 4, border: "1px solid #e2e8f0", borderRadius: 4 }}
          />
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            style={{ marginLeft: 8, padding: 4, border: "1px solid #e2e8f0", borderRadius: 4 }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
          <span style={{ marginLeft: 16, fontWeight: 500 }}>
            | Total rows: {fuelTransaction.length}
          </span>
        </div>
      </div>
    </div>
  );
} 