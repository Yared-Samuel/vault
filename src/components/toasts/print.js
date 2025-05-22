import React from 'react';

const PrintButton = ({ onPrint, ...props }) => (
  <button
    className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow transition-transform duration-150 hover:scale-110 hover:shadow-lg cursor-pointer"
    title="Print Invoice"
    onClick={onPrint}
    {...props}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-6 0v4m0 0h4m-4 0H8" /></svg>
  </button>
);

export default PrintButton; 