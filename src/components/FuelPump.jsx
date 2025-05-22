import React, { useState, useEffect, useContext } from 'react'
import { fuelPrice } from '@/lib/constants'
import AuthContext from "../pages/context/AuthProvider"
import { toast } from 'sonner'

// Helper to format date as yyyy-MM-dd
function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

const FuelPump = () => {
  const { auth } = useContext(AuthContext);
  
  const [form, setForm] = useState({
    vehicleId: '',
    liters: '',
    odometer: '',
    pumpedAt: new Date(),
    previousOdometer: '',
  });
  const [errors, setErrors] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [fetchingLast, setFetchingLast] = useState(false);
  const [pricePerLiter, setPricePerLiter] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        if (data.success) {
          setVehicles(data.data);
        } else {
          setFetchError('Failed to fetch vehicles');
        }
      } catch (err) {
        setFetchError('Failed to fetch vehicles');
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
    const selectedVehicle = vehicles.find(v => v._id === form.vehicleId);
    if (!selectedVehicle) {
      setPricePerLiter(0);
      return;
    }
    const fuelType = selectedVehicle.fuelType;
    const priceObj = fuelPrice.find(f => f.type === fuelType);
    setPricePerLiter(priceObj ? priceObj.price : 0);
  }, [form.vehicleId, vehicles]);

  // Update totalCost when liters or pricePerLiter changes
  useEffect(() => {
    const liters = parseFloat(form.liters);
    if (!isNaN(liters) && pricePerLiter) {
      setTotalCost(liters * pricePerLiter);
    } else {
      setTotalCost(0);
    }
  }, [form.liters, pricePerLiter]);

  useEffect(() => {
    if (!form.vehicleId) {
      setLastTransaction(null);
      setForm((prev) => ({ ...prev, previousOdometer: '' }));
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
          setForm((prev) => ({ ...prev, previousOdometer: '' }));
        }
      } catch (err) {
        setLastTransaction([]);
        setForm((prev) => ({ ...prev, previousOdometer: '' }));
      } finally {
        setFetchingLast(false);
      }
    };
    fetchLastTransaction();
  }, [form.vehicleId]);

  // Get last odometer from lastTransaction array
  const lastOdometer = Array.isArray(lastTransaction) && lastTransaction.length > 0
    ? lastTransaction[0]?.odometer
    : undefined;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.vehicleId) errs.vehicleId = 'Vehicle is required';
    if (!form.liters) errs.liters = 'Liters is required';
    if (!form.odometer || isNaN(Number(form.odometer))) errs.odometer = 'Odometer is required';
    if (lastOdometer === undefined && !form.previousOdometer) errs.previousOdometer = 'Previous odometer is required';
    const prevOdo = lastOdometer !== undefined ? Number(lastOdometer) : Number(form.previousOdometer);
    if (form.odometer && prevOdo >= Number(form.odometer)) {
      errs.odometer = 'Odometer must be greater than previous value';
    }
    return errs;
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      const prevOdo = lastOdometer !== undefined ? Number(lastOdometer) : Number(form.previousOdometer);
      const km = Number(form.odometer) - prevOdo;
      const km_lit = km / Number(form.liters);
      

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
      // For now, just log the form values and km_lit
      // You can call a prop or API here
      fetch('/api/fuel-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const result = await res.json();
          if (res.ok) {
            toast.success('Fuel transaction recorded successfully!');
            setForm({
              vehicleId: '',
              liters: '',
              odometer: '',
              pumpedAt: new Date(),
              previousOdometer: '',
            });
            setTimeout(() => {
              window.location.reload();
            }, 1200);
          } else {
            toast.error(result.message || 'Failed to record fuel transaction.');
          }
        })
        .catch(() => {
          toast.error('Failed to record fuel transaction.');
        });
    }
  };



  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        padding: 24,
        maxWidth: 400,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        border: '1px solid #e2e8f0',
      }}
    >
      <style>{`
        @media (min-width: 500px) {
          .fuel-form-row {
            display: flex;
            gap: 16px;
          }
          .fuel-form-row > label {
            flex: 1 1 0;
            margin-bottom: 0 !important;
          }
        }
        @media (max-width: 499px) {
          .fuel-form-row {
            display: block;
          }
        }
      `}</style>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, color: '#1a202c', textAlign: 'center', letterSpacing: 1 }}>Fuel Pump</h3>
      {/* Info boxes for price per liter and total cost */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 8, justifyContent: 'center' }}>
        <div style={{
          background: '#f3f3f3',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
          color: '#2d3748',
          fontSize: 15,
          border: '1px solid #e2e8f0',
          minWidth: 0,
        }}>
          Price per Liter: <span style={{ color: '#3182ce', fontWeight: 700 }}>{pricePerLiter}</span>
        </div>
        <div style={{
          background: '#f3f3f3',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
          color: '#2d3748',
          fontSize: 15,
          border: '1px solid #e2e8f0',
          minWidth: 0,
        }}>
          Total Cost: <span style={{ color: '#3182ce', fontWeight: 700 }}>{totalCost}</span>
        </div>
      </div>
      {/* Vehicle row */}
      <label style={{ fontWeight: 600, color: '#2d3748', fontSize: 15, marginBottom: 12 }}>
        Vehicle
        {loading ? (
          <span style={{ marginLeft: 8 }}>Loading vehicles...</span>
        ) : fetchError ? (
          <span style={{ color: 'red', marginLeft: 8 }}>{fetchError}</span>
        ) : vehicles.length === 0 ? (
          <span style={{ marginLeft: 8 }}>No vehicles found</span>
        ) : (
          <select
            name="vehicleId"
            value={form.vehicleId}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              marginTop: 6,
              fontSize: 15,
              background: '#f9fafb',
              outline: 'none',
            }}
          >
            <option value="">Select vehicle</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>{v.plate}</option>
            ))}
          </select>
        )}
        {errors.vehicleId && <span style={{ color: 'red', marginLeft: 8 }}>{errors.vehicleId}</span>}
      </label>
      {/* Previous odometer and Odometer in one row */}
      {form.vehicleId && (
        <div className="fuel-form-row" style={{ gap: 16 }}>
          <div style={{ flex: 1 }}>
            {fetchingLast ? (
              <span style={{ fontSize: 12 }}>Fetching last transaction...</span>
            ) : (
              <label style={{ fontWeight: 500, color: '#2d3748', fontSize: 13, marginBottom: 0, display: 'flex', flexDirection: 'column', width: '100%' }}>
                <span style={{ marginBottom: 2 }}>Previous odometer (KM)</span>
                <input
                  name="previousOdometer"
                  value={lastOdometer !== undefined ? lastOdometer : form.previousOdometer}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="1"
                  required
                  readOnly={lastOdometer !== undefined}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    marginTop: 6,
                    fontSize: 15,
                    background: lastOdometer !== undefined ? '#f3f3f3' : '#f9fafb',
                    outline: 'none',
                  }}
                />
                {errors.previousOdometer && <span style={{ color: 'red', marginLeft: 4, fontSize: 12 }}>{errors.previousOdometer}</span>}
              </label>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 600, color: '#2d3748', fontSize: 15, marginBottom: 12, width: '100%' }}>
              Odometer (KM)
              <input
                name="odometer"
                value={form.odometer}
                onChange={handleChange}
                type="number"
                min="0"
                step="1"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  marginTop: 6,
                  fontSize: 15,
                  background: '#f9fafb',
                  outline: 'none',
                }}
              />
              {errors.odometer && <span style={{ color: 'red', marginLeft: 8 }}>{errors.odometer}</span>}
            </label>
          </div>
        </div>
      )}
      <div className="fuel-form-row">
        <label style={{ fontWeight: 600, color: '#2d3748', fontSize: 15, marginBottom: 12 }}>
          Date
          <input
            name="pumpedAt"
            type="date"
            value={formatDate(form.pumpedAt)}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              marginTop: 6,
              fontSize: 15,
              background: '#f9fafb',
              outline: 'none',
            }}
          />
        </label>
        <label style={{ fontWeight: 600, color: '#2d3748', fontSize: 15, marginBottom: 12 }}>
          Liters
          <input
            name="liters"
            value={form.liters}
            onChange={handleChange}
            type="number"
            min="0"
            step="any"
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              marginTop: 6,
              fontSize: 15,
              background: '#f9fafb',
              outline: 'none',
            }}
          />
          {errors.liters && <span style={{ color: 'red', marginLeft: 8 }}>{errors.liters}</span>}
        </label>
      </div>
      
      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
      <button
          type="button"
          onClick={() => setForm({ vehicleId: '', liters: '', odometer: '', pumpedAt: new Date(), previousOdometer: '' })}
          style={{
            background: '#e2e8f0',
            color: '#2d3748',
            border: 'none',
            borderRadius: 8,
            padding: '12px 0',
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: 1,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(226,232,240,0.08)',
            transition: 'background 0.2s',
            flex: 1,
          }}
        >
          Clear
        </button>
        <button
          type="submit"
          style={{
            background: '#3182ce',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 0',
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: 1,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(49,130,206,0.08)',
            transition: 'background 0.2s',
            flex: 1,
          }}
        >
          Submit
        </button>
  
      </div>
    </form>
  );
};

export default FuelPump