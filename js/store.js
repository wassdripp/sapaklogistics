// Trackk â€” LocalStorage Data Layer & Sample Data

const STORAGE_KEY = 'sapak_shipments_v3';

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
      carrier: shipmentData.carrier || 'FedEx',
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

  async getByIdAsync(id) {
    if (!id) return null;
    const local = this.getById(id);
    if (local) return local;

    try {
      const res = await fetch('https://api.restful-api.dev/objects');
      if (res.ok) {
        const list = await res.json();
        const match = list.find(item => 
          item && item.data && item.data.id && item.data.id.toLowerCase() === id.toLowerCase() ||
          item && item.name && item.name.toLowerCase() === id.toLowerCase()
        );
        if (match && match.data && match.data.id) {
          return this.importShipment(match.data);
        }
      }
    } catch (e) {
      console.warn("Cloud fetch error:", e);
    }
    return null;
  }

  async syncToCloud(shipment) {
    if (!shipment || !shipment.id) return;
    try {
      await fetch('https://api.restful-api.dev/objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: shipment.id.toUpperCase(),
          data: shipment
        })
      });
    } catch (e) {
      console.warn("Cloud sync error:", e);
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

