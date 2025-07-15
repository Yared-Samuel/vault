import { useState, useEffect, useRef } from "react";
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
  ArrowUpDown,
  Ellipsis,
  PencilLine,
  Printer
} from 'lucide-react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function FuelTransactionsPage() {
  useRedirectLoggedOutUser();
  const [fuelTransaction, setFuelTransaction] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date().setHours(0,0,0,0),
      endDate: new Date().setHours(23,59,59,999),
      key: 'selection',
    },
  ]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleFetchError, setVehicleFetchError] = useState(null);
  const [vehicleLoading, setVehicleLoading] = useState(true);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [showVehicleList, setShowVehicleList] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

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

  // Close picker on outside click
  useEffect(() => {
    if (!showDatePicker) return;
    function handleClick(e) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDatePicker]);

  // Fetch vehicles for filter
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setVehicleLoading(true);
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        if (data.success) {
          setVehicles(data.data);
        } else {
          setVehicleFetchError('Failed to fetch vehicles');
        }
      } catch (err) {
        setVehicleFetchError('Failed to fetch vehicles');
      } finally {
        setVehicleLoading(false);
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
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      enableSorting: false,
      enableResizing: false,
      size: 32,
    },
    {
      header: <span>Plate</span>,
      accessorKey: "vehicleId.plate",
      cell: info => <Badge>{info.getValue()}</Badge>,
    },
    {
      header: <span>Liters</span>,
      accessorKey: "liters",
      cell: info => {
        const row = info.row.original;
        if (editingId === row._id) {
          return (
            <input
              type="number"
              step="0.01"
              className="border rounded px-2 py-1 w-24"
              value={editValues.liters ?? ''}
              onChange={e => setEditValues(v => ({ ...v, liters: e.target.value }))}
            />
          );
        }
        return <Badge variant="secondary">{formatNumber(info.getValue(), 2)} Lt</Badge>;
      },
    },
    {
      header: <span>KM/L</span>,
      accessorKey: "km_lit",
      cell: info => {
        const row = info.row.original;
        if (editingId === row._id) {
          return (
            <input
              type="number"
              step="0.01"
              className="border rounded px-2 py-1 w-24"
              value={editValues.km_lit ?? ''}
              onChange={e => setEditValues(v => ({ ...v, km_lit: e.target.value }))}
            />
          );
        }
        return <Badge variant="secondary">{formatNumber(info.getValue(), 2)} KM/L</Badge>;
      },
    },
    {
      header: <span>Total Cost</span>,
      accessorKey: "totalCost",
      cell: info => {
        const row = info.row.original;
        if (editingId === row._id) {
          return (
            <input
              type="number"
              step="0.01"
              className="border rounded px-2 py-1 w-24"
              value={editValues.totalCost ?? ''}
              onChange={e => setEditValues(v => ({ ...v, totalCost: e.target.value }))}
            />
          );
        }
        return <Badge variant="primary">${formatNumber(info.getValue(), 2)}</Badge>;
      },
    },
    {
      header: <span>Odometer</span>,
      accessorKey: "odometer",
      cell: info => {
        const row = info.row.original;
        if (editingId === row._id) {
          return (
            <input
              type="number"
              step="1"
              className="border rounded px-2 py-1 w-24"
              value={editValues.odometer ?? ''}
              onChange={e => setEditValues(v => ({ ...v, odometer: e.target.value }))}
            />
          );
        }
        return <Badge variant="secondary">{formatNumber(info.getValue(), 0)} KM</Badge>;
      },
    },
    {
      header: <span>Date</span>,
      accessorKey: "pumpedAt",
      cell: info => {
        const row = info.row.original;
        if (editingId === row._id) {
          return (
            <input
              type="date"
              className="border rounded px-2 py-1 w-36"
              value={editValues.pumpedAt ? editValues.pumpedAt.slice(0, 10) : ''}
              onChange={e => setEditValues(v => ({ ...v, pumpedAt: e.target.value }))}
            />
          );
        }
        return <Badge variant="secondary">{formatDateShort(info.getValue())}</Badge>;
      },
    },
    {
      header: <span>By</span>,
      accessorKey: "recordedBy.name",
      cell: info => info.getValue(),
    },
    {
      header: <span>Actions</span>,
      accessorKey: "actions",
      cell: info => {
        const row = info.row.original;
        if (editingId === row._id) {
          return (
            <div className="flex gap-2">
              <Button size="sm" className="bg-green-600 text-white" onClick={async () => {
                try {
                  const updated = {
                    id: row._id,
                    liters: Number(editValues.liters),
                    km_lit: Number(editValues.km_lit),
                    totalCost: Number(editValues.totalCost),
                    odometer: Number(editValues.odometer),
                    pumpedAt: editValues.pumpedAt,
                  };
                  const res = await fetch('/api/fuel-transactions', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updated),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setFuelTransaction(fuelTransaction => fuelTransaction.map(tx => tx._id === row._id ? { ...tx, ...updated } : tx));
                    setEditingId(null);
                    setEditValues({});
                    toast.success('Transaction updated');
                  } else {
                    toast.error(data.message || 'Update failed');
                  }
                } catch (err) {
                  toast.error('Update failed');
                }
              }}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => {
                setEditingId(null);
                setEditValues({});
              }}>Cancel</Button>
            </div>
          );
        }
        return (
          <Button size="sm" variant="outline" className="bg-[#02733E] text-white hover:bg-[#02733E]/80" onClick={() => {
            setEditingId(row._id);
            setEditValues({
              liters: row.liters,
              km_lit: row.km_lit,
              totalCost: row.totalCost,
              odometer: row.odometer,
              pumpedAt: row.pumpedAt ? new Date(row.pumpedAt).toISOString().slice(0, 10) : '',
            });
          }}><PencilLine /></Button>
        );
      },
    },
  ];

  useEffect(() => {
    let filtered = fuelTransaction;
    const { startDate, endDate } = dateRange[0];
    if (startDate) {
      filtered = filtered.filter(f => new Date(f.pumpedAt) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(f => new Date(f.pumpedAt) <= end);
    }
    if (selectedVehicleId) {
      filtered = filtered.filter(f => f.vehicleId && (f.vehicleId._id === selectedVehicleId));
    }
    setFilteredTransactions(filtered);
  }, [dateRange, fuelTransaction, selectedVehicleId]);

  const table = useReactTable({
    data: filteredTransactions,
    columns,
    state: { sorting, pagination, columnFilters, rowSelection },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: false,
    pageCount: Math.ceil(filteredTransactions.length / pagination.pageSize),
    enableRowSelection: true,
  });

  // Summaries for report
  const totalVehicles = new Set(filteredTransactions.map(tx => tx.vehicleId?._id)).size;
  const totalLiters = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.liters) || 0), 0);
  const totalCost = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.totalCost) || 0), 0);

  // Calculate sums for selected rows
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedLiters = selectedRows.reduce((sum, row) => sum + (Number(row.original.liters) || 0), 0);
  const selectedTotalCost = selectedRows.reduce((sum, row) => sum + (Number(row.original.totalCost) || 0), 0);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  return (
    <div  className="w-full mx-auto mt-2">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center sm:text-lg md:text-2xl font-bold text-[#1a202c]  gap-1 " >
          <Fuel className="w-5 h-5 md:w-10 md:h-10 text-green-800"  />
          Fuel Consumption
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button className="flex items-center gap-2 font-bold text-1xl bg-green-800" onClick={() => setShowModal(true)} >
            <Fuel style={{ width: 20, height: 20 }} />
            <span className="hidden md:block">Dispense</span>
          </Button>
          <Button className="flex items-center gap-2 font-bold text-1xl bg-green-800" onClick={() => {
            const selectedVehicle = selectedVehicleId ? vehicles.find(v => v._id === selectedVehicleId) : null;
            localStorage.setItem('fuelReportData', JSON.stringify({
              filteredTransactions,
              dateRange,
              selectedVehicle,
              vehicles
            }));
            window.open('/fuel-transactions/report', '_blank');
          }}>
            <Printer style={{ width: 20, height: 20 }} />
            <span className="hidden md:block">Print</span>
          </Button>
        </div>
      </div>
      <div>
        <div style={{ position: 'relative', zIndex: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          {/* Vehicle Filter Combobox */}
          <div className="vehicle-combobox" style={{ position: 'relative', minWidth: 200 }}>
            <input
              type="text"
              value={
                selectedVehicleId
                  ? (vehicles.find(v => v._id === selectedVehicleId)?.plate || '') +
                    (vehicles.find(v => v._id === selectedVehicleId)?.model ? ' - ' + vehicles.find(v => v._id === selectedVehicleId)?.model : '')
                  : vehicleSearch
              }
              onChange={e => {
                setVehicleSearch(e.target.value);
                setShowVehicleList(true);
                setSelectedVehicleId('');
              }}
              onFocus={() => setShowVehicleList(true)}
              placeholder="Search vehicle..."
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700"
              autoComplete="off"
              style={{ width: '100%' }}
              readOnly={!!selectedVehicleId}
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
                    }}
                  >
                    {v.plate} {v.model ? `- ${v.model}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Date Picker Button */}
          <button
            type="button"
            className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            onClick={() => setShowDatePicker(v => !v)}
          >
            <Calendar style={{ width: 18, height: 18 }} />
            <span className="hidden md:block">{dateRange[0].startDate && dateRange[0].endDate
              ? `${formatDateShort(dateRange[0].startDate)} - ${formatDateShort(dateRange[0].endDate)}`
              : 'Select date range'}</span>
          </button>
          {(dateRange[0].startDate || dateRange[0].endDate) && (
            <button
              type="button"
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setDateRange([{ startDate: null, endDate: null, key: 'selection' }]);
                setShowDatePicker(false);
              }}
            >
              Clear
            </button>
          )}
          {showDatePicker && (
            <div
              ref={datePickerRef}
              style={{
                position: 'absolute',
                left: '50%',
                top: '110%',
                transform: 'translateX(-50%)',
                background: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                borderRadius: 8,
                maxWidth: '95vw',
                minWidth: 320,
                padding: 8,
                zIndex: 30,
              }}
            >
              <DateRange
                editableDateInputs={true}
                onChange={item => {
                  setDateRange([item.selection]);
                  if (item.selection.startDate && item.selection.endDate) setShowDatePicker(false);
                }}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                maxDate={new Date()}
                showMonthAndYearPickers={true}
                rangeColors={["#16a34a"]}
              />
            </div>
          )}
        </div>
        <div></div>
        {/* End date range picker dropdown */}

        {/* Show sums only when a date range is selected */}
        {(dateRange[0].startDate && dateRange[0].endDate) && (
          <div className="flex flex-row gap-2 mt-2 justify-center items-center w-full max-w-2xl mx-auto py-1">
            {/* Vehicles Badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 text-xs font-bold border border-gray-300">
              <svg className="text-gray-500" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="8" height="3" rx="1.5"/><path d="M5 7V5a2 2 0 0 1 4 0v2"/><circle cx="5.5" cy="12" r="1"/><circle cx="10.5" cy="12" r="1"/></svg>
              {filteredTransactions.length} <span className="ml-0.5 font-normal">Vehicle{filteredTransactions.length !== 1 ? 's' : ''}</span>
            </span>
            {/* Liters Badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold border border-green-300">
              <svg className="text-green-600" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1v5"/><rect x="4" y="6" width="6" height="5" rx="2.5"/><path d="M9 10v1"/></svg>
              {filteredTransactions.reduce((sum, tx) => sum + (Number(tx.liters) || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="ml-0.5 font-normal">Lt</span>
            </span>
            {/* ETB Badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-300">
              <svg className="text-blue-600" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1v12"/><path d="M3 8h8"/><path d="M5 11h6"/><path d="M5 5h6"/></svg>
              {filteredTransactions.reduce((sum, tx) => sum + (Number(tx.totalCost) || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="ml-0.5 font-normal">ETB</span>
            </span>
          </div>
        )}
        {/* Show sums for selected rows (desktop) */} 
        {selectedRows.length > 0 && (
          <div className="flex gap-6 mt-2 justify-center sticky top-0 z-30 bg-white/95 shadow-sm">
            <div className="hidden md:block flex items-center justify-center bg-green-600 text-white font-bold" style={{ width: 36, height: 36, borderRadius: '50%' }}>
              {selectedRows.length}
            </div>
            <div className="hidden md:block font-semibold text-green-800 bg-green-50 rounded px-4 py-2">
              {selectedLiters.toLocaleString(undefined, { maximumFractionDigits: 2 })} Lt
            </div>
            <div className="hidden md:block font-semibold text-blue-800 bg-blue-50 rounded px-4 py-2">
              {selectedTotalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB
            </div>
          </div>
        )}

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
            overscrollBehavior: "contain",
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
              boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "hidden",
              width: "100%",
              maxWidth: 480,
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: 2,
                right: 15,
                background: "transparent",
                border: "none",
                fontSize: 40,
                cursor: "pointer",
                color: "#F26B5E",
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
      {showReport && (
        <></>
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
      {/* Show sums for selected rows on mobile */}
      <div className="fuel-card-list" style={{ display: 'none', marginTop: 8 }}>
        {selectedRows.length > 0 && (
          <div className="flex gap-3 mt-2 justify-center md:hidden">
            <div className="flex items-center justify-center bg-green-600 text-white font-bold" style={{ width: 32, height: 32, borderRadius: '50%' }}>
              {selectedRows.length}
            </div>
            <div className="font-semibold text-green-800 bg-green-50 rounded px-2 py-1">
              {selectedLiters.toLocaleString(undefined, { maximumFractionDigits: 2 })} Lt
            </div>
            <div className="font-semibold text-blue-800 bg-blue-50 rounded px-2 py-1">
              {selectedTotalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB
            </div>
          </div>
        )}
      </div>
      <div className="fuel-card-list" style={{ display: 'none', marginTop: 8 }}>
        {table.getRowModel().rows.map((row, idx) => (
          <div key={row.original._id || idx} style={{
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
              <input
                type="checkbox"
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
                style={{ marginRight: 8 }}
              />
              <Car style={{ width: 20, height: 20, color: '#3182ce' }} />
              <span style={{ fontWeight: 700, fontSize: 18 }}>{row.original.vehicleId?.plate}</span>
              <Badge variant="secondary">{formatDateShort(row.original.pumpedAt)}</Badge>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 2 }}>
              <Badge variant="secondary"><Droplet style={{ width: 14, height: 14, marginRight: 4 }} /> {formatNumber(row.original.liters, 2)} Lt</Badge>
              <Badge variant="danger" ><Gauge style={{ width: 14, height: 14, marginRight: 4, }} /> {formatNumber(row.original.km_lit, 2)} KM/L</Badge>
              <Badge variant="primary"><DollarSign style={{ width: 14, height: 14, marginRight: 4 }} /> {formatNumber(row.original.totalCost, 2)}</Badge>
              <Badge variant="secondary"><Gauge style={{ width: 14, height: 14, marginRight: 4 }} /> {formatNumber(row.original.odometer, 0)} KM</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <div className="flex items-center gap-2">
                <User style={{ width: 14, height: 14, marginRight: 2, color: '#4a5568' }} />
                <span style={{ fontSize: 14, color: '#4a5568' }}>{row.original.recordedBy?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    `inline-flex items-center justify-center rounded-full font-extrabold shadow-md ring-2 ring-white transition-transform duration-200
                    px-3 py-1 text-base sm:text-lg md:text-xl
                    ${row.original.station === 'A' ? 'bg-gradient-to-r from-green-500 to-green-700' :
                      row.original.station === 'B' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900' :
                      'bg-gradient-to-r from-blue-500 to-blue-700'}
                    hover:scale-105`
                  }
                  style={{ letterSpacing: 2, minWidth: 40, minHeight: 40 }}
                >
                  {row.original.station}
                </span>
              </div>
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