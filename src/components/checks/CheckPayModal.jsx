import React, { useState, useEffect } from 'react';

export default function CheckPayModal({ open, check, onClose, onPay, payDisabled }) {
  const [relatedReceiptUrl, setRelatedReceiptUrl] = useState('');
  const [relatedReceiptFile, setRelatedReceiptFile] = useState(null);
  const [receptReference, setReceptReference] = useState('');
  const [localError, setLocalError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setRelatedReceiptUrl(check?.relatedReceiptUrl || '');
    setRelatedReceiptFile(null);
    setReceptReference(check?.recept_reference || '');
    setLocalError('');
    setUploading(false);
  }, [open, check]);

  let isPayDisabled = payDisabled || uploading;
  if (check?.type !== 'petty_cash' && check?.type !== 'fuel' ) {
    isPayDisabled = isPayDisabled || !receptReference;
  }

  // Handle image upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setRelatedReceiptFile(file);
    // Simulate upload: replace with your actual upload logic
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
    if (check?.type !== 'petty_cash' && check?.type !== 'fuel' && !receptReference) {
      setLocalError('Reference number is required');
      return;
    }
    onPay({
      checkId: check._id,
      recept_reference: receptReference,
      relatedReceiptUrl,
      type: check.type,
      
    });
  };

  if (!open || !check) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-500 hover:text-black text-3xl font-bold leading-none cursor-pointer" onClick={onClose} aria-label="Close">&times;</button>
        <h2 className="text-xl font-bold mb-4">Pay Check Request</h2>
        {check?.type && (
          <div className="mb-4 inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
            {check.type.charAt(0).toUpperCase() + check.type.slice(1)} Check
          </div>
        )}
        {check?.type === 'petty_cash' || check?.type === 'fuel' ? (
          <div className="mb-6 text-lg font-semibold text-center text-gray-700">Are you sure you want to proceed?</div>
        ) : (
          <>
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
        {localError && <div className="text-red-600 mb-2 text-sm">{localError}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 cursor-pointer"
            onClick={handlePay}
            disabled={isPayDisabled}
            type="button"
          >
            Pay
          </button>
        </div>
      </div>
    </div>
  );
} 