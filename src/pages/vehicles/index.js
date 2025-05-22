import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        console.log(data)
        if (res.ok) {
          setVehicles(data.data);
        } else {
          setError(data.error || 'Failed to fetch vehicles');
          toast.error(data.error || 'Failed to fetch vehicles');
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchVehicles();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold mb-4">Vehicle List</h2>
        <Button>
          <Link href="/vehicles/new">Add Vehicle</Link>
        </Button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && vehicles.length === 0 && (
        <div className="text-muted-foreground">No vehicles found.</div>
      )}
      {!loading && !error && vehicles.map((vehicle) => (
        <Card key={vehicle._id} className="flex flex-row items-center gap-6 px-4">
          <div className="flex justify-between">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="text-lg">{vehicle.plate}</CardTitle>
            </CardHeader>
            <CardHeader className=" flex justify-between gap-4">
              <div className="text-sm text-muted-foreground"> {vehicle.model || <span className="italic">N/A</span>}</div>
            </CardHeader>
            <CardHeader className=" flex justify-between gap-4">
              <div className="text-sm text-muted-foreground"> {vehicle.fuelType}</div>
            </CardHeader>
          </div>
        </Card>
      ))}
    </div>
  );
} 