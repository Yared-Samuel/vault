import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../../context/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  FilePlus,
} from "lucide-react";
import {
  paymentTypesModel,
  vehicleComponentsCatagory,
  transactionAction,
  vehicleComponents,
} from "@/lib/constants";
import { toast } from "sonner";
export default function NewTransactionRequestPage() {
  const { auth } = useContext(AuthContext);
  const router = useRouter();
  const [form, setForm] = useState({
    transactionSource: "cashAccount",
    paymentCategory: "",
    status: "",
    cashAccount: "",
    checkRequestId: "",
    type: "",
    suspenceAmount: "",
    returnAmount: "",
    date: "",
    pitiCash: false,
    amount: "",
    to: "",
    reason: "",
    approvedBy: "",
    requestedBy: auth?.id || "",
    createdBy: auth?.id || "",
    quantity: "",
    recept_reference: "",
  });
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users/users");
        const data = await res.json();
        if (data.success) {
          setUsers(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/vehicles");
        const data = await res.json();
        if (data.success) {
          setVehicles(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch vehicles", err);
      }
    };
    fetchVehicles();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    let newForm = {
      ...form,
      [name]: type === "checkbox" ? checked : value,
    };
    // Status logic
    if (name === "transactionSource") {
      if (value === "cashAccount") {
        newForm.status = newForm.type === "suspence" ? "suspence" : "requested";
        newForm.checkRequestId = "";
      } else if (value === "checkRequestId") {
        newForm.status = "paid";
        newForm.cashAccount = "";
      }
    }
    if (name === "type") {
      if (value === "suspence") {
        newForm.status = "suspence";
      } else if (form.transactionSource === "cashAccount") {
        newForm.status = "requested";
      }
    }
    setForm(newForm);
  }

  async function handleSubmit(entries, e) {
    e.preventDefault && e.preventDefault();
    setFormError("");
    setError(null);
    if (submitting) return;
    setSubmitting(true);
    let allSuccess = true;
    let lastError = null;
    try {
      // Validate required fields for each entry
      for (const formEntry of entries) {
        if (!formEntry.requestedBy || !formEntry.type || !formEntry.reason) {
          setFormError("Please fill all required fields.");
          allSuccess = false;
          break;
        }
        // Add more validation as needed
      }
      if (!allSuccess) return;
      for (const formEntry of entries) {
        let payload = {
          status: formEntry.status || "requested",
          type: formEntry.type,
          reason: formEntry.reason,
          requestedBy: formEntry.requestedBy,
          requestedAt: formEntry.requestedAt,
          createdBy: auth?.id,
          paymentCategory: formEntry.paymentCategory,
        };
        const selectedUser = users.find((u) => u._id === formEntry.requestedBy);
        const isTransporter = selectedUser?.role === "transporter";
        payload.vehicleId = formEntry.vehicleId;
        if (vehicleRows.length > 0) {
          payload.vehicleMaintenance = vehicleRows;
        } else if (
          vehicleRow.vehicleId &&
          vehicleRow.description &&
          vehicleRow.amount
        ) {
          payload.vehicleMaintenance = [vehicleRow];
        }
        if (formEntry.type === "receipt_payment") {
          payload.amount = formEntry.amount;
          payload.to = formEntry.to;
          payload.quantity = Number(formEntry.quantity);
          payload.recept_reference = formEntry.recept_reference;
        } else if (formEntry.type === "suspence_payment") {
          payload.suspenceAmount = formEntry.suspenceAmount;
          payload.quantity = Number(formEntry.quantity);
          payload.vehicleMaintenance = vehicleRows;
        }
        // TODO: handle file upload for relatedReceiptFile if needed
        try {
          const res = await fetch("/api/transactions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!data.success) {
            allSuccess = false;
            lastError = data.message || "Failed to create transaction.";
            setFormError(lastError);
          }
        } catch (err) {
          allSuccess = false;
          lastError = "Failed to create transaction.";
          setFormError(lastError);
        }
      }
      if (allSuccess) {
        setForm({
          transactionSource: "cashAccount",
          status: "requested",
          cashAccount: "",
          checkRequestId: "",
          type: "",
          suspenceAmount: "",
          returnAmount: "",
          date: "",
          pitiCash: false,
          amount: "",
          to: "",
          reason: "",
          relatedReceiptUrl: "",
          approvedBy: "",
          requestedBy: auth?.id || "",
          createdBy: auth?.id || "",
          quantity: "",
          recept_reference: "",
        });
        // Optionally redirect or show a success message
        setFormError("");
        router.push("/transactions");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    router.push("/transactions");
  }

  // --- Begin inlined TransactionRequestform ---
  const defaultEntry = {
    amount: "",
    quantity: "",
    recept_reference: "",
    to: "",
    reason: "",
    suspenceAmount: "",
    vehicleId: "",
  };
  // Common fields
  const [commonFields, setCommonFields] = useState({
    requestedBy: form.requestedBy || "",
    requestedAt: form.requestedAt || new Date().toISOString().split("T")[0],
    paymentCategory: "",
  });
  // Single entry
  const [entry, setEntry] = useState({ ...defaultEntry });
  const [paymentType, setPaymentType] = useState("");
  const [vehicleError, setVehicleError] = useState("");
  const [quantityError, setQuantityError] = useState("");

  const selectedUser = users.find((u) => u._id === commonFields.requestedBy);
  const isTransporter = selectedUser?.role === "transporter";

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
    setEntry({ ...defaultEntry });
  };

  const handleCommonChange = (e) => {
    const { name, value } = e.target;
    setCommonFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleEntryChange = (e) => {
    const { name, value, type, files } = e.target;
    setEntry((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const resetForm = () => {
    setCommonFields({
      requestedBy: "",
      requestedAt: new Date().toISOString().split("T")[0],
      paymentCategory: "",
    });
    setEntry({ ...defaultEntry });
    setPaymentType("");
    setVehicleError("");
    setQuantityError("");
  };
  // --- End inlined TransactionRequestform ---

  // --- Begin vehicle-description-amount add section ---
  const [vehicleRow, setVehicleRow] = useState({
    vehicleId: "",
    action: "",
    vehicleComponentCategory: "",
    vehicleComponents: "",
    description: "",
    amount: "",
    km: "",
    qty: 1,
  });
  const [vehicleRows, setVehicleRows] = useState([]);

  const handleVehicleRowChange = (e) => {
    const { name, value } = e.target;
    setVehicleRow((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVehicleRow = (e) => {
    e.preventDefault();
    if (commonFields.paymentCategory === "vehicleMaintenance") {
      if (
        !vehicleRow.vehicleId ||
        !vehicleRow.description ||
        !vehicleRow.amount
      )
        return;
    } else {
      if (!vehicleRow.description || !vehicleRow.amount) return;
    }
    // This line adds a new vehicle row to the existing array of vehicle rows
    // It uses the spread operator (...) to create a new array containing all previous rows
    // and appends the current vehicleRow object to the end
    setVehicleRows((prev) => [...prev, vehicleRow]);
    setVehicleRow({
      vehicleId: "",
      action: "",
      vehicleComponentCategory: "",
      vehicleComponents: "",
      description: "",
      amount: "",
      km: "",
      qty: 1,
    });
  };

  // Add the remove handler
  const handleRemoveVehicleRow = (idx) => {
    setVehicleRows((prev) => prev.filter((_, i) => i !== idx));
  };
  // --- End vehicle-description-amount add section ---
  const filteredVehicleComponents = vehicleRow.vehicleComponentCategory
    ? vehicleComponents.filter(
        (item) => item.category === vehicleRow.vehicleComponentCategory
      )
    : [];

  // Add useEffect to reset vehicleRow when paymentCategory changes
  useEffect(() => {
    setVehicleRow({
      vehicleId: "",
      action: "",
      vehicleComponentCategory: "",
      vehicleComponents: "",
      description: "",
      amount: "",
      km: "",
      qty: 1,
    });
  }, [commonFields.paymentCategory]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-extrabold flex items-center gap-2 text-[#02733E]">
          <FilePlus className="text-blue-500" size={20} />
          Payment Request
        </h2>
        {/* Payment Type Selection */}
        <div className="flex gap-8 justify-center">
          <label
            className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer border transition-all ${
              paymentType === "receipt_payment"
                ? "bg-blue-100 border-blue-400 text-[#02733E] font-light shadow"
                : "bg-gray-50 border-gray-200 hover:bg-blue-50"
            }`}
            title="Request for a receipt payment"
          >
            <input
              type="radio"
              name="paymentType"
              value="receipt_payment"
              checked={paymentType === "receipt_payment"}
              onChange={() => handlePaymentTypeChange("receipt_payment")}
              className="accent-blue-500"
            />
            Receipt Payment
          </label>
          <label
            className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer border transition-all ${
              paymentType === "suspence_payment"
                ? "bg-blue-100 border-blue-400 text-[#02733E] font-light shadow"
                : "bg-gray-50 border-gray-200 hover:bg-blue-50"
            }`}
            title="Request for a suspence payment"
          >
            <input
              type="radio"
              name="paymentType"
              value="suspence_payment"
              checked={paymentType === "suspence_payment"}
              onChange={() => handlePaymentTypeChange("suspence_payment")}
              className="accent-blue-500"
            />
            Suspence Payment
          </label>
        </div>
      </div>
      {/* Only show the form after a payment type is selected */}
      {paymentType && (
        <form
          onSubmit={(e) => {
            let hasError = false;

            if (
              !entry.quantity ||
              isNaN(Number(entry.quantity)) ||
              Number(entry.quantity) <= 0
            ) {
              setQuantityError("Quantity must be greater than 0");
              hasError = true;
            } else {
              setQuantityError("");
            }
            if (hasError) {
              e.preventDefault();
              return;
            }
            // Compose payload for the entry
            const formEntry = {
              ...entry,
              status: "requested",
              type: paymentType,
              createdBy: auth?.id,
              requestedBy: commonFields.requestedBy,
              requestedAt: commonFields.requestedAt,
              paymentCategory: commonFields.paymentCategory,
            };
            // Call onSubmit with the single entry in an array
            e.preventDefault();
            handleSubmit([formEntry], e);
            resetForm();
          }}
          className=""
        >
          {/* Common Fields */}
          <div className="flex flex-col gap-4 bg-[#FFFFFF] rounded-lg p-4 mb-2 border border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-start justify-items-start gap-3">
                <div className="flex-1 mb-2">
                  <select
                    name="requestedBy"
                    value={commonFields.requestedBy}
                    onChange={handleCommonChange}
                    className="flex-1 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white"
                    required
                    disabled={isTransporter}
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 mb-2">
                  <input
                    type="date"
                    name="requestedAt"
                    value={commonFields.requestedAt}
                    onChange={handleCommonChange}
                    className="flex-1 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white"
                    required
                  />
                </div>
                <div className="flex-1 mb-2">
                  <select
                    name="paymentCategory"
                    value={commonFields.paymentCategory}
                    onChange={handleCommonChange}
                    className="flex-1 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {paymentTypesModel.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center gap-1 bg-white text-black font-bold px-1 py-2 rounded-lg transition border border-gray-300 cursor-pointer hover:bg-[#EEEFE0] disabled:opacity-60"
                disabled={submitting}
              >
                <FilePlus size={20} /> {submitting ? "Saving..." : "Save"}
              </button>
            </div>
            <div className="flex  flex-col bg-white border-2 border-blue-100 rounded-xl shadow-sm p-5 transition hover:shadow-lg">
              <div className="flex justify-between  group">
                {/* Fields for receipt_payment */}
                <div
                  className={`gap-2 mb-2 ${
                    paymentType === "suspence_payment" ? "hidden" : ""
                  }`}
                >
                  <div className="relative z-0 w-full mb-5 group">
                    <input
                      type="number"
                      name="amount"
                      value={entry.amount}
                      onChange={handleEntryChange}
                      placeholder=" "
                      className="block py-2 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#02733E] peer"
                      required={paymentType === "receipt_payment"}
                    />
                    <label
                      htmlFor="amount"
                      className="peer-focus:font-medium absolute text-lg text-black font-bold duration-300 transform -translate-y-6 scale-75 top-1 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#02733E] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                      Amount
                    </label>
                  </div>
                </div>

                <div
                  className={`gap-2 mb-2 ${
                    paymentType === "suspence_payment" ? "hidden" : ""
                  }`}
                >
                  <div className="relative z-0 w-full mb-5 group">
                    <input
                      type="text"
                      name="recept_reference"
                      value={entry.recept_reference || ""}
                      onChange={handleEntryChange}
                      placeholder=""
                      className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#02733E] peer"
                      required={paymentType === "receipt_payment"}
                    />
                    <label
                      htmlFor="amount"
                      className="peer-focus:font-medium absolute text-lg text-black font-bold duration-300 transform -translate-y-6 scale-75 top-1 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#02733E] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                      Reference
                    </label>
                  </div>
                </div>
                <div
                  className={`gap-2 mb-2 ${
                    paymentType === "suspence_payment" ? "hidden" : ""
                  }`}
                >
                  <div className="relative z-0 w-full mb-5 group">
                    <input
                      type="text"
                      name="to"
                      value={entry.to}
                      onChange={handleEntryChange}
                      placeholder=""
                      className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#02733E] peer"
                      required={paymentType === "receipt_payment"}
                    />
                    <label
                      htmlFor="amount"
                      className="peer-focus:font-medium absolute text-lg text-black font-bold duration-300 transform -translate-y-6 scale-75 top-1 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#02733E] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                      Paid To
                    </label>
                  </div>
                </div>

                {/* Fields for suspence_payment */}

                <div
                  className={`gap-2 mb-2 ${
                    paymentType === "receipt_payment" ? "hidden" : ""
                  }`}
                >
                  <div className="relative z-0 w-full mb-5 group">
                    <input
                      type="number"
                      name="suspenceAmount"
                      value={entry.suspenceAmount}
                      onChange={handleEntryChange}
                      placeholder=" "
                      className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#02733E] peer"
                      required={paymentType === "suspence_payment"}
                    />
                    <label
                      htmlFor="suspenceAmount"
                      className="peer-focus:font-medium absolute text-lg text-black font-bold duration-300 transform -translate-y-6 scale-75 top-1 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#02733E] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                      Amount
                    </label>
                  </div>
                </div>
                <div className={`gap-2 mb-2`}>
                  <div className="relative z-0 w-full mb-5 group">
                    <input
                      type="number"
                      name="quantity"
                      value={entry.quantity || ""}
                      onChange={handleEntryChange}
                      placeholder=""
                      className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#02733E] peer"
                      required
                    />
                    <label
                      htmlFor="suspenceAmount"
                      className="peer-focus:font-medium absolute text-lg text-black font-bold duration-300 transform -translate-y-6 scale-75 top-1 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#02733E] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                      Quantity
                    </label>
                    {quantityError && (
                      <div className="text-red-500 text-xs mt-1">
                        {quantityError}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`gap-2 mb-2 `}>
                  <div className="relative z-0 w-full mb-5 group">
                    <input
                      type="text"
                      name="reason"
                      value={entry.reason}
                      onChange={handleEntryChange}
                      placeholder=""
                      className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#02733E] peer"
                      required
                    />
                    <label
                      htmlFor="suspenceAmount"
                      className="peer-focus:font-medium absolute text-lg text-black font-bold duration-300 transform -translate-y-6 scale-75 top-1 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#02733E] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                      Reason
                    </label>
                  </div>
                </div>
              </div>

              {/* Shared Action, Amount, Description fields and table */}
              {commonFields.paymentCategory === "vehicleMaintenance" && (
              <div
                className={`mt-4 my-4 p-2 border border-blue-100 rounded-xl shadow-sm w-full bg-white`}
              >
                <h2 className="text-md font-extrabold flex items-center gap-2 text-[#02733E]">
                  Vehicle Maintenance Info (Spare Part)
                </h2>
                <div className="flex justify-between flex-wrap gap-1 ">
                  {/* Only show vehicle select if vehicleMaintenance */}

                  <div
                    className="flex-1 flex flex-col max-w-[150px] min-w-[100px]"
                  >
                    <label className="text-[#444444] text-sm font-bold ">
                      Vehicle
                    </label>
                    <select
                      name="vehicleId"
                      value={vehicleRow.vehicleId}
                      onChange={handleVehicleRowChange}
                      className="border border-gray-300 rounded py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white "
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.plate}
                          {vehicle.model ? ` - ${vehicle.model}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 flex flex-col max-w-[100px] min-w-[100px]">
                    <label className="text-[#444444] text-sm font-bold ">
                      KM
                    </label>
                    <input
                      type="number"
                      name="km"
                      value={vehicleRow.km}
                      onChange={handleVehicleRowChange}
                      className="border border-gray-300 rounded py-1  text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white "
                      placeholder="Killo Meter "
                    />
                    
                  </div>
                  <div
                    className="flex-1 flex flex-col max-w-[150px] min-w-[100px]"
                  >
                    <label className="text-[#444444] text-sm font-bold ">
                      Parts Category
                    </label>
                    <select
                      name="vehicleComponentCategory"
                      value={vehicleRow.vehicleComponentCategory}
                      onChange={handleVehicleRowChange}
                      className="border border-gray-300 rounded  py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white "
                    >
                      <option value="">Select Parts Category</option>
                      {vehicleComponentsCatagory.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    className="flex-1 flex flex-col max-w-[150px]  min-w-[100px]"
                  >
                    <label className="text-[#444444] text-sm font-bold ">
                      Parts
                    </label>
                    <select
                      name="vehicleComponents"
                      value={vehicleRow.vehicleComponents}
                      onChange={handleVehicleRowChange}
                      className="border border-gray-300 rounded py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white "
                    >
                      <option value="">Select Parts</option>
                      {filteredVehicleComponents.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 flex flex-col max-w-[120px] min-w-[100px]">
                    <label className="text-[#444444] text-sm font-bold ">
                      Action
                    </label>
                    <select
                      name="action"
                      value={vehicleRow.action}
                      onChange={handleVehicleRowChange}
                      className="border border-gray-300 rounded py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white "
                    >
                      <option value="">Select Action</option>
                      {transactionAction.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 flex flex-col max-w-[100px] min-w-[100px]">
                    <label className="text-[#444444] text-sm font-bold ">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="qty"
                      value={vehicleRow.qty}
                      onChange={handleVehicleRowChange}
                      className="border border-gray-300 rounded py-1  text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white "
                      placeholder="Amount "
                    />
       
                  </div>
                  <div className="flex-1 flex flex-col max-w-[100px] min-w-[100px]">
                    <label className="text-[#444444] text-sm font-bold ">
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={vehicleRow.amount}
                      onChange={handleVehicleRowChange}
                      className="border border-gray-300 rounded py-1  text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white "
                      placeholder="Amount "
                    />
       
                  </div>
                  <div className="flex-1 flex flex-col max-w-[200px] min-w-[100px]">
                    <label className="text-[#444444] text-sm font-bold ">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={vehicleRow.description}
                      onChange={handleVehicleRowChange}
                      className="border border-gray-300 rounded py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white"
                      placeholder="Description"
                    />
                  </div>
                  <button
                    className="mt-5 px-4 py-1  text-blue-700 rounded hover:bg-gray-100 transition font-bold border border-blue-700 cursor-pointer"
                    onClick={handleAddVehicleRow}
                    type="button"
                  >
                    Add
                  </button>
                </div>
              </div>)}
            </div>
            {/* Table of added rows */}
            {vehicleRows.length > 0 && (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-gray-200 rounded">
                  <thead>
                    <tr className="bg-gray-50">
                      {commonFields.paymentCategory ===
                        "vehicleMaintenance" && (
                        <>
                          <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                            Vehicle
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                            KM
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                            Parts Category
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                            Parts
                          </th>
                        </>
                      )}
                      
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                        Action
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                        Description
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                        Remove
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleRows.map((row, idx) => {
                      return (
                        <tr key={idx} className="border-t">
                          {commonFields.paymentCategory ===
                            "vehicleMaintenance" && (
                            <>
                              <td className="px-4 py-2 text-sm">
                                {(() => {
                                  const vehicle = vehicles.find(
                                    (v) => v._id === row.vehicleId
                                  );
                                  return vehicle
                                    ? `${vehicle.plate}${
                                        vehicle.model
                                          ? " - " + vehicle.model
                                          : ""
                                      }`
                                    : "";
                                })()}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {row.km}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {(() => {
                                  const cat = vehicleComponentsCatagory.find(
                                    (c) =>
                                      c.key === row.vehicleComponentCategory
                                  );
                                  return cat ? cat.label : "";
                                })()}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {(() => {
                                  const part = vehicleComponents.find(
                                    (p) => p.key === row.vehicleComponents
                                  );
                                  return part ? part.label : "";
                                })()}
                              </td>
                            </>
                          )}
                          <td className="px-4 py-2 text-sm">{row.action}</td>
                          <td className="px-4 py-2 text-sm">
                            {row.description}
                          </td>
                          <td className="px-4 py-2 text-sm">{row.qty}</td>
                          <td className="px-4 py-2 text-sm">{row.amount}</td>
                          <td className="px-4 py-2 text-sm">
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleRemoveVehicleRow(idx)}
                              title="Remove"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Total row */}
                  <tfoot>
                    <tr className="bg-blue-100 font-bold">
                      {/* Adjust colspan based on the number of columns before qty and amount */}
                      <td colSpan={commonFields.paymentCategory === "vehicleMaintenance" ? 6 : 3} className="px-4 py-2 text-right">Total</td>
                      <td className="px-4 py-2 text-sm">
                        {vehicleRows.reduce((sum, row) => sum + Number(row.qty || 0), 0)}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {vehicleRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)}
                      </td>
                      <td className="px-4 py-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </form>
      )}
      {/* Show error message if present */}
      {formError && toast.error(formError)}
    </div>
  );
}
