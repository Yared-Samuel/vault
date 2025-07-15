import { Asterisk } from 'lucide-react';
import React from 'react'

const InputFloating = ({label,name, id, type, placeholder, value, onChange, required, hidden = false}) => {
  return (
    <div className={`max-w-sm ${hidden ? "hidden" : ""}`}>
        <label htmlFor="input-label" className="block text-xs mb-2 dark:text-white font-poppins font-extrabold">{label} {required ? <Asterisk color="#db0a0a" size={13} className='inline-block' /> : ""}</label>
        <input 
        type={type} 
        name={name} 
        id={id} 
        value={value} 
        onChange={onChange} 
        required={required} 
        placeholder={placeholder}
            className="py-1 sm:py-1 px-3 block w-full border-gray-300 outline-2 rounded-lg sm:text-xs focus:outline-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 font-semibold" >
        </input>
    
    </div>
      );
};

export default InputFloating;