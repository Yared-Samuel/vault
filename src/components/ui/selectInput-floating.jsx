import { Asterisk, X } from 'lucide-react'
import React from 'react'

const SelectInputFloating = ({label,name, id, type, placeholder, value, onChange, required, data, datakeys, datavalues, datalabeling, onClick = null, hidden = false}) => {
  // Handler to clear the selection
  const handleClear = (e) => {
    e.stopPropagation();
    // Create a synthetic event to mimic clearing
    const event = {
      target: {
        name: name,
        value: '',
      }
    };
    onChange(event);
  };

  return (
    <div className={`max-w-sm relative ${hidden ? "hidden" : ""}`}>
        <label htmlFor="input-label" className="block text-xs  mb-2 dark:text-white font-poppins font-extrabold">{label} {required ? <Asterisk color="#db0a0a" size={13} className='inline-block' /> : ""}</label>
        <div className="relative">
          <select type={type} name={name} id={id} value={value} onChange={onChange} required={required} data={data} datakeys={datakeys} datavalues={datavalues} datalabeling={datalabeling} onClick={onClick} 
            className="py-1 sm:py-1 px-3 block w-full border-gray-200 outline-2 rounded-lg sm:text-xs focus:outline-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 font-semibold pr-8" placeholder={placeholder}>
            <option disabled value="">{label}</option>
            {data.map((bank) => (
              <option key={bank[datakeys]} value={bank[datavalues]}>
                {bank[datalabeling]}
              </option>
            ))}
          </select>
          {/* X icon to clear selection */}
          {value && (
            <button type="button" onClick={handleClear} className="absolute right-0 top-1/2 -translate-y-1/2 p-0.5 bg-white dark:bg-neutral-900 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800" tabIndex={-1}>
              <X size={16} className="text-gray-400" />
            </button>
          )}
        </div>
    </div>
  )
}

export default SelectInputFloating