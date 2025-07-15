import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useRef, useEffect } from "react";
import { DateRange } from 'react-date-range';
import { Calendar, BadgeCheck, XCircle, ListChecks, Layers, Eye, Search, X } from "lucide-react";
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

function getCurrentMonthRange() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate, endDate };
}

function getPieChartData(transactions) {
    const counts = {};
    transactions.forEach(tx => {
        if (!counts[tx.paymentType]) counts[tx.paymentType] = 0;
        counts[tx.paymentType] += tx.amount;
    });
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    return {
        labels,
        datasets: [
            {
                label: 'Amount by Payment Type',
                data,
                backgroundColor: [
                    '#16a34a', '#f59e42', '#3b82f6', '#f43f5e', '#a855f7', '#fbbf24'
                ],
                borderWidth: 1,
                borderColor: '#fff',
                borderRadius: 10,
                hoverBorderWidth: 1,
                hoverBorderColor: '#fff',
                hoverBorderRadius: 10,
                hoverBorderWidth: 1,
                hoverBorderColor: '#fff',
                hoverBorderRadius: 10,
                hoverBorderWidth: 1,
            },
        ],
    };
}

const pieOptions = {
    layout: { padding: 20 },
    plugins: {
        legend: { display: false },
        datalabels: {
            color: '#222',
            anchor: 'outside',
            align: 'outside',
            offset: 60,
            borderRadius: 6,
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            padding: { top: 6, bottom: 6, left: 6, right: 6 },
            font: {
                family: "'Roboto', 'Arial', sans-serif",
                weight: '500',
                size: 12,
            },
            textAlign: 'center',
            shadowBlur: 4,
            shadowColor: 'rgba(0,0,0,0.08)',
            clamp: true,
            clip: false,
            display: 'auto',
            formatter: (value, context) => {
                const label = context.chart.data.labels[context.dataIndex];
                return `${label}\n${value.toLocaleString()}`;
            },
        }
    },
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    elements: {
        arc: { borderWidth: 0 }
    }
};

const { startDate, endDate } = getCurrentMonthRange();

function getDashboardStats(transactions) {
  let totalPaid = 0, totalRejected = 0, paidCount = 0, totalSuspence = 0, suspenceCount = 0, totalRequests = 0, requestedCount = 0;
  transactions.forEach(tx => {
    if (tx.status === 'paid') {
      totalPaid += tx.amount;
      paidCount += 1;
    }
    if (tx.status === 'requested') {
        totalRequests += tx.amount;
        requestedCount += 1;
    }
    if (tx.status === 'rejected') totalRejected += tx.amount;
    if (tx.status === 'suspence') {
        totalSuspence += tx.suspenceAmount;
        suspenceCount += 1;
    }
  });
  return {
    totalPaid,
    totalRejected,
    totalRequests,
    requestedCount,
    totalSuspence,
    paidCount,
    suspenceCount,
  };
}

function formatCurrency(amount) {
  return amount?.toLocaleString('en-US', { style: 'currency', currency: 'ETB', maximumFractionDigits: 2 }) || '-';
}

function getVehicleExpensePieData(maintenanceReport) {
    const vehicleSums = {};
    maintenanceReport.forEach(tx => {
        // Defensive: check for vehicleId and plate
        let label = '-';
        if (tx.vehicleId && typeof tx.vehicleId === 'object') {
            label = tx.vehicleId.plate || '-';
            if (tx.vehicleId.model) label += ' - ' + tx.vehicleId.model;
        }
        const amount = typeof tx.amount === 'number' ? tx.amount : (tx.suspenceAmount || 0);
        if (!vehicleSums[label]) vehicleSums[label] = 0;
        vehicleSums[label] += amount;
    });
    const labels = Object.keys(vehicleSums);
    const data = Object.values(vehicleSums);
    return {
        labels,
        datasets: [
            {
                label: 'Expense by Vehicle',
                data,
                backgroundColor: [
                    '#16a34a', '#f59e42', '#3b82f6', '#f43f5e', '#a855f7', '#fbbf24', '#6366f1', '#f87171', '#34d399', '#facc15', '#a3e635', '#f472b6', '#60a5fa', '#fbbf24', '#a78bfa', '#f87171', '#4ade80', '#f472b6', '#f59e42', '#3b82f6'
                ],
                borderWidth: 1,
                borderColor: '#fff',
                borderRadius: 10,
            },
        ],
    };
}

