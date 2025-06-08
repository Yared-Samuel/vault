// This file is the single source of truth for checkTypes used throughout the app.
// Import checkTypes from here wherever you need it to ensure consistency.

export const checkTypes = [
  { value: "purchase", label: "Payment/Purchase" },
  { value: "petty_cash", label: "Petty Cash" },
  { value: "fuel", label: "Fuel" },
  { value: "general", label: "General" },
  { value: "other", label: "Other" },
];
export const banks = [
  { value: "awash", label: "Awash", primaryColor: '#EE8C37', secondaryColor: '#020063' },
  { value: "dashin", label: "Dashin", primaryColor: '#132062', secondaryColor: '#F7F7F7' },
  { value: "cbe", label: "CBE", primaryColor: '#8D268B', secondaryColor: '#BD936A' },
  { value: "united", label: "United", primaryColor: '#06ADAC', secondaryColor: '#481566' },
  { value: "abyssinia", label: "Abyssinia", primaryColor: '#E8A71F', secondaryColor: '#000000' },

];

export const transactionTypes = [
  { value: "receipt_payment", label: "Receipt Payment" },
  { value: "suspence_payment", label: "Suspence Payment" },
  { value: "check_payment", label: "Check Payment" },
];

export const transactionTypesModel = ["receipt_payment",  "suspence_payment", "check_payment"]


export const transactionStatusesModel = ["requested", "approved", "suspence", "paid", "rejected"]



export const userRoles = ["admin", "accountant", "cashier", "purchaser", "owner", "transporter"]

export const fuelPrice = [{type: "Benzin", price: 122.53}, {type: "Nafta", price: 120.90}]