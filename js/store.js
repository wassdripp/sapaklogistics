// Trackk â€” LocalStorage Data Layer & Sample Data

const STORAGE_KEY = 'sapak_shipments_v3';
const FIREBASE_CONFIG_KEY = 'sapak_firebase_url';
let DEFAULT_FIREBASE_URL = 'https://sapak-logistics-default-rtdb.firebaseio.com';

const INITIAL_SAMPLE_SHIPMENTS = [
  {
    id: "SPK-482189",
    recipient: "Jane Doe",
    origin: "Chicago, USA",
    destination: "London, UK",
    carrier: "FedEx",
    status: "In Transit",
    progress: 60,
    estDelivery: "2026-10-04",
    dispatchDate: "2026-09-25",
    packageType: "Precision Optical Sensors",
    weight: "2.8 kg",
    notes: "Temperature controlled cargo. Hand delivery to 4th floor reception.",
    currentLocation: "North Atlantic Air Corridor",
    timeline: [
      {
        title: "Order Manifest Received",
        location: "Chicago, USA",
        date: "Sep 25, 08:30 AM",
        note: "Shipping label printed and electronic customs document filed.",
        statusKey: "Pending"
      },
      {
        title: "Picked Up by Carrier",
        location: "O'Hare Hub, Chicago",
        date: "Sep 25, 02:45 PM",
        note: "Parcel scanned at sorting facility dock 4.",
        statusKey: "Pending"
      },
      {
        title: "In Transit â€” Airborne",
        location: "International Air Freight",
        date: "Sep 26, 11:15 AM",
        note: "Departed Chicago ORD en route to London Heathrow LHR.",
        statusKey: "In Transit"
      },
      {
        title: "Out for Delivery",
        location: "London West Hub, UK",
        date: "Pending arrival",
        note: "Awaiting local courier dispatch vehicle assignment.",
        statusKey: "Out for Delivery"
      },
      {
        title: "Delivered",
        location: "London, UK",
        date: "Pending",
        note: "Recipient signature required.",
        statusKey: "Delivered"
      }
    ]
  },
  {
    id: "SPK-901420",
    recipient: "Marcus Vance",
    origin: "Tokyo, Japan",
    destination: "San Francisco, USA",
    carrier: "DHL Express",
    status: "Delivered",
    progress: 100,
    estDelivery: "2026-09-27",
    dispatchDate: "2026-09-22",
    packageType: "Architectural Models",
    weight: "5.1 kg",
    notes: "Fragile packaging. Direct handover confirmed.",
    currentLocation: "San Francisco, USA",
    timeline: [
      {
        title: "Order Placed & Packed",
        location: "Tokyo Studio, Japan",
        date: "Sep 22, 10:00 AM",
        note: "Export inspection completed.",
        statusKey: "Pending"
      },
      {
        title: "Export Customs Cleared",
        location: "Narita Logistics Center, Tokyo",
        date: "Sep 23, 01:20 PM",
        note: "Cargo loaded onto trans-pacific freighter.",
        statusKey: "In Transit"
      },
      {
        title: "Arrived at US Gateway",
        location: "SFO Airport Freight Center",
        date: "Sep 25, 06:10 AM",
        note: "US Customs and Border Protection cleared.",
        statusKey: "In Transit"
      },
      {
        title: "Out for Delivery",
        location: "San Francisco City Depot",
        date: "Sep 27, 08:30 AM",
        note: "Courier en route with package.",
        statusKey: "Out for Delivery"
      },
      {
        title: "Delivered & Signed",
        location: "San Francisco, USA",
        date: "Sep 27, 02:14 PM",
        note: "Signed by M. Vance at front door.",
        statusKey: "Delivered"
      }
    ]
  },
  {
    id: "SPK-210491",
    recipient: "Elena Rostova",
    origin: "Berlin, Germany",
    destination: "New York, USA",
    carrier: "UPS",
    status: "Out for Delivery",
    progress: 88,
    estDelivery: "2026-09-28",
    dispatchDate: "2026-09-24",
    packageType: "Medical Research Samples",
    weight: "1.4 kg",
    notes: "Requires cold pack maintenance.",
    currentLocation: "Manhattan Distribution Depot, NY",
    timeline: [
      {
        title: "Label Created",
        location: "Berlin, Germany",
        date: "Sep 24, 09:00 AM",
        note: "Shipper prepared container.",
        statusKey: "Pending"
      },
      {
        title: "International Flight Departed",
        location: "Frankfurt Hub, Germany",
        date: "Sep 25, 04:30 PM",
        note: "UPS Air flight 482 to JFK.",
        statusKey: "In Transit"
      },
      {
        title: "Out for Final Delivery",
        location: "New York, NY",
        date: "Sep 28, 07:45 AM",
        note: "Loaded onto local electric delivery van.",
        statusKey: "Out for Delivery"
      }
    ]
  },
  {
    id: "SPK-673190",
    recipient: "Lucas Bennett",
    origin: "Singapore",
    destination: "Sydney, Australia",
    carrier: "Maersk Line",
    status: "In Transit",
    progress: 45,
    estDelivery: "2026-10-09",
    dispatchDate: "2026-09-26",
    packageType: "Renewable Energy Cells",
    weight: "48.0 kg",
    notes: "Palletized freight consignment.",
    currentLocation: "Java Sea Maritime Corridor",
    timeline: [
      {
        title: "Port Clearance Completed",
        location: "Port of Singapore",
        date: "Sep 26, 11:00 AM",
        note: "Container locked and sealed.",
        statusKey: "Pending"
      },
      {
        title: "Vessel Underway",
        location: "Singapore Strait",
        date: "Sep 27, 03:00 AM",
        note: "Vessel Maersk Mc-Kinney on direct route.",
        statusKey: "In Transit"
      }
    ]
  },
  {
    id: "SPK-109482",
    recipient: "Sofia Morales",
    origin: "Toronto, Canada",
    destination: "Paris, France",
    carrier: "Royal Mail",
    status: "Pending",
    progress: 10,
    estDelivery: "2026-10-06",
    dispatchDate: "2026-09-28",
    packageType: "Artisan Leather Crafts",
    weight: "0.9 kg",
    notes: "Gift packaging included.",
    currentLocation: "Toronto Logistics Hub",
    timeline: [
      {
        title: "Shipping Label Generated",
        location: "Toronto, Canada",
        date: "Sep 28, 08:15 AM",
        note: "Awaiting package drop-off at collection depot.",
        statusKey: "Pending"
      }
    ]
  },
  {
    id: "SPK-554190",
    recipient: "Klaus Weber",
    origin: "Shanghai, China",
    destination: "Rotterdam, Netherlands",
    carrier: "DHL Express",
    status: "Delayed",
    progress: 52,
    estDelivery: "2026-10-12",
    dispatchDate: "2026-09-20",
    packageType: "Industrial Valves & Sealants",
    weight: "16.2 kg",
    notes: "Customs declaration requires supplemental verification.",
    currentLocation: "Dubai Hub Facility",
    timeline: [
      {
        title: "Dispatched from Port",
        location: "Shanghai, China",
        date: "Sep 20, 09:30 AM",
        note: "Export clearance passed.",
        statusKey: "Pending"
      },
      {
        title: "Transit Stop Scanned",
        location: "Dubai Hub, UAE",
        date: "Sep 24, 02:10 PM",
        note: "Customs review hold placed on manifest.",
        statusKey: "Delayed"
      }
    ]
  }
];

