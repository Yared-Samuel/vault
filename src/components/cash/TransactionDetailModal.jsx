import React from 'react';

export default function TransactionDetailModal({ open, transaction, onClose }) {
  
  
  if (!open || !transaction) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 w-full max-w-2xl relative border-2 border-blue-200 max-h-[90vh] overflow-y-auto transition-all duration-200">
        <button
          className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-gray-500 hover:text-white hover:bg-blue-600 bg-white border-2 border-blue-200 rounded-full text-4xl font-bold leading-none cursor-pointer shadow-lg transition-all duration-150 z-10 group"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          <span className="group-hover:scale-125 transition-transform">&times;</span>
        </button>
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-800 tracking-wide">Transaction Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-base">
          <div className="font-semibold text-gray-700">Type:</div>
          <div className="text-gray-900">{transaction.type}</div>
          <div className="font-semibold text-gray-700">Status:</div>
          <div className="text-gray-900">{transaction.status}</div>
          <div className="font-semibold text-gray-700">Amount:</div>
          <div className="text-green-700 font-bold">{transaction.amount ?? transaction.suspenceAmount ?? '-'}</div>
          <div className="font-semibold text-gray-700">Suspence Amount:</div>
          <div className="text-gray-900">{transaction.suspenceAmount ?? '-'}</div>
          <div className="font-semibold text-gray-700">Return Amount:</div>
          <div className="text-gray-900">{transaction.returnAmount ?? '-'}</div>
          <div className="font-semibold text-gray-700">Quantity:</div>
          <div className="text-gray-900">{transaction.quantity ?? '-'}</div>
          <div className="font-semibold text-gray-700">Reference Number:</div>
          <div className="text-gray-900">{transaction.recept_reference ?? '-'}</div>
          <div className="font-semibold text-gray-700">To:</div>
          <div className="text-gray-900">{transaction.to ?? '-'}</div>
          <div className="font-semibold text-gray-700">Reason:</div>
          <div className="text-gray-900">{transaction.reason ?? '-'}</div>
          <div className="font-semibold text-gray-700">Requested By:</div>
          <div className="text-gray-900">{transaction.requestedBy?.name ?? transaction.requestedBy ?? '-'}</div>
          <div className="font-semibold text-gray-700">Created By:</div>
          <div className="text-gray-900">{transaction.createdBy?.name ?? transaction.createdBy ?? '-'}</div>
          <div className="font-semibold text-gray-700">Approved By:</div>
          <div className="text-gray-900">{transaction.approvedBy?.name ?? transaction.approvedBy ?? '-'}</div>
          <div className="font-semibold text-gray-700">Rejected By:</div>
          <div className="text-gray-900">{transaction.rejectedBy?.name ?? transaction.rejectedBy ?? '-'}</div>
          <div className="font-semibold text-gray-700">Rejected At:</div>
          <div className="text-gray-900">{transaction.rejectedAt ? new Date(transaction.rejectedAt).toLocaleString() : '-'}</div>
          <div className="font-semibold text-gray-700">Rejected Reason:</div>
          <div className="text-gray-900">{transaction.rejectedReason ?? '-'}</div>
          <div className="font-semibold text-gray-700">Vehicle:</div>
          <div className="text-gray-900">{transaction.vehicleId?.plate ?? transaction.vehicleId ?? '-'}</div>
          <div className="font-semibold text-gray-700">Serial Number:</div>
          <div className="text-gray-900">{transaction.serialNumber ?? '-'}</div>
          <div className="font-semibold text-gray-700">Requested At:</div>
          <div className="text-gray-900">{transaction.requestedAt ? new Date(transaction.requestedAt).toLocaleString() : '-'}</div>
          <div className="font-semibold text-gray-700">Date:</div>
          <div className="text-gray-900">{transaction.date ? new Date(transaction.date).toLocaleString() : '-'}</div>
          <div className="font-semibold text-gray-700">Check Request ID:</div>
          <div className="text-gray-900">{transaction.checkRequestId ?? '-'}</div>
          <div className="font-semibold text-gray-700">Cash Account:</div>
          <div className="text-gray-900">{transaction.cashAccount?.name ?? transaction.cashAccount ?? '-'}</div>
          <div className="font-semibold text-gray-700">Related Receipt URL:</div>
          <div className="text-gray-900 break-all">{transaction.relatedReceiptUrl ? <a href={transaction.relatedReceiptUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{transaction.relatedReceiptUrl}</a> : '-'}</div>
          <div className="font-semibold text-gray-700">Created At:</div>
          <div className="text-gray-900">{transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : '-'}</div>
          <div className="font-semibold text-gray-700">Updated At:</div>
          <div className="text-gray-900">{transaction.updatedAt ? new Date(transaction.updatedAt).toLocaleString() : '-'}</div>
        </div>
        <div className="flex justify-end pt-8 mt-4">
          <button className="px-6 py-2 rounded-lg border text-lg font-semibold" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
} 