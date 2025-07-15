import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../../context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Trash2, FilePlus } from "lucide-react";
import {
  paymentTypesModel,
  vehicleComponentsCatagory,
  transactionAction,
  vehicleComponents,
} from "@/lib/constants";
import { toast } from "sonner";
import SelectInputFloating from "@/components/ui/selectInput-floating";
import InputFloating from "@/components/ui/input-floatin";
import CheckBox from "@/components/ui/checkBox";
import LoadingComponent from "@/components/LoadingComponent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, NotebookPen, Printer, SquareCheck } from "lucide-react";
import { Cross, Eye, Plus, Minus, X, Check } from "lucide-react";
import DateInputFloating from "@/components/ui/dateInput-floating";

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
    .replace(/\./g, ""); // Remove dot from short month if present
}
export default function NewTransactionRequestPage() {
  const { auth } = useContext(AuthContext);
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [vehicleRows, setVehicleRows] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [params, setParams] = useState({
    startDate: new Date(),
    endDate: new Date(),
    paymentType: "",
    type: "",
  });
  const [payload, setPayload] = useState({
    paymentType: "",
    status: "requested",
    type: "",
    amount: "",
    suspenceAmount: "",
    to: "",
    reason: "",
    requestedBy: auth?.id || "",
    quantity: "",
    recept_reference: "",
    requestedAt: new Date(),
    createdBy: auth?.id || "",
  });
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

  useEffect(() => {
    const date = payload.requestedAt
      ? new Date(payload.requestedAt)
      : new Date();
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    setParams((prev) => ({
      ...prev,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      paymentType: payload.paymentType,
      type: payload.type,
    }));
  }, [payload]);

  console.log(params);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(params).toString();
      const responce = await fetch(`/api/report/paymentReport?${queryParams}`);
      const data = await responce.json();
      setTransactions(data.data);
    } catch (error) {
      console.error("Failed to fetch transactions", error.message);
      toast.warning("Failed to fetch Payments", {
        closeButton: true,
        autoClose: 4000,
        hideProgressBar: false,
        position: "top-center",
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "#fff",
          color: "orange",
          borderRadius: "10px",
          padding: "10px",
          fontSize: "14px",
        },
      });
    }
    setLoading(false);
  };

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
        toast.warning("Failed to fetch vehicles", {
          closeButton: true,
          autoClose: 4000,
          hideProgressBar: false,
          position: "top-center",
          pauseOnHover: true,
          draggable: true,
          style: {
            background: "#fff",
            color: "orange",
            borderRadius: "10px",
            padding: "10px",
            fontSize: "14px",
          },
        });
      }
    };
    fetchVehicles();
  }, []);

  async function handleSubmit(entries, e) {
    // validate payload
    if (
      !payload.paymentType ||
      !payload.type ||
      !payload.amount ||
      !payload.reason ||
      !payload.requestedBy ||
      !payload.requestedAt
    ) {
      toast.error("Missing required fields");
      return;
    }

    if (
      payload.type == "receipt_payment" &&
      !payload.to &&
      !payload.recept_reference
    ) {
      toast.warning("Please fill the paid to and recept reference field", {
        closeButton: true,
        autoClose: 4000,
        hideProgressBar: false,
        position: "top-center",
        pauseOnHover: true,
        draggable: true,
        style: {
          background: "#fff",
          color: "orange",
          borderRadius: "10px",
          padding: "10px",
          fontSize: "14px",
        },
      });
      return;
    }

    if (
      (payload.type == "receipt_payment" || payload.type == "check_payment") &&
      payload.paymentType == "vehicleMaintenance"
    ) {
      const amountSum = vehicleRows.reduce(
        (sum, row) => sum + Number(row.amount || 0),
        0
      );
      const amount = Number(payload.amount);
      if (amountSum !== amount) {
        toast.warning(
          "While the total amount of the vehicle maintenance is " +
            amountSum +
            " the total amount of the receipt or check is " +
            amount,
          {
            closeButton: true,
            autoClose: 5000,
            progressBar: true,
            position: "top-right",
            pauseOnHover: true,
            draggable: true,
            animation: "slide 1s ease-in-out",

            style: {
              background: "#fff",
              color: "#D9A404",
              borderRadius: "10px",
              padding: "5px",
              fontSize: "14px",
              width: "500px",
            },
          }
        );
        return;
      }
    }

    if (
      payload.paymentType === "vehicleMaintenance" &&
      vehicleRows.length === 0
    ) {
      toast.error("Please add at least one vehicle maintenance");
      return;
    }

    try {
      let submitPayload = { ...payload, vehicleMaintenance: vehicleRows };
      if (payload.type === "suspence_payment") {
        submitPayload = {
          ...submitPayload,
          suspenceAmount: payload.amount,
        };
        delete submitPayload.amount;
      } else {
        submitPayload = {
          ...submitPayload,
          amount: payload.amount,
        };
        delete submitPayload.suspenceAmount;
      }
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitPayload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Payment request submitted successfully");
      } else {
        toast.error("Failed to submit payment request");
      }
      setPayload({
        paymentType: "",
    status: "requested",
    type: "",
    amount: "",
    suspenceAmount: "",
    to: "",
    reason: "",
    requestedBy: auth?.id || "",
    quantity: "",
    recept_reference: "",
    requestedAt: new Date(),
    createdBy: auth?.id || "",
      });
      setVehicleRows([]);
      if (!data.success) {
        allSuccess = false;
      }
    } catch (err) {
      allSuccess = false;
    }
  }

  const handleCommonChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleEntryChange = (e) => {
    const { name, value, type, files } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

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

  const handleVehicleRowChange = (e) => {
    const { name, value } = e.target;
    setVehicleRow((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVehicleRow = (e) => {
    e.preventDefault();
    if (payload.paymentType === "vehicleMaintenance") {
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
  }, [payload.paymentType]);

  return (
    <div className="w-screen bg-white flex flex-col p-4 gap-1">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-extrabold text-black   tracking-wide drop-shadow ">
          Payment Request Form
        </h2>
        <div className="flex items-center justify-end gap-2">
          <button
            type="submit"
            className="flex items-center gap-1 bg-white text-black font-bold px-1 py-1 rounded-lg transition border border-gray-300 cursor-pointer hover:bg-[#EEEFE0] disabled:opacity-60"
            disabled={submitting}
            onClick={handleFilter}
          >
            <FilePlus size={20} /> {submitting ? "Filtering..." : "Filter"}
          </button>
          <button
            type="submit"
            className="flex items-center gap-1 bg-white text-black font-bold px-1 py-1 rounded-lg transition border border-gray-300 cursor-pointer hover:bg-[#EEEFE0] disabled:opacity-60"
            disabled={submitting}
            onClick={handleSubmit}
          >
            <FilePlus size={20} /> {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      <hr className="border-[#D9A404] border-1" />
      <div className="w-full  flex sm:flex-col md:flex-row gap-2">
        <div className="flex-col gap-3">
          <CheckBox
            label="Receipt"
            description=""
            name="type"
            id="receipt_payment"
            checked={payload.type === "receipt_payment"}
            onChange={() => setPayload({ ...payload, type: "receipt_payment" })}
          />
          <CheckBox
            label="Suspence"
            description=""
            name="type"
            id="suspence_payment"
            checked={payload.type === "suspence_payment"}
            onChange={() =>
              setPayload({ ...payload, type: "suspence_payment" })
            }
          />
          <CheckBox
            label="Check"
            description=""
            name="type"
            id="check_payment"
            checked={payload.type === "check_payment"}
            onChange={() => setPayload({ ...payload, type: "check_payment" })}
          />
        </div>
        <div className="w-full px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4  p-2 rounded-lg">
          <SelectInputFloating
            label="Requested By"
            id="requestedBy"
            name="requestedBy"
            type=""
            placeholder=" "
            value={payload.requestedBy}
            onChange={handleCommonChange}
            onClick={fetchUsers}
            required={true}
            data={users}
            datakeys="_id"
            datavalues="_id"
            datalabeling="name"
          />

          <SelectInputFloating
            label="Payment Category"
            id="paymentType"
            name="paymentType"
            type=""
            placeholder=" "
            value={payload.paymentType}
            onChange={handleCommonChange}
            data={paymentTypesModel}
            datakeys="value"
            datavalues="value"
            datalabeling="label"
            required={true}
          />

          <InputFloating
            label="Amount"
            name="amount"
            id="amount"
            type="number"
            value={payload.amount}
            onChange={handleEntryChange}
            required
          />

          <InputFloating
            label="Recipt Reference"
            name="recept_reference"
            id="recept_reference"
            type="text"
            value={payload.recept_reference}
            onChange={handleEntryChange}
            required
          />
          <InputFloating
            label="Paid To"
            name="to"
            id="to"
            type="text"
            value={payload.to}
            onChange={handleEntryChange}
            required={payload.paymentType === "receipt_payment"}
          />

          {/* Fields for suspence_payment */}

          <InputFloating
            label="Quantity"
            name="quantity"
            id="quantity"
            type="number"
            value={payload.quantity}
            onChange={handleEntryChange}
            required={false}
          />
          <InputFloating
            label="Reason"
            name="reason"
            id="reason"
            type="text"
            value={payload.reason}
            onChange={handleEntryChange}
            required
          />

          <DateInputFloating
            label="Requested At"
            name="requestedAt"
            id="requestedAt"
            value={
              payload.requestedAt
                ? new Date(payload.requestedAt).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => {
              const dateValue = e.target.value;
              // Convert YYYY-MM-DD to ISO string (midnight UTC)
              setPayload((prev) => ({
                ...prev,
                requestedAt: dateValue ? new Date(dateValue).toISOString() : "",
              }));
            }}
            required
          />
        </div>
      </div>

      {/* Shared Action, Amount, Description fields and table */}
      {payload.paymentType === "vehicleMaintenance" && (
        <div
          className={`mt-4 my-4 p-2 border border-blue-100 rounded-xl shadow-sm w-full bg-white`}
        >
          <h2 className="text-md font-extrabold flex items-center gap-2 text-[#02733E]">
            Vehicle Maintenance Info (Spare Part)
          </h2>
          <div className="flex justify-between flex-wrap gap-1 ">
            {/* Only show vehicle select if vehicleMaintenance */}

            <div className="flex-1 flex flex-col max-w-[150px] min-w-[100px]">
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
              <label className="text-[#444444] text-sm font-bold ">KM</label>
              <input
                type="number"
                name="km"
                value={vehicleRow.km}
                onChange={handleVehicleRowChange}
                className="border border-gray-300 rounded py-1  text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white "
                placeholder="Killo Meter "
              />
            </div>
            <div className="flex-1 flex flex-col max-w-[150px] min-w-[100px]">
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
            <div className="flex-1 flex flex-col max-w-[150px]  min-w-[100px]">
              <label className="text-[#444444] text-sm font-bold ">Parts</label>
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
        </div>
      )}

      {/* Table of added rows */}
      {vehicleRows.length > 0 && (
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full border border-gray-200 rounded">
            <thead>
              <tr className="bg-gray-50">
                {payload.paymentType === "vehicleMaintenance" && (
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
                    {payload.paymentType === "vehicleMaintenance" && (
                      <>
                        <td className="px-4 py-2 text-sm">
                          {(() => {
                            const vehicle = vehicles.find(
                              (v) => v._id === row.vehicleId
                            );
                            return vehicle
                              ? `${vehicle.plate}${
                                  vehicle.model ? " - " + vehicle.model : ""
                                }`
                              : "";
                          })()}
                        </td>
                        <td className="px-4 py-2 text-sm">{row.km}</td>
                        <td className="px-4 py-2 text-sm">
                          {(() => {
                            const cat = vehicleComponentsCatagory.find(
                              (c) => c.key === row.vehicleComponentCategory
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
                    <td className="px-4 py-2 text-sm">{row.description}</td>
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
                <td
                  colSpan={payload.paymentType === "vehicleMaintenance" ? 6 : 3}
                  className="px-4 py-2 text-right"
                >
                  Total
                </td>
                <td className="px-4 py-2 text-sm">
                  {vehicleRows.reduce(
                    (sum, row) => sum + Number(row.qty || 0),
                    0
                  )}
                </td>
                <td className="px-4 py-2 text-sm">
                  {vehicleRows.reduce(
                    (sum, row) => sum + Number(row.amount || 0),
                    0
                  )}
                </td>
                <td className="px-4 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      <hr className="border-[#D9A404] border-1" />

      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="overflow-hidden h-[290px] overflow-y-auto border border-gray-200 dark:border-neutral-700">
              {loading ? (
                <LoadingComponent />
              ) : (
                <table className="min-w-full table-fixed divide-y divide-gray-200 dark:divide-neutral-700">
                  <thead className="border border-gray-400 dark:border-neutral-700">
                    <tr class="divide-x divide-gray-200 dark:divide-neutral-700 border border-b border-gray-600 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800">
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-end text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-16 max-w-[4rem] truncate"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-24 max-w-[8rem] truncate"
                      >
                        TO
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-32 max-w-[10rem] truncate"
                      >
                        REASON
                      </th>

                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-20 max-w-[6rem] truncate"
                      >
                        AMOUNT
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-20 max-w-[6rem] truncate"
                      >
                        TYPE
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-24 max-w-[8rem] truncate"
                      >
                        Date
                      </th>

                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-24 max-w-[8rem] truncate"
                      >
                        Reference
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-16 max-w-[4rem] truncate"
                      >
                        PV NO.
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-end text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-16 max-w-[4rem] truncate"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                    {transactions.map((item, index) => (
                      <tr
                        key={index}
                        className={
                          "odd:bg-gray-50 divide-x even:bg-white dark:odd:bg-neutral-800 dark:even:bg-neutral-900 hover:bg-yellow-100 dark:hover:bg-neutral-700 border border-gray-400 dark:border-neutral-700"
                        }
                      >
                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-20 max-w-[6rem] truncate overflow-hidden">
                          {item.status === "paid" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                              Paid
                            </span>
                          )}
                          {item.status === "requested" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                              Requested
                            </span>
                          )}
                          {item.status === "approved" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                              Approved
                            </span>
                          )}
                          {item.status === "rejected" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                              Rejected
                            </span>
                          )}
                          {item.status === "suspence" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                              Suspence
                            </span>
                          )}
                          {item.status === "prepared" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full mr-1"></div>
                              Prepared
                            </span>
                          )}
                          {![
                            "paid",
                            "requested",
                            "approved",
                            "rejected",
                            "suspence",
                            "prepared",
                          ].includes(item.status) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                              <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                              {item.status || "Unknown"}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-24 max-w-[8rem] truncate overflow-hidden">
                          {item.to}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-32 max-w-[10rem] truncate overflow-hidden">
                          {item.reason}
                        </td>

                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-20 max-w-[6rem] truncate overflow-hidden">
                          {item.amount ? item.amount : item.suspenceAmount}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-20 max-w-[6rem] truncate overflow-hidden">
                          {item.type}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-24 max-w-[8rem] truncate overflow-hidden">
                          {formatDate(item.createdAt)}
                        </td>

                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-24 max-w-[8rem] truncate overflow-hidden">
                          {editingRowId === item._id ? (
                            <input
                              className="border-green-600 border-2 rounded px-1 py-0.5 w-full text-xs"
                              value={editValues.recept_reference || ""}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  recept_reference: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            <div
                              className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                              onClick={() => {
                                setEditingRowId(item._id);
                                setEditValues({
                                  recept_reference: item.recept_reference || "",
                                });
                              }}
                            >
                              {item.recept_reference || "N/A"}
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-16 max-w-[4rem] truncate overflow-hidden">
                          {item.serialNumber || item.checkSerialNumber || "N/A"}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-16 max-w-[4rem] truncate overflow-hidden">
                          {editingRowId === item._id ? (
                            <div className="flex gap-1">
                              <button
                                className="p-1 rounded bg-green-500 text-white hover:bg-green-600"
                                onClick={async () => {
                                  try {
                                    const res = await fetch(
                                      `/api/checkTransaction/checkPrepare/${item._id}`,
                                      {
                                        method: "PUT",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          recept_reference:
                                            editValues.recept_reference,
                                        }),
                                      }
                                    );
                                    const data = await res.json();
                                    if (res.ok && data.success) {
                                      toast.success(
                                        "Reference updated successfully."
                                      );
                                      setData((data) =>
                                        data.map((d) =>
                                          d._id === item._id
                                            ? {
                                                ...d,
                                                recept_reference:
                                                  editValues.recept_reference,
                                              }
                                            : d
                                        )
                                      );
                                      setEditingRowId(null);
                                      setEditValues({});
                                    } else {
                                      toast.error(
                                        data.message || "Failed to update."
                                      );
                                    }
                                  } catch (err) {
                                    toast.error("Failed to update.");
                                  }
                                }}
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                className="p-1 rounded bg-red-500 text-white hover:bg-red-600"
                                onClick={() => {
                                  setEditingRowId(null);
                                  setEditValues({});
                                }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="p-1 rounded hover:bg-muted transition cursor-pointer"
                                  title="Actions"
                                >
                                  <Ellipsis />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {item.checkRequestId?.status == "prepared" && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingRowId(item._id);
                                      setEditValues({
                                        recept_reference: item.recept_reference,
                                      });
                                    }}
                                  >
                                    <SquareCheck
                                      enableBackground={true}
                                      color="green"
                                      className="w-4 h-4 mr-2 "
                                    />{" "}
                                    <span className="text-green-600 font-semibold">
                                      {" "}
                                      Pay
                                    </span>
                                  </DropdownMenuItem>
                                )}

                                {item.type == "check_payment" ||
                                  (item.type == "bank_transfer" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(`/checks/${item._id}`)
                                      }
                                    >
                                      <NotebookPen className="w-4 h-4 mr-2" />{" "}
                                      {item.checkRequestId?.status == "prepared"
                                        ? "Edit"
                                        : "Prepare"}
                                    </DropdownMenuItem>
                                  ))}

                                <DropdownMenuItem
                                  onClick={() => {
                                    window.open(
                                      `/transactions/${item._id}`,
                                      "_blank"
                                    );
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" /> View Detail
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    window.open(
                                      `/checks/printInvoice/${item._id}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <Printer className="w-4 h-4 mr-2" /> Print
                                  Invoice
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
