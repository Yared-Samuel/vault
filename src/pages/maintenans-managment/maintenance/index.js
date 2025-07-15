import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { Cross } from "lucide-react";
import SelectInputFloating from '@/components/ui/selectInput-floating';
import InputFloating from '@/components/ui/input-floatin';


const index = () => {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
      setLoading(true);
      const res = await fetch("/api/vehicles");
      const data = await res.json();

      if (data.success) {
        setVehicles(data.data);
      } else {
        setError("Failed to fetch maintenance");
      }
      } catch (err) {
        setError("Failed to fetch maintenance");
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  return (
    <div className="w-screen bg-white flex flex-col p-4 gap-4">
         <div className="flex justify-between items-center outline-2 p-2 rounded-lg">
        <h2 className="text-lg font-extrabold text-black  text-left tracking-wide drop-shadow">
          Maintenance Management
        </h2>
        <Button
          className='flex items-center gap-1 bg-white text-black font-bold px-1 py-2 rounded-lg transition border border-gray-300 cursor-pointer hover:bg-[#EEEFE0] disabled:opacity-60'
            // onClick={handleSubmit}
            disabled={loading}
        >
        <Cross size={20} />  {loading ? "Preparing..." : "Prepare"}
        </Button>
      </div>
      <div className="w-full px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 outline-1 p-4 rounded-lg">
        <SelectInputFloating
          label="Vehicle"
          id="vehicle"
          name="vehicle"
          type=""
          placeholder=" "
          required
          data={vehicles}
          dataKey="_id"
          dataValue="_id"
          dataLabel="plate"
        />
        <InputFloating
         type="number"
         label="KM"
         name="km"
         id="km"
         placeholder=" "
         required = {false}
         />
        <InputFloating
         type="text"
         label="Description"
         name="description"
         id="description"
         placeholder=" "
         required
         />
      </div>
    </div>
  )
}

export default index