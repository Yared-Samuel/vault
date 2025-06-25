import { transactionAction, vehicleComponents, vehicleComponentsCatagory } from "@/lib/constants";
import { FilePlus, Trash2 } from "lucide-react";
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
  const [vehicleMaintenance, setVehicleMaintenance] = useState({
    vehicleId: "",
    action: "",
    vehicleComponentCategory: "",
    vehicleComponents: "",
    description: "",
    amount: "",
    km: "",
  });
  const [vehicles, setVehicles] = useState([]);
  const [fetchedVehicleMaintenance, setFetchedVehicleMaintenance] = useState([]);
  const [editableVehicleMaintenance, setEditableVehicleMaintenance] = useState([]);
  const [loadingVM, setLoadingVM] = useState(false);

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

  useEffect(() => {
    if (tx && tx._id && tx.paymentType === 'vehicleMaintenance') {
      setLoadingVM(true);
      fetch(`/api/transactions/${tx._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data.vehicleMaintenance)) {
            setFetchedVehicleMaintenance(data.data.vehicleMaintenance);
            setEditableVehicleMaintenance(data.data.vehicleMaintenance.map(vm => ({ ...vm })));
          } else {
            setFetchedVehicleMaintenance([]);
            setEditableVehicleMaintenance([]);
          }
          setLoadingVM(false);
        })
        .catch(() => {
          setFetchedVehicleMaintenance([]);
          setEditableVehicleMaintenance([]);
          setLoadingVM(false);
        });
    }
  }, [tx && tx._id]);

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
  const handleVehicleRowChange = (e) => {
    const { name, value } = e.target;
    setVehicleMaintenance((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVehicleRow = (e) => {
    e.preventDefault();
    if (tx.paymentType === "vehicleMaintenance") {
      if (
        !vehicleMaintenance.vehicleId ||
        !vehicleMaintenance.description ||
        !vehicleMaintenance.amount
      )
        return;
    } else {
      if (!vehicleMaintenance.description || !vehicleMaintenance.amount) return;
    }
    setVehicleMaintenance((prev) => [...prev, { ...vehicleMaintenance }]);
    setVehicleMaintenance({
      vehicleId: "",
      action: "",
      vehicleComponentCategory: "",
      vehicleComponents: "",
      description: "",
      amount: "",
    });
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

  const filteredVehicleComponents = vehicleMaintenance.vehicleComponentCategory
    ? vehicleComponents.filter(
        (item) => item.category === vehicleMaintenance.vehicleComponentCategory
      )
    : [];

  const handleEditVMChange = (idx, field, value) => {
    setEditableVehicleMaintenance(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleSaveVMRow = async (idx) => {
    const row = editableVehicleMaintenance[idx];
    // PATCH request to update the vehicleMaintenance row
    await fetch(`/api/vehicle-maintenance/${row._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row)
    });
    // Optionally, refetch or update fetchedVehicleMaintenance
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
        
                              
                {fetchedVehicleMaintenance.length > 0 && (
                <div className="mb-4">
              <div className="overflow-x-auto mb-4">
                <h2 className="text-md font-extrabold flex items-center gap-2 text-[#02733E]">
                  Vehicle Maintenance Info (Spare Part)
                </h2>
                
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                    <thead>
                      <tr className="bg-blue-50 text-sm">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Vehicle</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">KM</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Parts Category</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Parts</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Quantity</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>                                                                      
                      {editableVehicleMaintenance.map((row, idx) => (
                        <tr key={row._id || idx} className={
                          `transition border-t ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`
                        }>
                          <td className="px-4 py-2 text-xs">{row.vehicleId?.plate || '-'}</td>
                          <td className="px-4 py-2 text-xs">{row.km}</td>
                          <td className="px-4 py-2 text-xs">{row.vehicleComponentCategory}</td>
                          <td className="px-4 py-2 text-xs">{row.vehicleComponents}</td>
                          <td className="px-4 py-2 text-xs">{row.action}</td>
                          <td className="px-4 py-2 text-xs">{row.description}</td>
                          <td className="px-4 py-2 text-xs">{row.qty}</td>
                          <td className="px-4 py-2 text-xs">{row.amount}</td>
                        </tr>
                      ))}
                      {/* Total row */}
                      <tr className="bg-blue-100 font-bold">
                        <td colSpan={5} className="px-4 py-2 text-right">Total</td>
                        <td className="px-4 py-2">
                          {editableVehicleMaintenance.reduce((sum, row) => sum + Number(row.amount || 0), 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            )}
        </div>
        
        {localError && <div className="text-red-500 mb-2 text-sm">{localError}</div>}
      </div>
  
  );
} 
