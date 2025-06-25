import React, { useState, useEffect, useContext, useRef } from "react";
import { fuelPrice } from "@/lib/constants";
import AuthContext from "@/pages/context/AuthProvider";
import { toast } from "sonner";
import { X, Plus, Trash2 } from "lucide-react";
import LoadingComponent from "@/components/LoadingComponent";
import useRedirectLoggedOutUser from "@/lib/redirect";

// Helper to format date as yyyy-MM-dd
function formatDate(date) {
  if (!date) return "";
  if (typeof date === "string") return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

const getInitialForm = () => ({
  vehicleId: "",
  liters: "",
  odometer: "",
  pumpedAt: new Date(),
  previousOdometer: "",
});

const Dispense = () => {
    useRedirectLoggedOutUser();
  const { auth } = useContext(AuthContext);
    console.log(auth)
  const [forms, setForms] = useState([getInitialForm()]);
  const [errors, setErrors] = useState([{}]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [lastTransactions, setLastTransactions] = useState([null]);
  const [fetchingLast, setFetchingLast] = useState([false]);
  const [pricePerLiter, setPricePerLiter] = useState([0]);
  const [totalCost, setTotalCost] = useState([0]);
  const [vehicleSearch, setVehicleSearch] = useState([""]);
  const [showVehicleList, setShowVehicleList] = useState([false]);
  const comboboxRefs = useRef([]);
  const [submitting, setSubmitting] = useState([false]);

  // Fetch vehicles once
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
    setPricePerLiter(forms.map((form) => {
      if (!form.vehicleId || vehicles.length === 0) return 0;
      const selectedVehicle = vehicles.find((v) => v._id === form.vehicleId);
      if (!selectedVehicle) return 0;
      const fuelType = selectedVehicle.fuelType;
      const priceObj = fuelPrice.find((f) => f.type === fuelType);
      return priceObj ? priceObj.price : 0;
    }));
  }, [forms, vehicles]);

  // Update totalCost when liters or pricePerLiter changes
  useEffect(() => {
    setTotalCost(forms.map((form, i) => {
      const liters = parseFloat(form.liters);
      if (!isNaN(liters) && pricePerLiter[i]) {
        return Math.round(liters * pricePerLiter[i]);
      } else {
        return 0;
      }
    }));
  }, [forms, pricePerLiter]);

  // Fetch last transaction for each form
  useEffect(() => {
    forms.forEach((form, idx) => {
      if (!form.vehicleId) {
        setLastTransactions((prev) => {
          const arr = [...prev];
          arr[idx] = null;
          return arr;
        });
        setForms((prev) => {
          const arr = [...prev];
          arr[idx].previousOdometer = "";
          return arr;
        });
        return;
      }
      setFetchingLast((prev) => {
        const arr = [...prev];
        arr[idx] = true;
        return arr;
      });
      const fetchLastTransaction = async () => {
        try {
          const resList = await fetch(`/api/fuel-transactions/${form.vehicleId}`);
          const dataList = await resList.json();
          setLastTransactions((prev) => {
            const arr = [...prev];
            arr[idx] = dataList.data ? [dataList.data] : [];
            return arr;
          });
          setForms((prev) => {
            const arr = [...prev];
            arr[idx].previousOdometer = "";
            return arr;
          });
        } catch (err) {
          setLastTransactions((prev) => {
            const arr = [...prev];
            arr[idx] = [];
            return arr;
          });
          setForms((prev) => {
            const arr = [...prev];
            arr[idx].previousOdometer = "";
            return arr;
          });
        } finally {
          setFetchingLast((prev) => {
            const arr = [...prev];
            arr[idx] = false;
            return arr;
          });
        }
      };
      fetchLastTransaction();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forms.map(f => f.vehicleId).join(",")]);

  // Get last odometer for a form
  const getLastOdometer = (idx) => {
    const lastTransaction = lastTransactions[idx];
    return Array.isArray(lastTransaction) && lastTransaction.length > 0
      ? lastTransaction[0]?.odometer
      : undefined;
  };

  const handleChange = (idx, e) => {
    const { name, value } = e.target;
    setForms((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [name]: value };
      return arr;
    });
  };

  const validate = (form, idx) => {
    const errs = {};
    if (!form.vehicleId) errs.vehicleId = "Vehicle is required";
    if (!form.liters) errs.liters = "Liters is required";
    if (!form.odometer || isNaN(Number(form.odometer)))
      errs.odometer = "Odometer is required";
    if (getLastOdometer(idx) === undefined && !form.previousOdometer)
      errs.previousOdometer = "Previous odometer is required";
    const prevOdo =
      getLastOdometer(idx) !== undefined
        ? Number(getLastOdometer(idx))
        : Number(form.previousOdometer);
    if (form.odometer && prevOdo >= Number(form.odometer)) {
      errs.odometer = "Odometer must be greater than previous value";
    }
    return errs;
  };

  const filteredVehicles = (search) => vehicles.filter((v) =>
    (v.plate + " " + (v.model || "")).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    showVehicleList.forEach((show, idx) => {
      if (!show) return;
      function handleClick(e) {
        if (!comboboxRefs.current[idx] || !comboboxRefs.current[idx].contains(e.target))
          setShowVehicleList((prev) => {
            const arr = [...prev];
            arr[idx] = false;
            return arr;
          });
      }
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    });
  }, [showVehicleList]);

  const handleSubmit = (idx, e) => {
    e.preventDefault();
    const errs = validate(forms[idx], idx);
    setErrors((prev) => {
      const arr = [...prev];
      arr[idx] = errs;
      return arr;
    });
    if (Object.keys(errs).length === 0) {
      setSubmitting((prev) => {
        const arr = [...prev];
        arr[idx] = true;
        return arr;
      });
      const prevOdo =
        getLastOdometer(idx) !== undefined
          ? Number(getLastOdometer(idx))
          : Number(forms[idx].previousOdometer);
      const km = Number(forms[idx].odometer) - prevOdo;
      const km_lit = Number((km / Number(forms[idx].liters)).toFixed(2));
      const payload = {
        ...forms[idx],
        liters: Number(forms[idx].liters),
        odometer: forms[idx].odometer ? Number(forms[idx].odometer) : undefined,
        km_lit,
        pricePerLiter: pricePerLiter[idx],
        totalCost: totalCost[idx],
        recordedBy: auth?.id,
        previousOdometer: undefined, // don't send to API
        pumpedAt: forms[idx].pumpedAt ? forms[idx].pumpedAt : new Date(),
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
            setForms((prev) => {
              const arr = [...prev];
              arr[idx] = getInitialForm();
              return arr;
            });
          } else {
            toast.error(result.message || "Failed to record fuel transaction.");
            setSubmitting((prev) => {
              const arr = [...prev];
              arr[idx] = false;
              return arr;
            });
          }
        })
        .catch(() => {
          toast.error("Failed to record fuel transaction.");
          setSubmitting((prev) => {
            const arr = [...prev];
            arr[idx] = false;
            return arr;
          });
        });
    }
  };

  const handleClear = (idx) => {
    setForms((prev) => {
      const arr = [...prev];
      arr[idx] = getInitialForm();
      return arr;
    });
    setErrors((prev) => {
      const arr = [...prev];
      arr[idx] = {};
      return arr;
    });
  };

  const handleAddForm = () => {
    setForms((prev) => [...prev, getInitialForm()]);
    setErrors((prev) => [...prev, {}]);
    setLastTransactions((prev) => [...prev, null]);
    setFetchingLast((prev) => [...prev, false]);
    setPricePerLiter((prev) => [...prev, 0]);
    setTotalCost((prev) => [...prev, 0]);
    setVehicleSearch((prev) => [...prev, ""]);
    setShowVehicleList((prev) => [...prev, false]);
    setSubmitting((prev) => [...prev, false]);
  };

  const handleRemoveForm = (idx) => {
    if (forms.length === 1) return;
    setForms((prev) => prev.filter((_, i) => i !== idx));
    setErrors((prev) => prev.filter((_, i) => i !== idx));
    setLastTransactions((prev) => prev.filter((_, i) => i !== idx));
    setFetchingLast((prev) => prev.filter((_, i) => i !== idx));
    setPricePerLiter((prev) => prev.filter((_, i) => i !== idx));
    setTotalCost((prev) => prev.filter((_, i) => i !== idx));
    setVehicleSearch((prev) => prev.filter((_, i) => i !== idx));
    setShowVehicleList((prev) => prev.filter((_, i) => i !== idx));
    setSubmitting((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-4">
      {forms.map((form, idx) => (
        <form
          key={idx}
          onSubmit={(e) => handleSubmit(idx, e)}
          className="flex flex-col gap-1 rounded-lg p-4 border border-gray-200 relative"
        >
          {/* Remove button for extra forms */}
          {forms.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveForm(idx)}
              className="absolute top-2 right-2 text-red-500 hover:bg-red-100 rounded-full p-1"
              title="Remove this form"
            >
              <Trash2 size={18} />
            </button>
          )}
          {/* Info boxes for price per liter and total cost */}
          <div className="flex gap-1 justify-between border-b border-[#F26B5E] ">
            <h3 className="text-1xl font-bold text-center text-[#02733E]">Fuel Pump</h3>
            <div>
              <span className="text-[#02733E] font-bold">{pricePerLiter[idx]} / liter</span>
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
                <div ref={el => comboboxRefs.current[idx] = el} className="relative ">
                  <input
                    type="text"
                    value={
                      form.vehicleId
                        ? (vehicles.find((v) => v._id === form.vehicleId)?.plate || "") +
                          (vehicles.find((v) => v._id === form.vehicleId)?.model
                            ? " - " + vehicles.find((v) => v._id === form.vehicleId)?.model
                            : "")
                        : vehicleSearch[idx] || ""
                    }
                    onChange={e => {
                      setVehicleSearch(prev => {
                        const arr = [...prev];
                        arr[idx] = e.target.value;
                        return arr;
                      });
                      setShowVehicleList(prev => {
                        const arr = [...prev];
                        arr[idx] = true;
                        return arr;
                      });
                      setForms(prev => {
                        const arr = [...prev];
                        arr[idx] = { ...arr[idx], vehicleId: "" };
                        return arr;
                      });
                    }}
                    onFocus={() => setShowVehicleList(prev => { const arr = [...prev]; arr[idx] = true; return arr; })}
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
                        setForms(prev => {
                          const arr = [...prev];
                          arr[idx] = { ...arr[idx], vehicleId: "" };
                          return arr;
                        });
                        setVehicleSearch(prev => { const arr = [...prev]; arr[idx] = ""; return arr; });
                        setShowVehicleList(prev => { const arr = [...prev]; arr[idx] = false; return arr; });
                      }}
                      className="absolute right-2 top-4 z-101 bg-transparent border-none cursor-pointer text-gray-500"
                    >
                      ×
                    </button>
                  )}
                  {showVehicleList[idx] && !form.vehicleId && (
                    <ul className="absolute z-100 bg-white border border-gray-200 rounded-lg w-full max-h-48 overflow-y-auto mt-2 p-0 list-none top-14 left-0">
                      {filteredVehicles(vehicleSearch[idx] || "").length === 0 && (
                        <li className="p-2 text-gray-500">No vehicles found</li>
                      )}
                      {filteredVehicles(vehicleSearch[idx] || "").map((v) => (
                        <li
                          key={v._id}
                          className="p-2 cursor-pointer"
                          onClick={() => {
                            setForms(prev => {
                              const arr = [...prev];
                              arr[idx] = { ...arr[idx], vehicleId: v._id };
                              return arr;
                            });
                            setVehicleSearch(prev => { const arr = [...prev]; arr[idx] = ""; return arr; });
                            setShowVehicleList(prev => { const arr = [...prev]; arr[idx] = false; return arr; });
                          }}
                        >
                          {v.plate} {v.model ? `- ${v.model}` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {errors[idx]?.vehicleId && (
                <span className="ml-8 text-red-500">{errors[idx].vehicleId}</span>
              )}
            </label>
            <label className="font-semibold text-gray-700 text-sm mb-1 w-full">
              Date
              <input
                name="pumpedAt"
                type="date"
                value={formatDate(form.pumpedAt)}
                onChange={e => handleChange(idx, e)}
                className="w-full p-2 rounded-lg border border-gray-200 mt-2 text-sm bg-white outline-none"
              />
            </label>
          </div>
          {/* Previous odometer and Odometer in one row */}
          {form.vehicleId && (
            <div className="flex" style={{ gap: 16 }}>
              {fetchingLast[idx] ? (
                <LoadingComponent />
              ) : (
                <label className="font-medium text-gray-700 text-sm mb-0 flex flex-col w-full">
                  <span className="mb-1">Previous (KM)</span>
                  <input
                    name="previousOdometer"
                    value={
                      getLastOdometer(idx) !== undefined
                        ? getLastOdometer(idx)
                        : form.previousOdometer
                    }
                    onChange={e => handleChange(idx, e)}
                    type="number"
                    min="0"
                    step="1"
                    required
                    readOnly={getLastOdometer(idx) !== undefined}
                    className="w-full p-2 rounded-lg border border-gray-200 mt-1 text-sm bg-white outline-none"
                  />
                  {errors[idx]?.previousOdometer && (
                    <span className="ml-2 text-red-500 text-sm">
                      {errors[idx].previousOdometer}
                    </span>
                  )}
                </label>
              )}
              <label className="font-semibold text-gray-700 text-sm mb-3 w-full">
                KM
                <input
                  name="odometer"
                  value={form.odometer}
                  onChange={e => handleChange(idx, e)}
                  type="number"
                  min="0"
                  step="1"
                  required
                  className="w-full p-2 rounded-lg border border-gray-400 mt-2 text-sm bg-[#FBFBFB] text-[#02733E] outline-none"
                />
                {errors[idx]?.odometer && (
                  <span className="ml-2 text-red-500 text-sm">
                    {errors[idx].odometer}
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
                onChange={e => handleChange(idx, e)}
                type="number"
                min="0"
                step="any"
                required
                className="w-full p-2 rounded-lg border border-gray-400 mt-2 text-sm bg-[#FBFBFB] text-[#02733E] outline-none"
              />
              {errors[idx]?.liters && (
                <span className="ml-2 text-red-500 text-sm">{errors[idx].liters}</span>
              )}
            </label>
            <label className="font-semibold text-gray-700 text-sm mb-3 w-full">
              Total Cost
              <input
                name="totalCost"
                value={totalCost[idx]}
                onChange={e => {
                  const value = e.target.value;
                  setTotalCost(prev => {
                    const arr = [...prev];
                    arr[idx] = Math.round(Number(value));
                    return arr;
                  });
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
              onClick={() => handleClear(idx)}
              className="bg-[#F26B5E] text-gray-900 border border-gray-200 rounded-lg p-2 font-semibold text-sm "
            >
              <X />
            </button>
            <button
              type="submit"
              className="bg-[#02733E] text-white border border-[#038C4C] rounded-lg p-2 font-semibold text-sm disabled:bg-[#D1D8BE] disabled:cursor-not-allowed"
              disabled={submitting[idx]}
            >
              {submitting[idx] ? <LoadingComponent /> : "Submit"}
            </button>
          </div>
        </form>
      ))}
      <button
        type="button"
        onClick={handleAddForm}
        className="flex items-center gap-2 bg-green-600 text-white font-bold rounded-lg px-4 py-2 mt-2 self-end hover:bg-green-700"
      >
        <Plus size={18} /> Add Another
      </button>
    </div>
  );
};

export default Dispense;