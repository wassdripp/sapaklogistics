// Global Cities & Logistics Hubs Database with Latitude / Longitude
const WORLD_CITIES = [
  { name: "Chicago, USA", lat: 41.8781, lng: -87.6298, country: "United States" },
  { name: "London, UK", lat: 51.5074, lng: -0.1278, country: "United Kingdom" },
  { name: "New York, USA", lat: 40.7128, lng: -74.0060, country: "United States" },
  { name: "Los Angeles, USA", lat: 34.0522, lng: -118.2437, country: "United States" },
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, country: "Japan" },
  { name: "Paris, France", lat: 48.8566, lng: 2.3522, country: "France" },
  { name: "Berlin, Germany", lat: 52.5200, lng: 13.4050, country: "Germany" },
  { name: "Frankfurt, Germany", lat: 50.1109, lng: 8.6821, country: "Germany" },
  { name: "Amsterdam, Netherlands", lat: 52.3676, lng: 4.9041, country: "Netherlands" },
  { name: "Rotterdam, Netherlands", lat: 51.9244, lng: 4.4777, country: "Netherlands" },
  { name: "Shanghai, China", lat: 31.2304, lng: 121.4737, country: "China" },
  { name: "Shenzhen, China", lat: 22.5431, lng: 114.0579, country: "China" },
  { name: "Hong Kong", lat: 22.3193, lng: 114.1694, country: "Hong Kong" },
  { name: "Singapore", lat: 1.3521, lng: 103.8198, country: "Singapore" },
  { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093, country: "Australia" },
  { name: "Melbourne, Australia", lat: -37.8136, lng: 144.9631, country: "Australia" },
  { name: "Toronto, Canada", lat: 43.6532, lng: -79.3832, country: "Canada" },
  { name: "Vancouver, Canada", lat: 49.2827, lng: -123.1207, country: "Canada" },
  { name: "Dubai, UAE", lat: 25.2048, lng: 55.2708, country: "UAE" },
  { name: "Seoul, South Korea", lat: 37.5665, lng: 126.9780, country: "South Korea" },
  { name: "Mumbai, India", lat: 19.0760, lng: 72.8777, country: "India" },
  { name: "Bangalore, India", lat: 12.9716, lng: 77.5946, country: "India" },
  { name: "São Paulo, Brazil", lat: -23.5505, lng: -46.6333, country: "Brazil" },
  { name: "Mexico City, Mexico", lat: 19.4326, lng: -99.1332, country: "Mexico" },
  { name: "Johannesburg, South Africa", lat: -26.2041, lng: 28.0473, country: "South Africa" },
  { name: "Cairo, Egypt", lat: 30.0444, lng: 31.2357, country: "Egypt" },
  { name: "Madrid, Spain", lat: 40.4168, lng: -3.7038, country: "Spain" },
  { name: "Rome, Italy", lat: 41.9028, lng: 12.4964, country: "Italy" },
  { name: "Stockholm, Sweden", lat: 59.3293, lng: 18.0686, country: "Sweden" },
  { name: "San Francisco, USA", lat: 37.7749, lng: -122.4194, country: "United States" },
  { name: "Miami, USA", lat: 25.7617, lng: -80.1918, country: "United States" },
  { name: "Seattle, USA", lat: 47.6062, lng: -122.3321, country: "United States" },
  { name: "Houston, USA", lat: 29.7604, lng: -95.3698, country: "United States" },
  { name: "Dublin, Ireland", lat: 53.3498, lng: -6.2603, country: "Ireland" },
  { name: "Zurich, Switzerland", lat: 47.3769, lng: 8.5417, country: "Switzerland" }
];

function getCityCoords(cityName) {
  if (!cityName) return { lat: 20, lng: 0 };
  const clean = cityName.toLowerCase().trim();
  const match = WORLD_CITIES.find(c => 
    c.name.toLowerCase() === clean || 
    c.name.toLowerCase().startsWith(clean) ||
    clean.includes(c.name.split(',')[0].toLowerCase())
  );
  if (match) return { lat: match.lat, lng: match.lng };
  
  // Deterministic fallback based on string hash for custom cities
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lat = ((Math.abs(hash) % 80) - 20); // -20 to 60
  const lng = ((Math.abs(hash >> 3) % 300) - 150); // -150 to 150
  return { lat, lng };
}

function populateCitySelects() {
  const originSelect = document.getElementById('select-origin-city');
  const destSelect = document.getElementById('select-dest-city');
  if (!originSelect || !destSelect) return;

  const options = WORLD_CITIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  
  originSelect.innerHTML = options;
  destSelect.innerHTML = options;

  // Set default pair
  originSelect.value = "Chicago, USA";
  destSelect.value = "London, UK";
}
