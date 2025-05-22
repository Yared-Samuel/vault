import React, { useState } from "react";

export default function RejectModal({ open, onClose, onSubmit, transaction }) {
  const [rejectionReason, setRejectionReason] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] max-w-xs border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold text-gray-800">Reject Request</div>
          <button
            className="text-gray-400 hover:text-gray-700 text-xl cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >×</button>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-2xl font-bold text-green-600">
            {transaction && (transaction.amount || transaction.suspenceAmount)}
          </span>
          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-semibold">Pending</span>
        </div>
        <div className="mb-3">
          <label className="block font-semibold text-gray-700 mb-1">
            Rejection Reason: <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder="Please provide a reason for rejection"
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            rows={2}
            required
          />
        </div>
        <div className="flex gap-2 justify-end mt-2">
          <button
            className="px-3 py-1 rounded bg-red-500 text-white font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer hover:bg-red-700 transition"
            disabled={!rejectionReason.trim()}
            onClick={() => {
              onSubmit(rejectionReason);
              setRejectionReason("");
            }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
} 