import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner"
const fuelTypes = [
  { label: 'Benzin', value: 'Benzin' },
  { label: 'Nafta', value: 'Nafta' },
];

const templateHeaders = ['plate', 'model', 'fuelType'];
const templateRows = [
  ['ABC-123', 'Toyota Corolla', 'Benzin'],
  ['XYZ-789', 'Hyundai Accent', 'Nafta'],
];

function downloadTemplate() {
  // Create a CSV string for Excel
  const csv = [templateHeaders.join(','), ...templateRows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vehicle_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function NewVehiclePage() {
  const [form, setForm] = useState({ plate: '', model: '', fuelType: '' });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Vehicle created successfully!');
        setForm({ plate: '', model: '', fuelType: '' });
      } else {
        toast.error(data.error || 'Failed to create vehicle.');
      }
    } catch (err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      toast.info(`Selected file: ${file.name}\n(Parsing not implemented yet)`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-background p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add New Vehicle</h2>
      <div className="flex gap-2 mb-4">
        <Button type="button" variant="outline" onClick={downloadTemplate}>
          Download Excel Template
        </Button>
        <Button type="button" onClick={handleImportClick}>
          Import from Excel
        </Button>
        <input
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Plate</label>
          <input
            type="text"
            name="plate"
            value={form.plate}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 bg-muted"
            placeholder="Enter plate number"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Model</label>
          <input
            type="text"
            name="model"
            value={form.model}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-muted"
            placeholder="Enter vehicle model"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Fuel Type</label>
          <select
            name="fuelType"
            value={form.fuelType}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 bg-muted"
          >
            <option value="" disabled>Select fuel type</option>
            {fuelTypes.map((ft) => (
              <option key={ft.value} value={ft.value}>{ft.label}</option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={submitting || !form.plate || !form.fuelType} className="w-full">
          {submitting ? 'Submitting...' : 'Add Vehicle'}
        </Button>
      </form>
    </div>
  );
}