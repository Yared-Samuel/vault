import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function formatCurrency(amount) {
  if (typeof amount === 'number' || !isNaN(Number(amount))) {
    return Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }
  return amount;
}

function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const badgeColors = {
  requested: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  paid: 'bg-green-200 text-green-900',
  rejected: 'bg-red-100 text-red-800',
  suspence: 'bg-yellow-100 text-yellow-800',
};

const TransactionDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/transactions/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTransaction(data.data);
          setError(null);
        } else {
          setError(data.message || 'Failed to fetch transaction.');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch transaction.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-10 text-lg">Loading...</div>;
  if (error) return <div className="text-red-600 text-center py-10">{error}</div>;
  if (!transaction) return <div className="text-center py-10">No transaction found.</div>;

  // Report generation date

  return (
    <div className="w-full max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-8 border border-gray-200">
      {/* Page heading with status/type badges */}
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          Transaction Details
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-2 ${badgeColors[transaction.status] || 'bg-gray-100 text-gray-700'}`}>{transaction.status}</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold ml-2 bg-gray-100 text-gray-700">{transaction.type}</span>
        </h1>
        <button
          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition"
          onClick={() => router.push('/transactions')}
        >
          ← Back to Transactions
        </button>
      </div>

      {/* Main details section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Transaction Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          <div><span className="font-semibold text-gray-600">Reason:</span> <span className="text-gray-900">{transaction.reason}</span></div>
          <div><span className="font-semibold text-gray-600">Amount:</span> <span className="text-gray-900">{formatCurrency(transaction.amount)}</span></div>
          <div><span className="font-semibold text-gray-600">To:</span> <span className="text-gray-900">{transaction.to}</span></div>
          <div><span className="font-semibold text-gray-600">Quantity:</span> <span className="text-gray-900">{transaction.quantity}</span></div>
          <div><span className="font-semibold text-gray-600">Reference:</span> <span className="text-gray-900">{transaction.recept_reference}</span></div>
          <div><span className="font-semibold text-gray-600">Suspence Amount:</span> <span className="text-gray-900">{formatCurrency(transaction.suspenceAmount)}</span></div>
          <div><span className="font-semibold text-gray-600">Return Amount:</span> <span className="text-gray-900">{formatCurrency(transaction.returnAmount)}</span></div>
          <div><span className="font-semibold text-gray-600">Requested By:</span> <span className="text-gray-900">{transaction.requestedBy?.name || '-'}</span></div>
          <div><span className="font-semibold text-gray-600">Created By:</span> <span className="text-gray-900">{transaction.createdBy?.name || '-'}</span></div>
          <div><span className="font-semibold text-gray-600">Approved By:</span> <span className="text-gray-900">{transaction.approvedBy?.name || '-'}</span></div>
          <div><span className="font-semibold text-gray-600">Check Request:</span> <span className="text-gray-900">{transaction.checkRequestId?.checkNumber || '-'}</span></div>
          <div><span className="font-semibold text-gray-600">Cash Account:</span> <span className="text-gray-900">{transaction.cashAccount?.name || '-'}</span></div>
          <div><span className="font-semibold text-gray-600">Requested At:</span> <span className="text-gray-900">{formatDate(transaction.requestedAt)}</span></div>
          <div><span className="font-semibold text-gray-600">Created At:</span> <span className="text-gray-900">{formatDate(transaction.createdAt)}</span></div>
          <div><span className="font-semibold text-gray-600">Updated At:</span> <span className="text-gray-900">{formatDate(transaction.updatedAt)}</span></div>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-8 border-gray-300" />

      {/* Vehicle Maintenance Section */}
      {Array.isArray(transaction.vehicleMaintenance) && transaction.vehicleMaintenance.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2 border-b pb-2">
            Vehicle Maintenance
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{transaction.vehicleMaintenance.length}</span>
          </h2>
          <div className="overflow-x-auto pb-10">
            <table className="min-w-full border border-gray-300 rounded-lg bg-gray-50">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Plate</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">KM</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Parts Catagory</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Parts</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Description</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Quantity</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transaction.vehicleMaintenance.map((vm, idx) => (
                  <tr key={vm._id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                    <td className="px-2 py-2 border-b border-gray-200">{vm.vehicleId?.plate} <span className="text-xs text-gray-500"> {vm.vehicleId?.model}</span></td>
                    <td className="px-2 py-2 border-b border-gray-200">{vm.km || '-'}</td>
                    <td className="px-2 py-2 border-b border-gray-200">{vm.action || '-'}</td>
                    <td className="px-2 py-2 border-b border-gray-200">{vm.vehicleComponentCategory || '-'}</td>
                    <td className="px-2 py-2 border-b border-gray-200">{vm.vehicleComponents || '-'}</td>
                    <td className="px-2 py-2 border-b border-gray-200">{vm.description || '-'}</td>
                    <td className="px-2 py-2 border-b border-gray-200">{vm.qty || '-'}</td>
                    <td className="px-2 py-2 border-b border-gray-200">{formatCurrency(vm.amount)}</td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-blue-100 font-bold">
                  <td colSpan={7} className="px-4 py-2 text-right border-b border-gray-300">Total</td>
                  <td className="px-4 py-2 border-b border-gray-300">
                    {formatCurrency(transaction.vehicleMaintenance.reduce((sum, vm) => sum + Number(vm.amount || 0), 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetail;