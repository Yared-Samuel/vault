import React from 'react'

const CheckBox = ({label, description, name, id, checked, onChange, required}) => {
  return (
    <div className="relative flex items-start">
    <div className="flex items-center h-5 mt-1">
      <input id={id} name={name} type="checkbox" className="border-gray-200 rounded-sm text-blue-600 focus:ring-blue-500 checked:border-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800" aria-describedby={id} checked={checked} onChange={onChange} required={required}  />
    </div>
    <label htmlFor={id} className="ms-3">
      <span className="block text-sm font-semibold text-gray-800 dark:text-neutral-300">{label}</span>
      <span id={id} className="block text-sm text-gray-600 dark:text-neutral-500">{description}</span>
    </label>
  </div>
  )
}

export default CheckBox