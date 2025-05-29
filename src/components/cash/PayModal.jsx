import React, { useState, useEffect } from 'react';

export default function PayModal({ open, tx, cashAccounts, selectedCashAccount, onAccountChange, onClose, onPay, payDisabled }) {
  const [relatedReceiptUrl, setRelatedReceiptUrl] = useState('');
  const [relatedReceiptFile, setRelatedReceiptFile] = useState(null);
  const [returnAmount, setReturnAmount] = useState('');
  const [reason, setReason] = useState('');
  const [to, setTo] = useState('');
  const [receptReference, setReceptReference] = useState('');
  const [localError, setLocalError] = useState('');
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    setRelatedReceiptUrl(tx?.relatedReceiptUrl || '');
    setRelatedReceiptFile(null);
    setReturnAmount(tx?.returnAmount !== undefined && tx?.returnAmount !== null ? String(tx.returnAmount) : '');
    setReason(tx?.reason || '');
    setTo(tx?.to || '');
    setReceptReference(tx?.recept_reference || '');
    setLocalError('');
    setUploading(false);
  }, [open, tx]);

  let isPayDisabled = payDisabled || uploading;
  if (tx) {
    if (tx.type === 'receipt_payment') {
      isPayDisabled = isPayDisabled || !reason || !to || !receptReference;
    } else if (tx.type === 'suspence_payment') {
      isPayDisabled = isPayDisabled || !returnAmount || isNaN(Number(returnAmount)) || !reason || !to;
    }
  }

  // Handle image upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setRelatedReceiptFile(file);
    // Simulate upload: replace with your actual upload logic
    // Example: upload to /api/upload and get the URL
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setRelatedReceiptUrl(data.url);
      } else {
        setLocalError('Failed to upload image');
      }
    } catch (err) {
      setLocalError('Failed to upload image');
    }
    setUploading(false);
  };

  const handlePay = () => {
    if (tx.type === 'receipt_payment') {
      if (!reason || !to || !receptReference) {
        setLocalError('All fields are required');
        return;
      }
      onPay({ relatedReceiptUrl, reason, to, recept_reference: receptReference });
    } else if (tx.type === 'suspence_payment') {
      if (!returnAmount || isNaN(Number(returnAmount)) || !reason || !to || !receptReference) {
        setLocalError('All fields are required');
        return;
      }
      onPay({
        returnAmount: Number(returnAmount),
        relatedReceiptUrl,
        reason,
        to,
        recept_reference: receptReference
      });
      console.log(onPay);
    } else {
      onPay({});
    }
  };

  if (!open || !tx) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  ">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-500 hover:text-black text-3xl font-bold leading-none cursor-pointer" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-xl font-bold mb-4">Select Cash Account</h2>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Cash Account</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={selectedCashAccount}
            onChange={onAccountChange}
          >
            <option value="">Select account</option>
            {cashAccounts.map(account => (
              <option key={account._id} value={account._id}>
                {account.name} &mdash; Balance: {account.balance}
              </option>
            ))}
          </select>
        </div>
        {/* Conditional fields */}
        {tx.type === 'receipt_payment' && (
          <>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Receipt Image</label>
              <input
                type="file"
                accept="image/*"
                className="w-full border rounded px-2 py-1"
                onChange={handleFileChange}
              />
              {uploading && <div className="text-blue-500 text-sm">Uploading...</div>}
              {relatedReceiptUrl && (
                <div className="mt-2"><img src={relatedReceiptUrl} alt="Receipt Preview" className="max-h-32 rounded" /></div>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Reference Number<span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                value={receptReference}
                onChange={e => setReceptReference(e.target.value)}
                placeholder="Enter reference number"
                required
              />
            </div>
          </>
        )}
        {tx.type === 'suspence_payment' && (
          <>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Return Amount<span className="text-red-500">*</span></label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={returnAmount}
                onChange={e => setReturnAmount(e.target.value)}
                placeholder="Enter return amount"
                required
              />
              {tx.suspenceAmount !== undefined && returnAmount !== '' && !isNaN(Number(returnAmount)) && (
                <div className="mt-2 text-sm text-gray-700">
                  Recept Amount: {tx.suspenceAmount} - {Number(returnAmount)} = <span className="font-bold">{tx.suspenceAmount - Number(returnAmount)}</span>
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Reference Number<span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                value={receptReference}
                onChange={e => setReceptReference(e.target.value)}
                placeholder="Enter reference number"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Receipt Image</label>
              <input
                type="file"
                accept="image/*"
                className="w-full border rounded px-2 py-1"
                onChange={handleFileChange}
              />
              {uploading && <div className="text-blue-500 text-sm">Uploading...</div>}
              {relatedReceiptUrl && (
                <div className="mt-2"><img src={relatedReceiptUrl} alt="Receipt Preview" className="max-h-32 rounded" /></div>
              )}
            </div>
          </>
        )}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">To<span className="text-red-500">*</span></label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1"
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="Enter recipient (To)"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Reason<span className="text-red-500">*</span></label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Enter reason"
            required
          />
        </div>
        {localError && <div className="text-red-500 mb-2 text-sm">{localError}</div>}
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={isPayDisabled}
            onClick={handlePay}
          >
            Pay
          </button>
        </div>
      </div>
    </div>
  );
} 