function getActionExpensePieData(maintenanceReport) {
    const actionSums = {};
    maintenanceReport.forEach(tx => {
        const label = tx.action || '-';
        const amount = typeof tx.amount === 'number' ? tx.amount : (tx.suspenceAmount || 0);
        if (!actionSums[label]) actionSums[label] = 0;
        actionSums[label] += amount;
    });
    const labels = Object.keys(actionSums);
    const data = Object.values(actionSums);
    return {
        labels,
        datasets: [
            {
                label: 'Expense by Action',
                data,
                backgroundColor: [
                    '#16a34a', '#f59e42', '#3b82f6', '#f43f5e', '#a855f7', '#fbbf24', '#6366f1', '#f87171', '#34d399', '#facc15', '#a3e635', '#f472b6', '#60a5fa', '#fbbf24', '#a78bfa', '#f87171', '#4ade80', '#f472b6', '#f59e42', '#3b82f6'
                ],
                borderWidth: 1,
                borderColor: '#fff',
                borderRadius: 10,
            },
        ],
    };
}

function getComponentCategoryExpensePieData(maintenanceReport) {
    const catSums = {};
    maintenanceReport.forEach(tx => {
        const label = tx.vehicleComponentCategory || '-';
        const amount = typeof tx.amount === 'number' ? tx.amount : (tx.suspenceAmount || 0);
        if (!catSums[label]) catSums[label] = 0;
        catSums[label] += amount;
    });
    const labels = Object.keys(catSums);
    const data = Object.values(catSums);
    return {
        labels,
        datasets: [
            {
                label: 'Expense by Parts',
                data,
                backgroundColor: [
                    '#16a34a', '#f59e42', '#3b82f6', '#f43f5e', '#a855f7', '#fbbf24', '#6366f1', '#f87171', '#34d399', '#facc15', '#a3e635', '#f472b6', '#60a5fa', '#fbbf24', '#a78bfa', '#f87171', '#4ade80', '#f472b6', '#f59e42', '#3b82f6'
                ],
                borderWidth: 1,
                borderColor: '#fff',
                borderRadius: 10,
            },
        ],
    };
}