class ShipmentStore {
  constructor() {
    this.storageKey = STORAGE_KEY;
    this.listeners = [];
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      this.saveAll(INITIAL_SAMPLE_SHIPMENTS);
    }
    this.syncFromCloud();
  }

  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading shipments from storage:", e);
      return INITIAL_SAMPLE_SHIPMENTS;
    }
  }

  getById(id) {
    const list = this.getAll();
    return list.find(s => s.id.toLowerCase() === id.toLowerCase()) || null;
  }

  saveAll(shipments) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(shipments));
      this.notifyListeners();
    } catch (e) {
      console.error("Error saving shipments:", e);
    }
  }

  create(shipmentData) {
    const list = this.getAll();
    
    // Auto-generate status progress percentage if not supplied
    let progress = 10;
    if (shipmentData.status === 'In Transit') progress = 50;
    if (shipmentData.status === 'Out for Delivery') progress = 85;
    if (shipmentData.status === 'Delivered') progress = 100;
    if (shipmentData.status === 'Delayed') progress = 40;

    const newShipment = {
      id: shipmentData.id,
      recipient: shipmentData.recipient,
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      carrier: shipmentData.carrier || 'Link Guard Security',
      status: shipmentData.status || 'Pending',
      progress: progress,
      estDelivery: shipmentData.estDelivery || this.calculateDefaultEstDelivery(),
      dispatchDate: new Date().toISOString().split('T')[0],
      packageType: shipmentData.packageType || 'Standard Parcel',
      weight: shipmentData.weight || '1.5 kg',
      notes: shipmentData.notes || 'Standard handling.',
      currentLocation: shipmentData.origin,
      timeline: [
        {
          title: "Tracking Created",
          location: shipmentData.origin,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          note: "Shipment manifest entered into system.",
          statusKey: shipmentData.status || 'Pending'
        }
      ]
    };

    list.unshift(newShipment);
    this.saveAll(list);
    this.syncToCloud(newShipment);
    return newShipment;
  }

  update(id, partial) {
    const list = this.getAll();
    const index = list.findIndex(s => s.id.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    list[index] = { ...list[index], ...partial };
    
    // Recalculate progress if status changed
    if (partial.status) {
      if (partial.status === 'Pending') list[index].progress = 15;
      else if (partial.status === 'In Transit') list[index].progress = 55;
      else if (partial.status === 'Out for Delivery') list[index].progress = 85;
      else if (partial.status === 'Delivered') list[index].progress = 100;
      else if (partial.status === 'Delayed') list[index].progress = 40;
    }

    this.saveAll(list);
    this.syncToCloud(list[index]);
    return list[index];
  }

  addCheckpoint(id, checkpoint) {
    const list = this.getAll();
    const item = list.find(s => s.id.toLowerCase() === id.toLowerCase());
    if (!item) return null;

    if (!item.timeline) item.timeline = [];
    item.timeline.push(checkpoint);
    if (checkpoint.location) item.currentLocation = checkpoint.location;

    this.saveAll(list);
    this.syncToCloud(item);
    return item;
  }

  delete(id) {
    const list = this.getAll().filter(s => s.id.toLowerCase() !== id.toLowerCase());
    this.saveAll(list);
    this.deleteFromCloud(id);
  }

  importShipment(shipmentData) {
    if (!shipmentData || !shipmentData.id) return null;
    const list = this.getAll();
    const index = list.findIndex(s => s.id.toLowerCase() === shipmentData.id.toLowerCase());
    
    if (index >= 0) {
      list[index] = { ...list[index], ...shipmentData };
    } else {
      list.unshift(shipmentData);
    }
    
    this.saveAll(list);
    return shipmentData;
  }

  getCloudDbUrl() {
    const custom = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (custom && custom.startsWith('http') && custom.includes('firebaseio.com')) {
      return custom.trim().replace(/\/+$/, '');
    }
    return DEFAULT_FIREBASE_URL.replace(/\/+$/, '');
  }

  setCloudDbUrl(url) {
    if (url) {
      localStorage.setItem(FIREBASE_CONFIG_KEY, url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem(FIREBASE_CONFIG_KEY);
    }
    this.syncFromCloud();
  }

  async syncFromCloud() {
    const dbUrl = this.getCloudDbUrl();
    if (!dbUrl) return;

    try {
      const res = await fetch(`${dbUrl}/shipments.json`);
      if (res.ok) {
        const data = await res.json();
        const list = this.getAll();
        let changed = false;

        if (data && typeof data === 'object') {
          Object.values(data).forEach(cloudItem => {
            if (!cloudItem || !cloudItem.id) return;
            const index = list.findIndex(s => s.id.toLowerCase() === cloudItem.id.toLowerCase());
            if (index >= 0) {
              list[index] = { ...list[index], ...cloudItem };
            } else {
              list.unshift(cloudItem);
              changed = true;
            }
          });
        }

        // Push any local custom shipments missing in cloud
        const cloudKeys = data && typeof data === 'object'
          ? Object.keys(data).map(k => k.toLowerCase())
          : [];
        for (const localItem of list) {
          if (localItem && localItem.id && !cloudKeys.includes(localItem.id.toLowerCase())) {
            this.syncToCloud(localItem);
          }
        }

        if (changed) {
          this.saveAll(list);
        }
      }
    } catch (e) {
      console.warn("Cloud sync error:", e);
    }
  }

  async getByIdAsync(id) {
    if (!id) return null;
    const cleanId = id.trim();
    if (!cleanId) return null;

    // 1. Direct local lookup
    const local = this.getById(cleanId);
    if (local) return local;

    const dbUrl = this.getCloudDbUrl();
    if (!dbUrl) return null;

    const cleanUpper = cleanId.toUpperCase();

    // 2. Direct lookup by key in Firebase
    try {
      const res = await fetch(`${dbUrl}/shipments/${encodeURIComponent(cleanUpper)}.json`);
      if (res.ok) {
        const item = await res.json();
        if (item && item.id) {
          return this.importShipment(item);
        }
      }
    } catch (e) {
      console.warn("Direct cloud fetch error:", e);
    }

    // 3. Resilient fallback search across all shipments in Firebase
    try {
      const res = await fetch(`${dbUrl}/shipments.json`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const list = Object.values(data).filter(Boolean);
          const normalizedQuery = cleanId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

          const match = list.find(s => {
            if (!s || !s.id) return false;
            const normId = s.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            return (
              s.id.toLowerCase() === cleanId.toLowerCase() ||
              normId === normalizedQuery ||
              (normalizedQuery.length >= 4 && normId.includes(normalizedQuery)) ||
              (s.recipient && s.recipient.toLowerCase().includes(cleanId.toLowerCase()))
            );
          });

          if (match && match.id) {
            return this.importShipment(match);
          }
        }
      }
    } catch (e) {
      console.warn("Cloud search fallback error:", e);
    }

    return null;
  }

  async syncToCloud(shipment) {
    if (!shipment || !shipment.id) return;
    const dbUrl = this.getCloudDbUrl();
    if (!dbUrl) return;

    try {
      await fetch(`${dbUrl}/shipments/${encodeURIComponent(shipment.id.trim().toUpperCase())}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipment)
      });
    } catch (e) {
      console.warn("Cloud sync error:", e);
    }
  }

  async deleteFromCloud(id) {
    if (!id) return;
    const dbUrl = this.getCloudDbUrl();
    if (!dbUrl) return;

    try {
      await fetch(`${dbUrl}/shipments/${encodeURIComponent(id.trim().toUpperCase())}.json`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn("Cloud delete error:", e);
    }
  }

  resetSampleData() {
    this.saveAll(INITIAL_SAMPLE_SHIPMENTS);
    return INITIAL_SAMPLE_SHIPMENTS;
  }

  calculateDefaultEstDelivery() {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(); } catch(e) { console.error(e); }
    });
  }
}

// Global store instance
const store = new ShipmentStore();

