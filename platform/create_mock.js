import * as XLSX from "xlsx";
import fs from "fs";

// 1. Leads
const leads = [
  {
    "Client Name": "Ahmad Al-Fahad",
    "Phone Number": "+966501112222",
    "Email Address": "ahmad@example.com",
    "Budget (SAR)": "1500000",
    "City/District": "Riyadh / Al-Malqa",
    "Type Wanted": "villa",
    "Beds Needed": 4,
    "Extra Notes": "Looking for something modern with a small garden."
  },
  {
    "Client Name": "Sarah Jones",
    "Phone Number": "+971501234567",
    "Email Address": "sarah.j@example.com",
    "Budget (SAR)": "800000",
    "City/District": "Dubai / Downtown",
    "Type Wanted": "apartment",
    "Beds Needed": 2,
    "Extra Notes": "Must be close to metro station."
  },
  {
    "Client Name": "Khalid Youssef",
    "Phone Number": "+966509998888",
    "Email Address": "khalid.y@example.com",
    "Budget (SAR)": "2500000",
    "City/District": "Jeddah / Al-Shati",
    "Type Wanted": "villa",
    "Beds Needed": 5,
    "Extra Notes": "Sea view preferred, willing to increase budget if perfect."
  }
];

// 2. Properties
const properties = [
  {
    "Property ID": "PROP-0001",
    "Property Name": "Modern Villa in Al-Malqa",
    "Property Type": "villa",
    "District": "Riyadh / Al-Malqa",
    "Asking Price": 1450000,
    "Beds": 4,
    "Baths": 5,
    "Area SQM": 350,
    "Notes": "Brand new villa with a landscaped garden and smart home features.",
    "Status": "Available"
  },
  {
    "Property ID": "PROP-0002",
    "Property Name": "Luxury Downtown Apartment",
    "Property Type": "apartment",
    "District": "Dubai / Downtown",
    "Asking Price": 850000,
    "Beds": 2,
    "Baths": 3,
    "Area SQM": 120,
    "Notes": "High-floor apartment with Burj Khalifa view. 2 mins from metro.",
    "Status": "Available"
  },
  {
    "Property ID": "PROP-0003",
    "Property Name": "Al-Shati Seafront Villa",
    "Property Type": "villa",
    "District": "Jeddah / Al-Shati",
    "Asking Price": 2800000,
    "Beds": 5,
    "Baths": 6,
    "Area SQM": 500,
    "Notes": "Premium beachfront property with private pool and elevator.",
    "Status": "Available"
  },
  {
    "Property ID": "PROP-0004",
    "Property Name": "Cozy Apartment in Al-Malqa",
    "Property Type": "apartment",
    "District": "Riyadh / Al-Malqa",
    "Asking Price": 600000,
    "Beds": 3,
    "Baths": 2,
    "Area SQM": 150,
    "Notes": "Great investment opportunity or starter home.",
    "Status": "Available"
  }
];

// Create workbook
const wb = XLSX.utils.book_new();

// Add Leads Sheet
const wsLeads = XLSX.utils.json_to_sheet(leads);
XLSX.utils.book_append_sheet(wb, wsLeads, "Leads");

// Add Properties Sheet
const wsProperties = XLSX.utils.json_to_sheet(properties);
XLSX.utils.book_append_sheet(wb, wsProperties, "Property Library");

// Write to file
XLSX.writeFile(wb, "mock_leads_and_properties.xlsx");

console.log("mock_leads_and_properties.xlsx generated successfully.");
