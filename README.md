# 📦 SAPAK Logistics — Shipment Tracking Web Application

A clean, modern, and interactive shipping tracking web application crafted for **SAPAK Logistics** with a warm, earthy design palette (terracotta accent `#D96B4E`, warm neutral backgrounds, and slate grays) to feel distinct, human, and professional — avoiding generic "AI template" aesthetics.

---

## 🌟 Key Features

### 1. 🗺️ Interactive World Map Geolocation
- Real-time interactive world map powered by Leaflet and CartoDB Positron minimal tiles.
- Curved geodesic trajectory arcs connecting Origin and Destination hubs.
- Custom styled markers:
  - **Origin Hub (A)** in sage green.
  - **Destination Point (B)** in dark slate.
  - **Live Cargo / Parcel Marker** in terracotta with real-time pulse animation, positioned along the route matching the shipment's progress.
- Clickable markers and interactive popups with hub details and progress metrics.

### 2. ➕ Create & Track New Shipments
- Dedicated modal to register new shipments.
- **Auto-generated tracking ID** (e.g. `TRK-849204`) with a quick 🎲 randomize button or custom code entry.
- 35+ major worldwide logistics hubs & cities pre-loaded with accurate global coordinates.
- Configurable carrier (FedEx, DHL Express, UPS, USPS, Maersk, Royal Mail, Japan Post).
- Custom package contents, weight, estimated delivery, and delivery instructions.
- Instant redirect to the live map route view upon creation.

### 3. 📊 Operations Dashboard
- Live metric cards: **In Transit**, **Delivered**, **Pending Dispatch**, and **Delayed**.
- Click any metric card to instantly filter shipments by that status.
- **Recent Checkpoint Activity Feed** showing scanned parcels and milestones.
- **Direct Tracking Lookup**: enter any tracking number to jump directly to its map route.
- **Carrier Distribution chart** showing parcel share per logistics partner.

### 4. 📋 Shipments Manifest (List View)
- Filterable and searchable data table.
- Filter by status pill or carrier partner.
- 1-click tracking number copy with toast feedback.
- Status badges: *Delivered*, *In Transit*, *Pending*, *Out for Delivery*, and *Delayed*.
- Export full shipment records to **CSV**.

### 5. ⏱️ Shipment Detail & Journey Stepper
- Hero banner with routing summary, delivery ETA, and progress bar.
- Technical specs grid: Carrier, Package Category, Weight, Dispatch Date, and Handling Notes.
- **Vertical Milestones Stepper**: verifiable scan history showing completed, active, and upcoming stages.
- **Quick Status Transitions**: 1-click status advances (e.g. *Mark Picked Up*, *Out for Delivery*, *Confirm Delivered*, *Report Delay*).
- Status Update dialog to add custom hub scan notes.

---

## 🚀 How to Run

No build tools, bundlers, or Node servers are required!

1. Open `index.html` directly in your favorite web browser (Chrome, Edge, Firefox, Safari):
   ```powershell
   Start-Process index.html
   ```
2. Or use any local static server:
   ```powershell
   npx serve .
   # or
   python -m http.server 8080
   ```

Data is automatically persisted in your browser's `localStorage` so your shipments and updates stay saved across reloads.
