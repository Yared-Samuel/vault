import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, XCircle, User, Calendar, Truck, FilePlus } from 'lucide-react';

const defaultEntry = {
  amount: '',
  quantity: '',
  recept_reference: '',
  to: '',
  reason: '',
  suspenceAmount: '',
  vehicleId: '',
  relatedReceiptFile: null,
};

const TransactionRequestform = ({ open, onClose, form, onChange, onSubmit, createdBy, users = [], vehicles = [] }) => {
  // Common fields
  const [commonFields, setCommonFields] = useState({
    requestedBy: form.requestedBy || '',
    requestedAt: form.requestedAt || new Date().toISOString().split('T')[0],
  });
  // Multiple entries
  const [entries, setEntries] = useState([ { ...defaultEntry } ]);
  const [paymentType, setPaymentType] = useState('');
  const [vehicleError, setVehicleError] = useState('');
  const [quantityError, setQuantityError] = useState('');

  const selectedUser = users.find(u => u._id === commonFields.requestedBy);
  const isTransporter = selectedUser?.role === 'transporter';

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
    // Reset entries on payment type change
    setEntries([ { ...defaultEntry } ]);
  };

  const handleCommonChange = (e) => {
    const { name, value } = e.target;
    setCommonFields(prev => ({ ...prev, [name]: value }));
  };

  const handleEntryChange = (idx, e) => {
    const { name, value, type, files } = e.target;
    setEntries(prev => prev.map((entry, i) =>
      i === idx ? { ...entry, [name]: type === 'file' ? files[0] : value } : entry
    ));
  };

  const addEntry = () => {
    setEntries(prev => [ ...prev, { ...defaultEntry } ]);
  };

  const removeEntry = (idx) => {
    setEntries(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setCommonFields({
      requestedBy: '',
      requestedAt: new Date().toISOString().split('T')[0],
    });
    setEntries([{ ...defaultEntry }]);
    setPaymentType('');
    setVehicleError('');
    setQuantityError('');
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative animate-fade-in"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
      >
        <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl font-bold leading-none cursor-pointer transition-colors" onClick={onClose} aria-label="Close">
          <XCircle size={32} />
        </button>
        <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-2 text-blue-900">
          <FilePlus className="text-blue-500" size={28} /> New Payment Request
        </h2>
        {/* Payment Type Selection */}
        <div className="mb-6 flex gap-8 justify-center">
          <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border transition-all ${paymentType === 'receipt_payment' ? 'bg-blue-100 border-blue-400 text-blue-900 font-semibold shadow' : 'bg-gray-50 border-gray-200 hover:bg-blue-50'}`}
            title="Request for a receipt payment">
            <input
              type="radio"
              name="paymentType"
              value="receipt_payment"
              checked={paymentType === 'receipt_payment'}
              onChange={() => handlePaymentTypeChange('receipt_payment')}
              className="accent-blue-500"
            />
            Receipt Payment
          </label>
          <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border transition-all ${paymentType === 'suspence_payment' ? 'bg-blue-100 border-blue-400 text-blue-900 font-semibold shadow' : 'bg-gray-50 border-gray-200 hover:bg-blue-50'}`}
            title="Request for a suspence payment">
            <input
              type="radio"
              name="paymentType"
              value="suspence_payment"
              checked={paymentType === 'suspence_payment'}
              onChange={() => handlePaymentTypeChange('suspence_payment')}
              className="accent-blue-500"
            />
            Suspence Payment
          </label>
        </div>
        {/* Only show the form after a payment type is selected */}
        {paymentType && (
          <form onSubmit={e => {
            let hasError = false;
            if (isTransporter && entries.some(entry => !entry.vehicleId)) {
              setVehicleError('Vehicle is required for transporter');
              hasError = true;
            } else {
              setVehicleError('');
            }
            if (entries.some(entry => !entry.quantity || isNaN(Number(entry.quantity)) || Number(entry.quantity) <= 0)) {
              setQuantityError('Quantity must be greater than 0');
              hasError = true;
            } else {
              setQuantityError('');
            }
            if (hasError) {
              e.preventDefault();
              return;
            }
            // Compose payloads for all entries
            const allEntries = entries.map(entry => ({
              ...entry,
              status: 'requested',
              type: paymentType,
              createdBy,
              requestedBy: commonFields.requestedBy,
              requestedAt: commonFields.requestedAt,
            }));
            // Call onSubmit with all entries
            e.preventDefault();
            onSubmit(allEntries, e);
            resetForm();
          }} className="space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 rounded-lg p-4 mb-2 border border-blue-100">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-blue-900 flex items-center gap-1"><User size={18} /> Requested By</label>
                <select
                  name="requestedBy"
                  value={commonFields.requestedBy}
                  onChange={handleCommonChange}
                  className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                  required
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-blue-900 flex items-center gap-1"><Calendar size={18} /> Requested At</label>
                <input type="date" name="requestedAt" value={commonFields.requestedAt} onChange={handleCommonChange} className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition" required />
              </div>
            </div>
            {/* Multiple Entries */}
            <div className="space-y-6">
              {entries.map((entry, idx) => (
                <div key={idx} className="relative bg-white border-2 border-blue-100 rounded-xl shadow-sm p-5 transition hover:shadow-lg group">
                  {entries.length > 1 && (
                    <button type="button" className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition" onClick={() => removeEntry(idx)} title="Remove Entry">
                      <Trash2 size={22} />
                    </button>
                  )}
                  <div className="mb-2 flex items-center gap-2 text-blue-700 font-semibold text-lg">
                    Entry {idx + 1}
                  </div>
                  {/* Vehicle input for transporter */}
                  {isTransporter && (
                    <div className="mb-2">
                      <label className="font-medium text-blue-900 flex items-center gap-1"><Truck size={16} /> Vehicle <span className="text-red-500">*</span></label>
                      <select
                        name="vehicleId"
                        value={entry.vehicleId || ''}
                        onChange={e => handleEntryChange(idx, e)}
                        className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                        required
                      >
                        <option value="">Select Vehicle</option>
                        {vehicles.map(vehicle => (
                          <option key={vehicle._id} value={vehicle._id}>
                            {vehicle.plate}{vehicle.model ? ` - ${vehicle.model}` : ''}
                          </option>
                        ))}
                      </select>
                      {vehicleError && <div className="text-red-500 text-xs mt-1">{vehicleError}</div>}
                    </div>
                  )}
                  {/* Fields for receipt_payment */}
                  {paymentType === 'receipt_payment' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium text-blue-900">Amount</label>
                        <input type="number" name="amount" value={entry.amount} onChange={e => handleEntryChange(idx, e)} className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" required />
                      </div>
                      <div>
                        <label className="font-medium text-blue-900">Quantity</label>
                        <input type="number" name="quantity" value={entry.quantity || ''} onChange={e => handleEntryChange(idx, e)} className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" required />
                        {quantityError && <div className="text-red-500 text-xs mt-1">{quantityError}</div>}
                      </div>
                      <div>
                        <label className="font-medium text-blue-900">Reference Number</label>
                        <input type="text" name="recept_reference" value={entry.recept_reference || ''} onChange={e => handleEntryChange(idx, e)} className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" />
                      </div>
                      <div>
                        <label className="font-medium text-blue-900">To</label>
                        <input type="text" name="to" value={entry.to} onChange={e => handleEntryChange(idx, e)} className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" required />
                      </div>
                      <div className="md:col-span-2">
                        <label className="font-medium text-blue-900">Reason</label>
                        <input type="text" name="reason" value={entry.reason} onChange={e => handleEntryChange(idx, e)} className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" required />
                      </div>
                    </div>
                  )}
                  {/* Fields for suspence_payment */}
                  {paymentType === 'suspence_payment' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium text-blue-900">Suspence Amount</label>
                        <input type="number" name="suspenceAmount" value={entry.suspenceAmount} onChange={e => handleEntryChange(idx, e)} className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" required />
                      </div>
                      <div>
                        <label className="font-medium text-blue-900">Quantity</label>
                        <input type="number" name="quantity" value={entry.quantity || ''} onChange={e => handleEntryChange(idx, e)} className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" required />
                        {quantityError && <div className="text-red-500 text-xs mt-1">{quantityError}</div>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="font-medium text-blue-900">Reason</label>
                        <input type="text" name="reason" value={entry.reason} onChange={e => handleEntryChange(idx, e)} className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" required />
                      </div>
                    </div>
                  )}
                  {/* Related Receipt File for receipt_payment only */}
                  {paymentType === 'receipt_payment' && (
                    <div className="mt-2">
                      <label className="font-medium text-blue-900">Related Receipt File</label>
                      <input
                        type="file"
                        name="relatedReceiptFile"
                        accept="application/pdf,image/*"
                        onChange={e => handleEntryChange(idx, e)}
                        className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t mt-6 gap-4">
              <button type="button" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold transition" onClick={onClose}>Cancel</button>
              <div className="flex gap-2">
                <Button type="button" onClick={addEntry} className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-semibold px-4 py-2 rounded-lg transition"><PlusCircle size={20} /> Add Entry</Button>
                <Button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition shadow"><FilePlus size={20} /> Submit</Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default TransactionRequestform;