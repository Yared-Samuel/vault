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



export const userRoles = ["admin", "accountant", "cashier", "purchaser", "owner", "transporter","employee"]


// Vehicles constatnt

export const fuelPrice = [{type: "Benzin", price: 122.53}, {type: "Nafta", price: 120.94}]


export const vehicleComponentsCatagory = [
  { key: "MechanicalParts", label: "Mechanical Parts" },
  { key: "ElectricalParts", label: "Electrical Parts" },
  { key: "BodyParts", label: "Body Parts" },
  { key: "InteriorParts", label: "Interior Parts" },
  { key: "ExteriorParts", label: "Exterior Parts" },
  { key: "OtherParts", label: "Other Parts" },
]


export const vehicleComponents = [
  // Mechanical Parts
  { key: "engine", label: "Engine / ሞተር", category: "MechanicalParts" },
  { key: "transmission", label: "Transmission / ትራንስሚሽን", category: "MechanicalParts" },
  { key: "front_axle", label: "Front Axle / ፊት አክስል", category: "MechanicalParts" },
  { key: "rear_axle", label: "Rear Axle / ኋላ አክስል", category: "MechanicalParts" },
  { key: "suspension", label: "Suspension / ስስፔንሽን", category: "MechanicalParts" },
  { key: "steering", label: "Steering / ስቲዪሪንግ", category: "MechanicalParts" },
  { key: "brake_system", label: "Brake System / ብሬክ ስስተም", category: "MechanicalParts" },
  { key: "clutch", label: "Clutch / ክላች", category: "MechanicalParts" },
  { key: "fuel_system", label: "Fuel System / ነዳጅ ስስተም", category: "MechanicalParts" },
  { key: "exhaust_system", label: "Exhaust System / ኤጅዖስት ስስተም", category: "MechanicalParts" },

  // Electrical Parts
  { key: "battery", label: "Battery / ባትሪ", category: "ElectricalParts" },
  { key: "alternator", label: "Alternator / አልተርኔተር", category: "ElectricalParts" },
  { key: "starter_motor", label: "Starter Motor / ስታርተር ሞተር", category: "ElectricalParts" },
  { key: "fuse_box", label: "Fuse Box / ፉዝ ቦክስ", category: "ElectricalParts" },
  { key: "wiring", label: "Wiring / ወርይንግ", category: "ElectricalParts" },
  { key: "lighting_system", label: "Lighting System / መብራት ስስተም", category: "ElectricalParts" },
  { key: "air_conditioning", label: "Air Conditioning / ኤር ኮንዲሽነር", category: "ElectricalParts" },

  // Body Parts
  { key: "body", label: "Body / አካል", category: "BodyParts" },
  { key: "front_mirror", label: "Front Mirror / ፊት ኮከብ", category: "BodyParts" },
  { key: "rear_mirror", label: "Rear Mirror / ኋላ ኮከብ", category: "BodyParts" },
  { key: "bumpers", label: "Bumpers / ባምፐር", category: "BodyParts" },
  { key: "grille", label: "Grille / ግሪል", category: "BodyParts" },
  { key: "doors", label: "Doors / ደረቶች", category: "BodyParts" },
  { key: "hood", label: "Hood / ሆድ", category: "BodyParts" },
  { key: "trunk", label: "Trunk / ትራንክ", category: "BodyParts" },

  // Interior Parts
  { key: "dashboard_controls", label: "Dashboard / Controls / ዳሽቦርድ / መቆጣጠሪያዎች", category: "InteriorParts" },
  { key: "seats", label: "Seats / መቀመጫዎች", category: "InteriorParts" },
  { key: "carpet", label: "Carpet / ካርፔት", category: "InteriorParts" },
  { key: "headliner", label: "Headliner / ራፍ", category: "InteriorParts" },
  { key: "interior_lights", label: "Interior Lights / ውስጣዊ መብራቶች", category: "InteriorParts" },

  // Exterior Parts
  { key: "windshield", label: "Windshield / ፊት መስኮት", category: "ExteriorParts" },
  { key: "windows", label: "Windows / መስኮቶች", category: "ExteriorParts" },
  { key: "side_mirrors", label: "Side Mirrors / ጎን ኮከቦች", category: "ExteriorParts" },
  { key: "wipers", label: "Wipers / ዋይፐር", category: "ExteriorParts" },
  { key: "roof_rack", label: "Roof Rack / የጣሪ መያዣ", category: "ExteriorParts" },

  // Other Parts
  { key: "fuel_tank", label: "Fuel Tank / ነዳጅ ታንክ", category: "OtherParts" },
  { key: "radiator", label: "Radiator / ሬዲያተር", category: "OtherParts" },
  { key: "tires_wheels", label: "Tires & Wheels / ጎማና መንኰራኵር", category: "OtherParts" },
  { key: "others", label: "Others / ሌሎች", category: "OtherParts" },
];


