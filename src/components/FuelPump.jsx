import React, { useState, useEffect, useContext, useRef } from "react";
import { fuelPrice } from "@/lib/constants";
import AuthContext from "../pages/context/AuthProvider";
import { toast } from "sonner";
import { X } from "lucide-react";
import LoadingComponent from "./LoadingComponent";

// Helper to format date as yyyy-MM-dd
function formatDate(date) {
  if (!date) return "";
  if (typeof date === "string") return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

const FuelPump = () => {
  const { auth } = useContext(AuthContext);
  console.log(auth)
  const [form, setForm] = useState({
    vehicleId: "",
    liters: "",
    odometer: "",
    pumpedAt: new Date(),
    previousOdometer: "",
  });
  const [errors, setErrors] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [fetchingLast, setFetchingLast] = useState(false);
  const [pricePerLiter, setPricePerLiter] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [showVehicleList, setShowVehicleList] = useState(false);
  const comboboxRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/vehicles");
        const data = await res.json();
        if (data.success) {
          setVehicles(data.data);
        } else {
          setFetchError("Failed to fetch vehicles");
        }
      } catch (err) {
        setFetchError("Failed to fetch vehicles");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Update pricePerLiter when vehicleId changes
  useEffect(() => {
    if (!form.vehicleId || vehicles.length === 0) {
      setPricePerLiter(0);
      return;
    }
    const selectedVehicle = vehicles.find((v) => v._id === form.vehicleId);
    if (!selectedVehicle) {
      setPricePerLiter(0);
      return;
    }
    const fuelType = selectedVehicle.fuelType;
    const priceObj = fuelPrice.find((f) => f.type === fuelType);
    setPricePerLiter(priceObj ? priceObj.price : 0);
  }, [form.vehicleId, vehicles]);

  // Update totalCost when liters or pricePerLiter changes
  useEffect(() => {
    const liters = parseFloat(form.liters);
    if (!isNaN(liters) && pricePerLiter) {
      setTotalCost(Math.round(liters * pricePerLiter));
    } else {
      setTotalCost(0);
    }
  }, [form.liters, pricePerLiter]);

  useEffect(() => {
    if (!form.vehicleId) {
      setLastTransaction(null);
      setForm((prev) => ({ ...prev, previousOdometer: "" }));
      return;
    }
    const fetchLastTransaction = async () => {
      setFetchingLast(true);
      try {
        // First, get the latest transaction for the vehicle
        const resList = await fetch(`/api/fuel-transactions/${form.vehicleId}`);
        const dataList = await resList.json();
        setLastTransaction(dataList.data ? [dataList.data] : []);
        if (dataList) {
          setForm((prev) => ({ ...prev, previousOdometer: "" }));
        }
      } catch (err) {
        setLastTransaction([]);
        setForm((prev) => ({ ...prev, previousOdometer: "" }));
      } finally {
        setFetchingLast(false);
      }
    };
    fetchLastTransaction();
  }, [form.vehicleId]);

  // Get last odometer from lastTransaction array
  const lastOdometer =
    Array.isArray(lastTransaction) && lastTransaction.length > 0
      ? lastTransaction[0]?.odometer
      : undefined;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.vehicleId) errs.vehicleId = "Vehicle is required";
    if (!form.liters) errs.liters = "Liters is required";
    if (!form.odometer || isNaN(Number(form.odometer)))
      errs.odometer = "Odometer is required";
    if (lastOdometer === undefined && !form.previousOdometer)
      errs.previousOdometer = "Previous odometer is required";
    const prevOdo =
      lastOdometer !== undefined
        ? Number(lastOdometer)
        : Number(form.previousOdometer);
    if (form.odometer && prevOdo >= Number(form.odometer)) {
      errs.odometer = "Odometer must be greater than previous value";
    }
    return errs;
  };

  const filteredVehicles = vehicles.filter((v) =>
    (v.plate + " " + (v.model || ""))
      .toLowerCase()
      .includes(vehicleSearch.toLowerCase())
  );

  useEffect(() => {
    if (!showVehicleList) return;
    function handleClick(e) {
      if (!comboboxRef.current || !comboboxRef.current.contains(e.target))
        setShowVehicleList(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showVehicleList]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      const prevOdo =
        lastOdometer !== undefined
          ? Number(lastOdometer)
          : Number(form.previousOdometer);
      const km = Number(form.odometer) - prevOdo;
      const km_lit = Number((km / Number(form.liters)).toFixed(2));

      const payload = {
        ...form,
        liters: Number(form.liters),
        odometer: form.odometer ? Number(form.odometer) : undefined,
        km_lit,
        pricePerLiter,
        totalCost,
        recordedBy: auth?.id,
        previousOdometer: undefined, // don't send to API
        pumpedAt: form.pumpedAt ? form.pumpedAt : new Date(),
      };
      fetch("/api/fuel-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const result = await res.json();
          if (res.ok) {
            toast.success("Fuel transaction recorded successfully!");
            setForm({
              vehicleId: "",
              liters: "",
              odometer: "",
              pumpedAt: new Date(),
              previousOdometer: "",
            });
            setTimeout(() => {
              window.location.reload();
            }, 1200);
          } else {
            toast.error(result.message || "Failed to record fuel transaction.");
            setSubmitting(false);
          }
        })
        .catch(() => {
          toast.error("Failed to record fuel transaction.");
          setSubmitting(false);
        });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-1  rounded-lg p-4 "
    >
      {/* Info boxes for price per liter and total cost */}
      <div className="flex gap-1 justify-between border-b border-[#F26B5E] ">
      <h3 className="text-1xl font-bold text-center text-[#02733E]">Fuel Pump</h3>
        
        <div>
        <span className="text-[#02733E] font-bold">{pricePerLiter} / liter</span>  
        
        </div>
          
      </div>
      {/* Vehicle row */}
      <div className="flex justify-between gap-1">
      <label className="font-semibold text-gray-700 text-sm mb-1 w-full">
        Vehicle
        {loading ? (
          <LoadingComponent />
        ) : fetchError ? (
          <span className="ml-8 text-red-500">{fetchError}</span>
        ) : vehicles.length === 0 ? (
          <span className="ml-8">No vehicles found</span>
        ) : (
          <div ref={comboboxRef} className="relative ">
            <input
              type="text"
              value={
                form.vehicleId
                  ? (vehicles.find((v) => v._id === form.vehicleId)?.plate || "") +
                    (vehicles.find((v) => v._id === form.vehicleId)?.model
                      ? " - " +
                        vehicles.find((v) => v._id === form.vehicleId)?.model
                      : "")
                  : vehicleSearch
              }
              onChange={(e) => {
                setVehicleSearch(e.target.value);
                setShowVehicleList(true);
                setForm((prev) => ({ ...prev, vehicleId: "" }));
              }}
              onFocus={() => setShowVehicleList(true)}
              placeholder="Search vehicle..."
              className="p-2 rounded-lg border border-gray-400 mt-1 text-sm bg-[#FBFBFB] text-[#02733E] outline-none w-full"
              autoComplete="off"
              readOnly={!!form.vehicleId}
              required
            />
            {form.vehicleId && (
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, vehicleId: "" }));
                  setVehicleSearch("");
                  setShowVehicleList(false);
                }}
                className="absolute right-2 top-4 z-101 bg-transparent border-none cursor-pointer text-gray-500"
              >
                ×
              </button>
            )}
            {showVehicleList && !form.vehicleId && (
              <ul className="absolute z-100 bg-white border border-gray-200 rounded-lg w-full max-h-48 overflow-y-auto mt-2 p-0 list-none top-14 left-0">
                {filteredVehicles.length === 0 && (
                  <li className="p-2 text-gray-500">No vehicles found</li>
                )}
                {filteredVehicles.map((v) => (
                  <li
                    key={v._id}
                    className="p-2 cursor-pointer"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, vehicleId: v._id }));
                      setVehicleSearch("");
                      setShowVehicleList(false);
                    }}
                  >
                    {v.plate} {v.model ? `- ${v.model}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {errors.vehicleId && (
          <span className="ml-8 text-red-500">{errors.vehicleId}</span>
        )}
      </label>
      <label className="font-semibold text-gray-700 text-sm mb-1 w-full">
          Date
          <input
            name="pumpedAt"
            type="date"
            value={formatDate(form.pumpedAt)}
            onChange={handleChange}
            className="w-full p-2 rounded-lg border border-gray-200 mt-2 text-sm bg-white outline-none"
          />
        </label>
      </div>
      {/* Previous odometer and Odometer in one row */}
      {form.vehicleId && (
        <div className="flex" style={{ gap: 16 }}>
            {fetchingLast ? (
              <LoadingComponent />
            ) : (
              <label className="font-medium text-gray-700 text-sm mb-0 flex flex-col w-full">
                <span className="mb-1">Previous (KM)</span>
                <input
                  name="previousOdometer"
                  value={
                    lastOdometer !== undefined
                      ? lastOdometer
                      : form.previousOdometer
                  }
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="1"
                  required
                  readOnly={lastOdometer !== undefined}
                  className="w-full p-2 rounded-lg border border-gray-200 mt-1 text-sm bg-white outline-none"
                />
                {errors.previousOdometer && (
                  <span className="ml-2 text-red-500 text-sm">
                    {errors.previousOdometer}
                  </span>
                )}
              </label>
            )}
          
            <label className="font-semibold text-gray-700 text-sm mb-3 w-full">
              KM
              <input
                name="odometer"
                value={form.odometer}
                onChange={handleChange}
                type="number"
                min="0"
                step="1"
                required
                className="w-full p-2 rounded-lg border border-gray-400 mt-2 text-sm bg-[#FBFBFB] text-[#02733E] outline-none"
              />
              {errors.odometer && (
                <span className="ml-2 text-red-500 text-sm">
                  {errors.odometer}
                </span>
              )}
            </label>
          
        </div>
      )}
      <div className="flex gap-4">
        
        <label className="font-semibold text-gray-700 text-sm mb-3 w-full">
          Liters
          <input
            name="liters"
            value={form.liters}
            onChange={handleChange}
            type="number"
            min="0"
            step="any"
            required
            className="w-full p-2 rounded-lg border border-gray-400 mt-2 text-sm bg-[#FBFBFB] text-[#02733E] outline-none"
          />
          {errors.liters && (
            <span className="ml-2 text-red-500 text-sm">{errors.liters}</span>
          )}
        </label>
        <label className="font-semibold text-gray-700 text-sm mb-3 w-full">
        Total Cost
        <input
          name="totalCost"
          value={totalCost}
          onChange={e => {
            const value = e.target.value;
            setTotalCost(Math.round(Number(value)));
          }}
          type="number"
          min="0"
          step="any"
          className="w-full p-2 rounded-lg border border-gray-200 mt-2 text-sm bg-white outline-none"
        />
        </label>
      </div>

      <div className="flex justify-between gap-4 mt-2 border-t border-[#f26a5e73] pt-2">
        <button
          type="button"
          onClick={() =>
            setForm({
              vehicleId: "",
              liters: "",
              odometer: "",
              pumpedAt: new Date(),
              previousOdometer: "",
            })
          }
          className="bg-[#F26B5E] text-gray-900 border border-gray-200 rounded-lg p-2 font-semibold text-sm "
        >
           <X />
        </button>
        <button
          type="submit"
          className="bg-[#02733E] text-white border border-[#038C4C] rounded-lg p-2 font-semibold text-sm disabled:bg-[#D1D8BE] disabled:cursor-not-allowed"
          disabled={submitting}
        >
          {submitting ? <LoadingComponent /> : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default FuelPump;
