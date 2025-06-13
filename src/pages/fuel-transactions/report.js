import Image from 'next/image';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

function formatDateShort(date) {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function formatDateLong(date) {
  if (!date) return '';
  return format(new Date(date), 'MMMM d yyyy');
}

export default function FuelTransactionsReport() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    // Read report data from localStorage
    const data = localStorage.getItem('fuelReportData');
    if (data) {
      setReport(JSON.parse(data));
      setTimeout(() => window.print(), 400); // Print after render
    }
  }, []);

  if (!report) {
    return <div style={{ padding: 40, textAlign: 'center' }}>No report data found.</div>;
  }

  const { filteredTransactions, dateRange, selectedVehicle, vehicles } = report;
  const totalVehicles = new Set(filteredTransactions.map(tx => tx.vehicleId?._id)).size;
  const totalLiters = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.liters) || 0), 0);
  const totalCost = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.totalCost) || 0), 0);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 40, fontFamily: 'sans-serif', color: '#222' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-18 h-18 relative">
            <Image src="/Logo.png" alt="Company Logo" fill style={{objectFit:'contain'}}/>
          </div>
          <div className="text-xl font-extrabold text-gray-700 ml-2">Girma Gifawoosen Trading</div>
        </div>
        <div style={{ textAlign: 'right', color: '#444', fontSize: 15, marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>Report Generated:</span> {formatDateLong(new Date())} {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 30, color: '#1a202c', marginBottom: 4, letterSpacing: 1 }}>Summary of Fuel Transactions</h2>
        <div style={{ color: '#444', fontSize: 18, marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>Reporting Period:</span> {dateRange?.[0]?.startDate && dateRange?.[0]?.endDate ? (
            <span>{formatDateLong(dateRange[0].startDate)} - {formatDateLong(dateRange[0].endDate)}</span>
          ) : (
            <span>All Dates</span>
          )}
          {selectedVehicle && (
            <span style={{ marginLeft: 16 }}>
              <span style={{ fontWeight: 600 }}>Vehicle Filter:</span> {selectedVehicle.plate} {selectedVehicle.model ? `- ${selectedVehicle.model}` : ''}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 18 }}>
        <div style={{ fontWeight: 600, color: '#2d3748', background: 'white', borderRadius: 8, padding: '8px 18px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontWeight: 700 }}>Total Unique Vehicles:</span> {totalVehicles}
        </div>
        <div style={{ fontWeight: 600, color: 'black', background: 'white', borderRadius: 8, padding: '8px 18px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontWeight: 700 }}>Aggregate Liters Dispensed:</span> {totalLiters.toLocaleString(undefined, { maximumFractionDigits: 2 })} Lt
        </div>
        <div style={{ fontWeight: 600, color: 'black', background: 'white', borderRadius: 8, padding: '8px 18px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontWeight: 700 }}>Aggregate Fuel Cost:</span> {totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB
        </div>
      </div>
      <div style={{ fontWeight: 600, color: '#1a202c', fontSize: 18, margin: '32px 0 12px 0', textAlign: 'left' }}>
        Detailed Transaction Listing
      </div>
      <div style={{ overflowX: 'auto',  }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, background: '#fff' }}>
          <thead style={{ background: '#f7fafc' }}>
            <tr>
              <th style={{ padding: '4px 4px', border: '1px solid #e2e8f0', fontWeight: 700 }}>No.</th>
              <th style={{ padding: '4px 4px', border: '1px solid #e2e8f0', fontWeight: 700 }}>Plate</th>
              <th style={{ padding: '4px 4px', border: '1px solid #e2e8f0', fontWeight: 700 }}>Model</th>
              <th style={{ padding: '4px 4px', border: '1px solid #e2e8f0', fontWeight: 700 }}>Liters</th>
              <th style={{ padding: '4px 4px', border: '1px solid #e2e8f0', fontWeight: 700 }}>KM/L</th>
              <th style={{ padding: '4px 4px', border: '1px solid #e2e8f0', fontWeight: 700 }}>Total Cost</th>
              <th style={{ padding: '4px 4px', border: '1px solid #e2e8f0', fontWeight: 700 }}>Odometer</th>
              <th style={{ padding: '4px 4px', border: '1px solid #e2e8f0', fontWeight: 700 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx, idx) => (
              <tr key={tx._id || idx}>
                <td style={{ padding: '4px 4px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ padding: '4px 4px', border: '1px solid #e2e8f0' }}>{tx.vehicleId?.plate}</td>
                <td style={{ padding: '4px 4px', border: '1px solid #e2e8f0' }}>{tx.vehicleId?.model || ''}</td>
                <td style={{ padding: '4px 4px', border: '1px solid #e2e8f0' }}>{Number(tx.liters).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td style={{ padding: '4px 4px', border: '1px solid #e2e8f0' }}>{Number(tx.km_lit).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td style={{ padding: '4px 4px', border: '1px solid #e2e8f0' }}>{Number(tx.totalCost).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td style={{ padding: '4px 4px', border: '1px solid #e2e8f0' }}>{Number(tx.odometer).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td style={{ padding: '4px 4px', border: '1px solid #e2e8f0' }}>{formatDateLong(tx.pumpedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 2, display: 'flex', justifyContent: 'space-between', gap: 32 }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: 32 }}>Prepared By</div>
          <div style={{ borderBottom: '1px solid #aaa', height: 32, marginBottom: 8 }}></div>
          <div style={{ color: '#888', fontSize: 14 }}>Name & Signature</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: 32 }}>Approved By</div>
          <div style={{ borderBottom: '1px solid #aaa', height: 32, marginBottom: 8 }}></div>
          <div style={{ color: '#888', fontSize: 14 }}>Name & Signature</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: 32 }}>Paid By</div>
          <div style={{ borderBottom: '1px solid #aaa', height: 32, marginBottom: 8 }}></div>
          <div style={{ color: '#888', fontSize: 14 }}>Name & Signature</div>
        </div>
      </div>
    </div>
  );
} 