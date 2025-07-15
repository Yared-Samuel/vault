import React, { useState, useEffect, useContext, useRef } from "react";
import { fuelPrice } from "@/lib/constants";
import AuthContext from "@/pages/context/AuthProvider";
import { toast } from "sonner";
import { X, Plus, Trash2 } from "lucide-react";
import LoadingComponent from "@/components/LoadingComponent";
import useRedirectLoggedOutUser from "@/lib/redirect";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  station: "",
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
  const [expandedIdx, setExpandedIdx] = useState(0); // Only one expanded at a time

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
    if (!form.station) errs.station = "Station is required";
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
        station: forms[idx].station, // ensure station is sent
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
            setSubmitting((prev) => {
              const arr = [...prev];
              arr[idx] = false;
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

  const handleDuplicateForm = (idx) => {
    setForms((prev) => {
      const arr = [...prev];
      arr.splice(idx + 1, 0, { ...arr[idx] });
      return arr;
    });
    setErrors((prev) => {
      const arr = [...prev];
      arr.splice(idx + 1, 0, {});
      return arr;
    });
    setLastTransactions((prev) => {
      const arr = [...prev];
      arr.splice(idx + 1, 0, lastTransactions[idx]);
      return arr;
    });
    setFetchingLast((prev) => {
      const arr = [...prev];
      arr.splice(idx + 1, 0, false);
      return arr;
    });
    setPricePerLiter((prev) => {
      const arr = [...prev];
      arr.splice(idx + 1, 0, pricePerLiter[idx]);
      return arr;
    });
    setTotalCost((prev) => {
      const arr = [...prev];
      arr.splice(idx + 1, 0, totalCost[idx]);
      return arr;
    });
    setVehicleSearch((prev) => {
      const arr = [...prev];
      arr.splice(idx + 1, 0, vehicleSearch[idx]);
      return arr;
    });
    setShowVehicleList((prev) => {
      const arr = [...prev];
      arr.splice(idx + 1, 0, false);
      return arr;
    });
    setSubmitting((prev) => {
      const arr = [...prev];
      arr.splice(idx + 1, 0, false);
      return arr;
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-24 pt-6 w-full">
      {forms.map((form, idx) => {
        const isExpanded = expandedIdx === idx;
        // Summary for collapsed card
        const vehicle = vehicles.find((v) => v._id === form.vehicleId);
        const summary = (
          <div className="flex flex-col gap-1 p-3">
            {/* Top row: Vehicle | Liters | ETB */}
            <div className="flex items-center justify-between gap-2 w-full mb-1">
              <span className="font-bold text-[#02733E] text-base truncate max-w-[40%]">
                {vehicle ? `${vehicle.plate}` : 'No Vehicle'}
              </span>

              <span
  className="inline-block px-3 py-0.5 rounded-full bg-gray-100 border border-orange-300 text-orange-700 font-bold text-xs sm:text-sm whitespace-nowrap shadow-sm"
>
  {form?.odometer || 0} KM
</span>
              
            </div>
            {/* Second row: Actions and date */}
            <div className="flex justify-between items-center  gap-2 w-full">
              

              <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                {form.liters || 0} Lt
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#02733E] whitespace-nowrap">
                {totalCost[idx] || 0} ETB
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#02733E] whitespace-nowrap">
                {form.station}
              </span>
            </div>
            
          </div>
        );
        return (
          <Card key={idx} className={`w-full ${isExpanded ? 'shadow-lg border-[#02733E]' : 'border-gray-200'} transition-all duration-200`}> 
            <div onClick={() => !isExpanded && setExpandedIdx(idx)} className={`cursor-pointer ${isExpanded ? '' : 'opacity-80'}`}> 
              {!isExpanded && summary}
            </div>
            {isExpanded && (
              <form
                onSubmit={(e) => handleSubmit(idx, e)}
                className="flex flex-col gap-4 p-2 sm:p-4 relative"
                style={{ touchAction: 'manipulation' }}
              >
                {/* Remove button for extra forms */}
                {forms.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => handleRemoveForm(idx)}
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    title="Remove this form"
                  >
                    <Trash2 size={18} />
                  </Button>
                )}
                {/* Vehicle input at the top, no label/title */}
                <div className="flex flex-col gap-2 border-b border-gray-200 pb-2">
                  <div className="flex justify-around gap-2 sm:flex-row sm:gap-4">
                    <div className="w-2/3 mx-auto sm:text-sm">
                      <div ref={el => comboboxRefs.current[idx] = el} className="relative ">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={
                            showVehicleList[idx] || !form.vehicleId
                              ? vehicleSearch[idx] || ""
                              : (vehicles.find((v) => v._id === form.vehicleId)?.plate || "") +
                                (vehicles.find((v) => v._id === form.vehicleId)?.model
                                  ? " - " + vehicles.find((v) => v._id === form.vehicleId)?.model
                                  : "")
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
                          className="p-2 rounded-lg border border-gray-400 mt-1 text-xs bg-[#FBFBFB] text-[#02733E] outline-none w-full"
                          autoComplete="off"
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
                          <ul className="absolute z-100 bg-white border border-gray-200 rounded-lg w-full max-h-80 overflow-y-auto mt-2 p-0 list-none top-14 left-0 text-sm md:text-lg">
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
                                <span
                                  className="inline-block px-2 py-0.5 bg-white border-2 border-blue-700 rounded-sm font-mono font-extrabold  text-blue-700 tracking-widest align-middlev text-xs md:text-base"
                                  
                                >
                                  {v.plate}
                                </span>
                                
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {errors[idx]?.vehicleId && (
                        <span className="ml-2 text-red-500 block text-xs mt-1">{errors[idx].vehicleId}</span>
                      )}
                    </div>
                    <div className="w-1/3 mx-auto">
                      {/* <label className="flex flex-col w-full">
                        <span className="mb-1 text-xs font-semibold text-gray-700">Station <span className="text-red-500">*</span></span> */}
                        <select
                          name="station"
                          value={form.station}
                          onChange={e => handleChange(idx, e)}
                          required
                          className="w-full p-2 rounded-lg border border-gray-400 mt-1 text-xs bg-[#FBFBFB] text-[#02733E] outline-none"
                        >
                          <option value="" disabled>Select station</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                        {errors[idx]?.station && (
                          <span className="text-red-500 text-xs mt-1">{errors[idx].station}</span>
                        )}
                      {/* </label> */}
                    </div>
                  </div>
                </div>
                {/* Odometer & Fuel row remains unchanged */}
                {form.vehicleId && (
                  <div className="flex flex-col gap-2 border-b border-gray-200 pb-2">
                    <h4 className="text-sm font-bold text-[#02733E] mb-1">Odometer & Fuel</h4>
                    <div className="flex flex-row gap-2 w-full">
                      {/* Previous (KM) */}
                      <label className="flex flex-col w-1/3 min-w-0">
                        <span className="mb-1 text-xs font-semibold text-gray-700">Previous (KM)</span>
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
                          className="w-full p-1.5 rounded border border-gray-200 text-xs bg-white outline-none"
                          placeholder="Prev. KM"
                        />
                        {errors[idx]?.previousOdometer && (
                          <span className="text-red-500 text-[10px] mt-0.5">{errors[idx].previousOdometer}</span>
                        )}
                      </label>
                      {/* Current (KM) */}
                      <label className="flex flex-col w-1/3 min-w-0">
                        <span className="mb-1 text-xs font-semibold text-gray-700">Current (KM)</span>
                        <input
                          name="odometer"
                          value={form.odometer}
                          onChange={e => handleChange(idx, e)}
                          type="number"
                          min="0"
                          step="1"
                          required
                          className="w-full p-1.5 rounded border border-gray-400 text-xs bg-[#FBFBFB] text-[#02733E] outline-none"
                          placeholder="Current KM"
                        />
                        {errors[idx]?.odometer && (
                          <span className="text-red-500 text-[10px] mt-0.5">{errors[idx].odometer}</span>
                        )}
                      </label>
                      {/* Liters */}
                      <label className="flex flex-col w-1/3 min-w-0">
                        <span className="mb-1 text-xs font-semibold text-gray-700">Liters</span>
                        <input
                          name="liters"
                          value={form.liters}
                          onChange={e => handleChange(idx, e)}
                          type="number"
                          min="0"
                          step="any"
                          required
                          className="w-full p-1.5 rounded border border-gray-400 text-xs bg-[#FBFBFB] text-[#02733E] outline-none"
                          placeholder="Liters"
                        />
                        {errors[idx]?.liters && (
                          <span className="text-red-500 text-[10px] mt-0.5">{errors[idx].liters}</span>
                        )}
                      </label>
                    </div>
                  </div>
                )}
                {/* Date and Total Cost on the same row, compact */}
                <div className="flex flex-row gap-2 w-full mt-2">
                  <label className="flex flex-col w-1/2 min-w-0">
                    <span className="mb-1 text-xs font-semibold text-gray-700">Total Cost</span>
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
                      className="w-full p-1.5 rounded border border-gray-200 text-xs bg-white outline-none"
                      placeholder="Calculated automatically"
                    />
                  </label>
                  <label className="flex flex-col w-1/2 min-w-0">
                    <span className="mb-1 text-xs font-semibold text-gray-700">Date</span>
                    <input
                      name="pumpedAt"
                      type="date"
                      value={formatDate(form.pumpedAt)}
                      onChange={e => handleChange(idx, e)}
                      className="w-full p-1.5 rounded border border-gray-200 text-xs bg-white outline-none"
                    />
                  </label>
                </div>
                <div className="flex justify-between gap-4 mt-2 border-t border-[#f26a5e73] pt-2">
                  <Button
                    type="button"
                    onClick={() => handleClear(idx)}
                    variant="outline"
                    className="bg-[#F26B5E] text-gray-900 border border-gray-200 rounded-lg p-2 font-semibold text-sm "
                  >
                    <X />
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#02733E] text-white border border-[#038C4C] rounded-lg p-2 font-semibold text-sm disabled:bg-[#D1D8BE] disabled:cursor-not-allowed"
                    disabled={submitting[idx]}
                  >
                    {submitting[idx] ? <LoadingComponent /> : "Submit"}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        );
      })}
      {/* Sticky Add Another button for mobile */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 p-2 flex justify-end sm:static sm:bg-transparent sm:border-0 sm:p-0">
        <Button
          type="button"
          onClick={() => {
            handleAddForm();
            setExpandedIdx(forms.length); // expand the new one
          }}
          className="flex items-center gap-2 bg-green-600 text-white font-bold rounded-lg px-4 py-2 hover:bg-green-700 w-full sm:w-auto"
        >
          <Plus size={18} /> Add Another
        </Button>
      </div>
    </div>
  );
};

export default Dispense;