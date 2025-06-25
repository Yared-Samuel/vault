import { checkTypes } from '@/lib/constants'
import React from 'react'

const PrepareCheck = () => {
  return (
    <div className='w-full'>
      <div>
        <select className='border border-gray-300 rounded py-1  text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white '>
          {checkTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      <div className='flex flex-col gap-2'>
      <div className="relative z-0  mb-5 group">
                    <input
                      type="text"
                      name="to"
                      // value={entry.to}
                      // onChange={handleEntryChange}
                      placeholder=""
                      className="block py-2.5 px-0 text-sm text-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#02733E] peer"
                    />
                    <label
                      htmlFor="amount"
                      className="peer-focus:font-medium absolute text-lg text-black font-bold duration-300 transform -translate-y-6 scale-75 top-1 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#02733E] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                      Paid To
                    </label>
                  </div>
      </div>
      
    </div>
  )
}

export default PrepareCheck