export default function DashboardPage() {
    const [dateRange, setDateRange] = useState([
        {
            startDate,
            endDate,
            key: 'selection'
        }
    ]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [datePickerRef]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [maintenanceReport, setMaintenanceReport] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = {
                startDate: dateRange[0].startDate?.toISOString().split('T')[0],
                endDate: dateRange[0].endDate?.toISOString().split('T')[0],

            }
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
    const fetchMaintenanceReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = {
                startDate: dateRange[0].startDate?.toISOString().split('T')[0],
                endDate: dateRange[0].endDate?.toISOString().split('T')[0]
            }
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/report/maintenanceReport?${queryParams}`);
            const result = await response.json();
            if (result.success) {
                setMaintenanceReport(result.data);
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
    useEffect(() => {
        fetchReport();
        fetchMaintenanceReport();
        // eslint-disable-next-line
    }, [dateRange]);

    // Filter out transactions where paymentType is "bgi"
    useEffect(() => {
        const filtered = transactions.filter(tx => tx.paymentType !== 'bgi');
        setFilteredTransactions(filtered);
    }, [transactions]);

    const stats = getDashboardStats(filteredTransactions);
    const recentTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    return (
        <div className="w-full min-h-screen pt-4">
            <div className="flex items-center justify-end gap-4 ">
                <div className="relative">
                    <Button
                        type="button"
                        className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => setShowDatePicker(v => !v)}
                    >
                        <Calendar style={{ width: 18, height: 18 }} />
                        <span className="hidden md:block">{dateRange[0].startDate && dateRange[0].endDate
                            ? `${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`
                            : 'Select date range'}</span>
                    </Button>
                    {showDatePicker && (
                        <div
                            ref={datePickerRef}
                            className="absolute top-full mt-2 bg-white shadow-lg rounded-lg p-2 z-10"
                            style={{
                                minWidth: 320,
                                maxWidth: '95vw',
                            }}
                        >
                            <DateRange
                                editableDateInputs={true}
                                onChange={item => {
                                    setDateRange([item.selection]);
                                    // if (item.selection.startDate && item.selection.endDate) setShowDatePicker(false);
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

                {(dateRange[0].startDate || dateRange[0].endDate) && (
                    <button
                        type="button"
                        onClick={() => {
                            const { startDate, endDate } = getCurrentMonthRange();
                            setDateRange([{ startDate, endDate, key: 'selection' }]);
                            setShowDatePicker(false);
                        }}
                    >
                        <X size={20} color="red" className="cursor-pointer"/>
                    </button>
                )}

                <Button onClick={() => {
                    fetchReport();
                    fetchMaintenanceReport();
                } } disabled={loading} className='flex items-center gap-1 bg-white text-black font-bold px-1 py-2 rounded-lg transition border border-gray-300 cursor-pointer hover:bg-[#EEEFE0] disabled:opacity-60'>
                <Search size={20} />   {loading ? 'Loading...' : 'Filter'}
                </Button>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <div className="p-6">
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="rounded-xl shadow-lg p-5 flex items-center gap-4 bg-gradient-to-tr from-green-100 to-green-50 hover:scale-105 transition-transform duration-200">
                    <div className="bg-green-500/90 rounded-full p-3 shadow-lg">
                      <BadgeCheck className="text-white w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-green-700 text-xs font-semibold">Total Paid</div>
                      <div className="font-bold text-xl text-green-900">{formatCurrency(stats.totalPaid)}</div>
                    </div>
                  </div>
                  <div className="rounded-xl shadow-lg p-5 flex items-center gap-4 bg-gradient-to-tr from-red-100 to-red-50 hover:scale-105 transition-transform duration-200">
                    <div className="bg-red-500/90 rounded-full p-3 shadow-lg">
                      <XCircle className="text-white w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-red-700 text-xs font-semibold">Total Rejected</div>
                      <div className="font-bold text-xl text-red-900">{formatCurrency(stats.totalRejected)}</div>
                    </div>
                  </div>
                  <div className="rounded-xl shadow-lg p-5 flex items-center gap-4 bg-gradient-to-tr from-blue-100 to-blue-50 hover:scale-105 transition-transform duration-200">
                    <div className="bg-blue-500/90 rounded-full p-3 shadow-lg">
                      <ListChecks className="text-white w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-blue-700 text-xs font-semibold">Total Requests {stats.requestedCount}</div>
                      <div className="font-bold text-xl text-blue-900">{stats.totalRequests}</div>
                    </div>
                  </div>
                  <div className="rounded-xl shadow-lg p-5 flex items-center gap-4 bg-gradient-to-tr from-purple-100 to-purple-50 hover:scale-105 transition-transform duration-200">
                    <div className="bg-purple-500/90 rounded-full p-3 shadow-lg">
                      <Layers className="text-white w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-purple-700 text-xs font-semibold">Total Suspence {stats.suspenceCount}</div>
                      <div className="font-bold text-xl text-purple-900">{stats.totalSuspence}</div>
                    </div>
                  </div>
                </div>
                {/* Chart and Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#f1f1e9] rounded-lg shadow w-full flex flex-col items-center">
                        <h2 className="text-lg font-semibold ">Payments by Type</h2>
                        {filteredTransactions.length > 0 ? (
                            <div className="w-full max-w-[400px] h-[300px] mx-auto">
                                <Pie data={getPieChartData(filteredTransactions)} options={pieOptions} />
                            </div>
                        ) : (
                            <p>No data for selected range.</p>
                        )}
                    </div>
                    <div className="bg-[#f1f1e9] rounded-lg shadow w-full p-4 overflow-x-auto">
                      <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-gray-500 border-b">
                            <th className="py-2 px-2 text-left">To</th>
                            <th className="py-2 px-2 text-left">Amount</th>
                            <th className="py-2 px-2 text-left">Status</th>
                            <th className="py-2 px-2 text-left">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentTransactions.map(tx => (
                            <tr key={tx._id} className="border-b hover:bg-gray-50">
                              <td className="py-2 px-2">{tx.to || '-'}</td>
                              <td className="py-2 px-2">{formatCurrency(tx.amount)}</td>
                              <td className="py-2 px-2">
                                {tx.status === 'paid' && <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Paid</span>}
                                {tx.status === 'rejected' && <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">Rejected</span>}
                                {tx.status !== 'paid' && tx.status !== 'rejected' && <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold">{tx.status}</span>}
                              </td>
                              <td className="py-2 px-2 capitalize">{tx.paymentType || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
            </div>
            <div className="p-6 mx-6  flex flex-col md:flex-row justify-between  gap-8 bg-[#f1f1e9] rounded-lg shadow">

            <div className=" w-full flex flex-col items-center ">
            <h2 className="text-lg font-semibold ">Expense by Vehicle</h2>
            {maintenanceReport.length > 0 ? (
                <div className="w-full max-w-[400px] h-[300px] mx-auto">
                    <Pie data={getVehicleExpensePieData(maintenanceReport)} options={pieOptions} />
                </div>
            ) : (
                <p>No data for selected range.</p>
            )}
            </div>
            <div className=" w-full flex flex-col items-center ">
            <h2 className="text-lg font-semibold ">Expense by Action</h2>
            {maintenanceReport.length > 0 ? (
                <div className="w-full max-w-[400px] h-[300px] mx-auto hover:scale-105 transition-transform duration-200">
                    <Pie data={getActionExpensePieData(maintenanceReport)} options={pieOptions} />
                </div>
            ) : (
                <p>No data for selected range.</p>
            )}
            </div>
            <div className=" w-full flex flex-col items-center ">
            <h2 className="text-lg font-semibold ">Expense by Parts</h2>
            {maintenanceReport.length > 0 ? (
                <div className="w-full max-w-[400px] h-[300px] mx-auto hover:scale-105 transition-transform duration-200">
                    <Pie data={getComponentCategoryExpensePieData(maintenanceReport)} options={pieOptions} />
                </div>
            ) : (
                <p>No data for selected range.</p>
            )}
            </div>
            </div>
        </div>
    );
}

