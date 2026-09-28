// SAPAK Logistics — Interactive Geolocation World Map Module
// Uses Leaflet.js with Google Maps tiles & curved geodesic route paths

class ShipmentMapManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markersGroup = null;
    this.routePolyline = null;
    this.parcelMarker = null;
  }

  initMap() {
    if (this.map) return;

    const container = document.getElementById(this.containerId);
    if (!container) return;

    try {
      // Initialize Leaflet map
      this.map = L.map(this.containerId, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true
      }).setView([25, 0], 2);

      // Google Maps Roadmap tiles
      const googleRoads = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: '0123',
        maxZoom: 20,
        attribution: '&copy; Google Maps'
      });

      // Google Satellite tiles (optional layer)
      const googleSat = L.tileLayer('https://mt{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        subdomains: '0123',
        maxZoom: 20,
        attribution: '&copy; Google Maps'
      });

      // Google Terrain tiles (optional layer)
      const googleTerrain = L.tileLayer('https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
        subdomains: '0123',
        maxZoom: 20,
        attribution: '&copy; Google Maps'
      });

      // Set default layer to Google Roads
      googleRoads.addTo(this.map);

      // Layer switcher control
      L.control.layers({
        'Roadmap': googleRoads,
        'Satellite': googleSat,
        'Terrain': googleTerrain
      }, null, { position: 'topright' }).addTo(this.map);

      this.markersGroup = L.layerGroup().addTo(this.map);

      // Handle window resize smoothly
      window.addEventListener('resize', () => {
        if (this.map) this.map.invalidateSize();
      });

      // Invalidate size once visible
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 150);
    } catch (e) {
      console.warn("Map initialization error:", e);
      this.renderFallbackSvgMap(container);
    }
  }

  renderShipmentRoute(shipment) {
    if (!this.map) {
      this.initMap();
    }

    if (!this.map) return;

    // Invalidate size to ensure rendering within dynamic container
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 100);

    if (this.markersGroup) {
      this.markersGroup.clearLayers();
    }

    const originCoords = getCityCoords(shipment.origin);
    const destCoords = getCityCoords(shipment.destination);

    // 1. Create Origin Pin Marker
    const originIcon = L.divIcon({
      className: 'custom-map-pin origin-pin',
      html: `
        <div class="pin-marker-body" title="${shipment.origin}">
          <span class="pin-marker-inner">A</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });

    L.marker([originCoords.lat, originCoords.lng], { icon: originIcon })
      .bindPopup(`<strong>Origin:</strong> ${shipment.origin}`)
      .addTo(this.markersGroup);

    // 2. Create Destination Pin Marker
    const destIcon = L.divIcon({
      className: 'custom-map-pin dest-pin',
      html: `
        <div class="pin-marker-body" title="${shipment.destination}">
          <span class="pin-marker-inner">B</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });

    L.marker([destCoords.lat, destCoords.lng], { icon: destIcon })
      .bindPopup(`<strong>Destination:</strong> ${shipment.destination}`)
      .addTo(this.markersGroup);

    // 3. Generate curved trajectory coordinates between Origin and Destination
    const routePoints = this.calculateCurvedRoute(
      [originCoords.lat, originCoords.lng],
      [destCoords.lat, destCoords.lng],
      36
    );

    // 4. Render Dotted Terracotta Polyline
    this.routePolyline = L.polyline(routePoints, {
      color: '#D96B4E',
      weight: 3.5,
      dashArray: '6, 8',
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.markersGroup);

    // 5. Position the live Cargo/Parcel marker along the trajectory
    const progressFactor = Math.min(Math.max((shipment.progress || 50) / 100, 0.05), 0.95);
    const parcelPointIndex = Math.floor(progressFactor * (routePoints.length - 1));
    const parcelCoord = routePoints[parcelPointIndex] || routePoints[Math.floor(routePoints.length / 2)];

    const parcelIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div class="moving-parcel-marker" title="Current Location: ${shipment.currentLocation || 'In Transit'}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-5.2a2 2 0 0 0-.6-1.4l-3-3a2 2 0 0 0-1.4-.4H14"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    this.parcelMarker = L.marker(parcelCoord, { icon: parcelIcon })
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
          <strong>${shipment.id}</strong><br/>
          <span>${shipment.status} (${shipment.progress}%)</span><br/>
          <span style="color: #666;">Hub: ${shipment.currentLocation || 'Transit Waypoint'}</span>
        </div>
      `)
      .addTo(this.markersGroup);

    // 6. Smoothly pan and fit bounds
    const bounds = L.latLngBounds([
      [originCoords.lat, originCoords.lng],
      [destCoords.lat, destCoords.lng],
      parcelCoord
    ]);

    this.map.fitBounds(bounds, {
      padding: [50, 60],
      maxZoom: 6,
      animate: true
    });
  }

  // Calculate an aesthetic curved arc between two points
  calculateCurvedRoute(start, end, numPoints = 30) {
    const lat1 = start[0], lng1 = start[1];
    const lat2 = end[0], lng2 = end[1];

    const points = [];
    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;

    // Offset the midpoint perpendicular to create a natural flight arc
    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);

    // Arc curvature altitude
    const arcHeight = Math.min(Math.max(dist * 0.18, 6), 25);
    const ctrlLat = midLat + arcHeight;
    const ctrlLng = midLng;

    // Quadratic Bezier interpolation
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const invT = 1 - t;
      const lat = invT * invT * lat1 + 2 * invT * t * ctrlLat + t * t * lat2;
      const lng = invT * invT * lng1 + 2 * invT * t * ctrlLng + t * t * lng2;
      points.push([lat, lng]);
    }

    return points;
  }

  renderFallbackSvgMap(container) {
    container.innerHTML = `
      <div style="height: 100%; display: grid; place-items: center; background: #EEF0EC; color: #555; text-align: center; padding: 20px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D96B4E" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <p style="margin-top: 8px; font-weight: 600;">Interactive Map Active</p>
        <p style="font-size: 13px; color: #777;">Tracking global shipping coordinates.</p>
      </div>
    `;
  }
}

// Global instance
const mapManager = new ShipmentMapManager('shipment-leaflet-map');
