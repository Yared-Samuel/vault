import { FilePlus } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function PayModal({
  open,
  tx,
  cashAccounts,
  selectedCashAccount,
  onAccountChange,
  onClose,
  onPay,
  payDisabled,
}) {
  const [relatedReceiptUrl, setRelatedReceiptUrl] = useState("");
  const [relatedReceiptFile, setRelatedReceiptFile] = useState(null);
  const [returnAmount, setReturnAmount] = useState("");
  const [reason, setReason] = useState("");
  const [to, setTo] = useState("");
  const [receptReference, setReceptReference] = useState("");
  const [localError, setLocalError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [vehicleMaintenance, setVehicleMaintenance] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  useEffect(() => {
    setRelatedReceiptUrl(tx?.relatedReceiptUrl || "");
    setRelatedReceiptFile(null);
    setReturnAmount(
      tx?.returnAmount !== undefined && tx?.returnAmount !== null
        ? String(tx.returnAmount)
        : ""
    );
    setReason(tx?.reason || "");
    setTo(tx?.to || "");
    setReceptReference(tx?.recept_reference || "");
    setLocalError("");
    setUploading(false);
    setVehicleMaintenance(
      tx?.vehicleMaintenance
        ? tx.vehicleMaintenance.map((vm) => ({ ...vm }))
        : []
    );
  }, [open, tx]);

  // Fetch vehicles for dropdown
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/vehicles");
        const data = await res.json();
        if (data.success) {
          setVehicles(data.data);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchVehicles();
  }, []);

  let isPayDisabled = payDisabled || uploading;
  if (tx) {
    if (tx.type === "receipt_payment") {
      isPayDisabled = isPayDisabled || !reason || !to || !receptReference;
    } else if (tx.type === "suspence_payment") {
      isPayDisabled =
        isPayDisabled ||
        !returnAmount ||
        isNaN(Number(returnAmount)) ||
        !reason ||
        !to;
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
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setRelatedReceiptUrl(data.url);
      } else {
        setLocalError("Failed to upload image");
      }
    } catch (err) {
      setLocalError("Failed to upload image");
    }
    setUploading(false);
  };

  // Handler for editing vehicle maintenance fields (row-based)
  const handleVehicleRowChange = (idx, e) => {
    const { name, value } = e.target;
    setVehicleMaintenance((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        if (name === "vehicleId") {
          const selectedVehicle = vehicles.find((v) => v._id === value);
          return {
            ...item,
            vehicleId: selectedVehicle
              ? {
                  _id: selectedVehicle._id,
                  plate: selectedVehicle.plate,
                  model: selectedVehicle.model,
                }
              : {},
          };
        }
        return {
          ...item,
          [name]: name === "amount" ? Number(value) : value,
        };
      })
    );
  };

  const handleAddVehicleRow = () => {
    setVehicleMaintenance((prev) => [
      ...prev,
      { vehicleId: {}, description: "", amount: "" },
    ]);
  };

  const handleRemoveVehicleRow = (idx) => {
    setVehicleMaintenance((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePay = () => {
    if (tx.type === "receipt_payment") {
      if (!reason || !to || !receptReference) {
        setLocalError("All fields are required");
        return;
      }
      onPay({
        reason,
        to,
        recept_reference: receptReference,
        vehicleMaintenance: vehicleMaintenance.map(vm => ({
          vehicleId: vm.vehicleId?._id || '',
          description: vm.description,
          amount: vm.amount
        }))
      });
    } else if (tx.type === "suspence_payment") {
      if (
        !returnAmount ||
        isNaN(Number(returnAmount)) ||
        !reason ||
        !to ||
        !receptReference
      ) {
        setLocalError("All fields are required");
        return;
      }
      onPay({
        returnAmount: Number(returnAmount),
        reason,
        to,
        recept_reference: receptReference,
        vehicleMaintenance: vehicleMaintenance.map(vm => ({
          vehicleId: vm.vehicleId?._id || '',
          description: vm.description,
          amount: vm.amount
        })),
      });
    } else {
      onPay({});
    }
  };

  if (!open || !tx) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  drop-shadow-lg">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-11/12 relative max-h-[80vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-3xl font-bold leading-none cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex justify-between mt-4">

        <div className="mb-4 max-w-xs">
          <label className="block mb-2 font-semibold">Cash Account <span className="text-red-500">*</span></label>
          <select
            className="w-full border rounded px-2 py-1"
            value={selectedCashAccount}
            onChange={onAccountChange}
            required
          >
            <option value="">Select account</option>
            {cashAccounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.name} &mdash; Balance: {account.balance}
              </option>
            ))}
          </select>
        </div>
           


        <div className="">
          
          <button
            className="px-3 py-4 flex gap-2 border border-gray-300 rounded-lg text-black font-semibold cursor-pointer disabled:bg-gray-200 disabled:text-white disabled:cursor-not-allowed"
            disabled={isPayDisabled}
            onClick={handlePay}
          >
          <FilePlus size={20} />  Pay
          </button>
        </div>

        </div>

        <div className="flex justify-between">
       
        {/* Conditional fields */}
        {tx.type === "receipt_payment" && (
          
            
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
          
        )}
        {tx.type === "suspence_payment" && (
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
        </div>
        {/* Vehicle Maintenance Details Section (row-based) */}
        <div className="mb-4">
              <label className="block mb-2 font-semibold">Vehicle Maintenance Details</label>
              {/* Add Row UI */}
              <div className="flex items-end gap-3 mb-4">
                <div className="flex flex-col" style={{ minWidth: 180 }}>
                  <label className="text-[#444444] text-sm font-bold mb-1">Vehicle</label>
                  <select
                    name="vehicleId"
                    value={''}
                    onChange={e => {
                      handleAddVehicleRow();
                      handleVehicleRowChange(vehicleMaintenance.length, e);
                    }}
                    className="border border-gray-300 rounded px-2 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white min-w-[140px] max-w-[200px]"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.plate}{vehicle.model ? ` - ${vehicle.model}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Table of added rows */}
              {vehicleMaintenance.length > 0 && (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border border-gray-200 rounded">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Vehicle</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicleMaintenance.map((row, idx) => {
                        const vehicle = vehicles.find((v) => v._id === row.vehicleId?._id);
                        return (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-2 text-sm">
                              <select
                                name="vehicleId"
                                value={row.vehicleId?._id || ''}
                                onChange={e => handleVehicleRowChange(idx, e)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white min-w-[120px] max-w-[180px]"
                              >
                                <option value="">Select Vehicle</option>
                                {vehicles.map((vehicle) => (
                                  <option key={vehicle._id} value={vehicle._id}>
                                    {vehicle.plate}{vehicle.model ? ` - ${vehicle.model}` : ""}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <input
                                type="text"
                                name="description"
                                value={row.description || ''}
                                onChange={e => handleVehicleRowChange(idx, e)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white min-w-[120px] max-w-[200px]"
                                placeholder="Description"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <input
                                type="number"
                                name="amount"
                                value={row.amount || ''}
                                onChange={e => handleVehicleRowChange(idx, e)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white min-w-[80px] max-w-[120px]"
                                placeholder="Amount"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <button
                                type="button"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveVehicleRow(idx)}
                                title="Remove"
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
        {localError && <div className="text-red-500 mb-2 text-sm">{localError}</div>}
      </div>
    </div>
  );
} 
