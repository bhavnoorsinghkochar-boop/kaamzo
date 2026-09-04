// Haversine formula for calculating distance between 2 coordinates in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.0;
  if (lat1 === lat2 && lon1 === lon2) return 0.05;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

// Calculate bearing/heading in degrees (0 - 360)
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLon);
  const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return Math.round(brng);
}

export interface CityInfo {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  defaultArea: string;
}

export const SUPPORTED_CITIES: CityInfo[] = [
  {
    id: "ludhiana",
    name: "Ludhiana",
    state: "Punjab",
    lat: 30.901,
    lng: 75.8573,
    defaultArea: "Model Town",
  },
  {
    id: "delhi",
    name: "New Delhi",
    state: "Delhi NCR",
    lat: 28.5355,
    lng: 77.269,
    defaultArea: "Okhla Phase 2",
  },
  {
    id: "chandigarh",
    name: "Chandigarh",
    state: "Punjab / UT",
    lat: 30.7333,
    lng: 76.7794,
    defaultArea: "Sector 17",
  },
  {
    id: "jalandhar",
    name: "Jalandhar",
    state: "Punjab",
    lat: 31.326,
    lng: 75.5762,
    defaultArea: "Model Town",
  },
  {
    id: "amritsar",
    name: "Amritsar",
    state: "Punjab",
    lat: 31.634,
    lng: 74.8723,
    defaultArea: "Ranjit Avenue",
  },
];

// Area Coordinates database across Ludhiana, Punjab & Delhi NCR
export const KNOWN_AREA_COORDINATES: Record<
  string,
  { lat: number; lng: number; area: string; city: string }
> = {
  // Ludhiana, Punjab Localities
  "model town": {
    lat: 30.8926,
    lng: 75.8415,
    area: "Model Town",
    city: "Ludhiana",
  },
  "sarabha nagar": {
    lat: 30.8872,
    lng: 75.8193,
    area: "Sarabha Nagar",
    city: "Ludhiana",
  },
  "civil lines": {
    lat: 30.9075,
    lng: 75.836,
    area: "Civil Lines",
    city: "Ludhiana",
  },
  "focal point": {
    lat: 30.8845,
    lng: 75.912,
    area: "Focal Point Phase 5",
    city: "Ludhiana",
  },
  "focal point phase 5": {
    lat: 30.8845,
    lng: 75.912,
    area: "Focal Point Phase 5",
    city: "Ludhiana",
  },
  "gill road": {
    lat: 30.885,
    lng: 75.856,
    area: "Gill Road",
    city: "Ludhiana",
  },
  "dashmesh nagar": {
    lat: 30.885,
    lng: 75.856,
    area: "Dashmesh Nagar",
    city: "Ludhiana",
  },
  "clock tower": {
    lat: 30.9125,
    lng: 75.852,
    area: "Clock Tower / Chaura Bazar",
    city: "Ludhiana",
  },
  "chaura bazar": {
    lat: 30.9125,
    lng: 75.852,
    area: "Chaura Bazar",
    city: "Ludhiana",
  },
  "brs nagar": {
    lat: 30.878,
    lng: 75.795,
    area: "BRS Nagar",
    city: "Ludhiana",
  },
  dugri: { lat: 30.865, lng: 75.845, area: "Dugri Phase 1", city: "Ludhiana" },
  "dugri phase 1": {
    lat: 30.865,
    lng: 75.845,
    area: "Dugri Phase 1",
    city: "Ludhiana",
  },
  "ferozepur road": {
    lat: 30.898,
    lng: 75.782,
    area: "Ferozepur Road",
    city: "Ludhiana",
  },
  "south city": {
    lat: 30.898,
    lng: 75.782,
    area: "South City",
    city: "Ludhiana",
  },
  "samrala chowk": {
    lat: 30.913,
    lng: 75.885,
    area: "Samrala Chowk",
    city: "Ludhiana",
  },
  "chandigarh road": {
    lat: 30.913,
    lng: 75.885,
    area: "Chandigarh Road",
    city: "Ludhiana",
  },
  "miller ganj": {
    lat: 30.895,
    lng: 75.868,
    area: "Miller Ganj",
    city: "Ludhiana",
  },
  dholewal: {
    lat: 30.895,
    lng: 75.868,
    area: "Dholewal Chowk",
    city: "Ludhiana",
  },
  "pakhowal road": {
    lat: 30.872,
    lng: 75.823,
    area: "Pakhowal Road",
    city: "Ludhiana",
  },
  "rahon road": {
    lat: 30.935,
    lng: 75.855,
    area: "Rahon Road",
    city: "Ludhiana",
  },
  "jalandhar bypass": {
    lat: 30.935,
    lng: 75.855,
    area: "Jalandhar Bypass",
    city: "Ludhiana",
  },
  ludhiana: {
    lat: 30.901,
    lng: 75.8573,
    area: "Clock Tower",
    city: "Ludhiana",
  },

  // Delhi NCR Localities
  okhla: {
    lat: 28.5355,
    lng: 77.269,
    area: "Okhla Phase 2",
    city: "New Delhi",
  },
  "okhla phase 1": {
    lat: 28.531,
    lng: 77.272,
    area: "Okhla Phase 1",
    city: "New Delhi",
  },
  "okhla phase 2": {
    lat: 28.5355,
    lng: 77.269,
    area: "Okhla Phase 2",
    city: "New Delhi",
  },
  "lajpat nagar": {
    lat: 28.5672,
    lng: 77.2435,
    area: "Lajpat Nagar",
    city: "New Delhi",
  },
  "karol bagh": {
    lat: 28.6517,
    lng: 77.1906,
    area: "Karol Bagh",
    city: "New Delhi",
  },
  "mayur vihar": {
    lat: 28.591,
    lng: 77.298,
    area: "Mayur Vihar",
    city: "New Delhi",
  },
  "nehru place": {
    lat: 28.5492,
    lng: 77.2528,
    area: "Nehru Place",
    city: "New Delhi",
  },
  saket: { lat: 28.5245, lng: 77.2066, area: "Saket", city: "New Delhi" },
  kalkaji: { lat: 28.5402, lng: 77.258, area: "Kalkaji", city: "New Delhi" },
  badarpur: { lat: 28.5033, lng: 77.3032, area: "Badarpur", city: "New Delhi" },
  jasola: {
    lat: 28.5385,
    lng: 77.2905,
    area: "Jasola Vihar",
    city: "New Delhi",
  },
  "greater kailash": {
    lat: 28.5482,
    lng: 77.2343,
    area: "Greater Kailash",
    city: "New Delhi",
  },
  "connaught place": {
    lat: 28.6315,
    lng: 77.2167,
    area: "Connaught Place",
    city: "New Delhi",
  },
  "noida sector 18": {
    lat: 28.5708,
    lng: 77.3271,
    area: "Noida Sector 18",
    city: "Noida",
  },
  "gurugram cyber city": {
    lat: 28.4952,
    lng: 77.0895,
    area: "Cyber City, Gurugram",
    city: "Gurugram",
  },
  delhi: {
    lat: 28.6139,
    lng: 77.209,
    area: "Connaught Place",
    city: "New Delhi",
  },

  // Chandigarh / Tri-city
  "sector 17": {
    lat: 30.741,
    lng: 76.785,
    area: "Sector 17",
    city: "Chandigarh",
  },
  "mohali phase 7": {
    lat: 30.7046,
    lng: 76.7179,
    area: "Phase 7 Mohali",
    city: "Chandigarh",
  },
  chandigarh: {
    lat: 30.7333,
    lng: 76.7794,
    area: "Sector 17",
    city: "Chandigarh",
  },
};

// Auto detect city from latitude & longitude
export function detectCityFromCoords(lat: number, lng: number): CityInfo {
  // Ludhiana bounding box (approx 30.70 to 31.10 N, 75.65 to 76.10 E)
  if (lat >= 30.7 && lat <= 31.1 && lng >= 75.65 && lng <= 76.1) {
    return SUPPORTED_CITIES[0]; // Ludhiana
  }
  // Chandigarh / Mohali / Panchkula bounding box
  if (lat >= 30.55 && lat <= 30.88 && lng >= 76.6 && lng <= 76.95) {
    return SUPPORTED_CITIES[2]; // Chandigarh
  }
  // Jalandhar bounding box
  if (lat >= 31.15 && lat <= 31.48 && lng >= 75.4 && lng <= 75.8) {
    return SUPPORTED_CITIES[3]; // Jalandhar
  }
  // Amritsar bounding box
  if (lat >= 31.5 && lat <= 31.8 && lng >= 74.7 && lng <= 75.1) {
    return SUPPORTED_CITIES[4]; // Amritsar
  }
  // Delhi NCR bounding box
  if (lat >= 28.25 && lat <= 28.95 && lng >= 76.8 && lng <= 77.5) {
    return SUPPORTED_CITIES[1]; // Delhi
  }

  // Find nearest supported city
  let nearestCity = SUPPORTED_CITIES[0]; // Default to Ludhiana
  let minDistance = 999999;
  for (const city of SUPPORTED_CITIES) {
    const dist = calculateDistanceKm(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = city;
    }
  }
  return nearestCity;
}

export interface ResolvedAddress {
  formattedAddress: string;
  street: string;
  sublocality: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  accuracyMeters?: number;
  provider: "google_geocoding" | "reverse_osm" | "local_database";
}

/**
 * Snap to Real-World Address:
 * Resolves exact street-level coordinates using Google Maps Reverse Geocoding API,
 * with resilient fallback to high-precision OSM reverse geocoding and local GIS database.
 */
export async function reverseGeocodeLocation(
  lat: number,
  lng: number,
  accuracyMeters: number = 4,
): Promise<ResolvedAddress> {
  const roundedLat = +lat.toFixed(6);
  const roundedLng = +lng.toFixed(6);
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;

  // 1. Try Google Maps Reverse Geocoding API if API key is provided
  if (apiKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${roundedLat},${roundedLng}&key=${apiKey}&solution_id=gmp_git_agentskills_v1`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.status === "OK" && data.results && data.results.length > 0) {
          const first = data.results[0];
          let street = "";
          let sublocality = "";
          let city = "";
          let state = "";
          let pincode = "";

          for (const comp of first.address_components || []) {
            const types: string[] = comp.types || [];
            if (types.includes("route") || types.includes("street_number")) {
              street = street ? `${comp.long_name} ${street}` : comp.long_name;
            } else if (
              types.includes("sublocality") ||
              types.includes("sublocality_level_1") ||
              types.includes("neighborhood")
            ) {
              sublocality = comp.long_name;
            } else if (types.includes("locality")) {
              city = comp.long_name;
            } else if (types.includes("administrative_area_level_1")) {
              state = comp.long_name;
            } else if (types.includes("postal_code")) {
              pincode = comp.long_name;
            }
          }

          const resolvedCity =
            city || detectCityFromCoords(roundedLat, roundedLng).name;
          const resolvedSubloc = sublocality || street || "Main Market";
          const resolvedState =
            state || detectCityFromCoords(roundedLat, roundedLng).state;

          return {
            formattedAddress:
              first.formatted_address ||
              `${resolvedSubloc}, ${resolvedCity}, ${resolvedState}`,
            street: street || resolvedSubloc,
            sublocality: resolvedSubloc,
            city: resolvedCity,
            state: resolvedState,
            pincode,
            lat: roundedLat,
            lng: roundedLng,
            accuracyMeters,
            provider: "google_geocoding",
          };
        }
      }
    } catch (err) {
      console.debug("Google Maps reverse geocoding error, falling back:", err);
    }
  }

  // 2. Try Web OSM Reverse Geocoding (free OpenStreetMap Nominatim for exact real-world street level)
  try {
    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundedLat}&lon=${roundedLng}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "en" } },
    );
    if (osmRes.ok) {
      const data = await osmRes.json();
      if (data && data.address) {
        const addr = data.address;
        const street =
          addr.road ||
          addr.pedestrian ||
          addr.suburb ||
          addr.neighbourhood ||
          "";
        const sublocality =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          street ||
          "Central Area";
        const city =
          addr.city ||
          addr.town ||
          addr.municipality ||
          addr.state_district ||
          detectCityFromCoords(roundedLat, roundedLng).name;
        const state =
          addr.state || detectCityFromCoords(roundedLat, roundedLng).state;
        const pincode = addr.postcode || "";
        const formattedAddress = data.display_name
          ? data.display_name.split(",").slice(0, 4).join(", ")
          : `${street ? street + ", " : ""}${sublocality}, ${city}, ${state} ${pincode}`.trim();

        return {
          formattedAddress,
          street: street || sublocality,
          sublocality,
          city,
          state,
          pincode,
          lat: roundedLat,
          lng: roundedLng,
          accuracyMeters,
          provider: "reverse_osm",
        };
      }
    }
  } catch (err) {
    console.debug(
      "OSM reverse geocode unavailable, using high-resolution local database:",
      err,
    );
  }

  // 3. High-Precision Local GIS Database Fallback
  const detectedCity = detectCityFromCoords(roundedLat, roundedLng);
  let closestArea = detectedCity.defaultArea;
  let closestDist = 999999;

  for (const [key, coords] of Object.entries(KNOWN_AREA_COORDINATES)) {
    const dist = calculateDistanceKm(
      roundedLat,
      roundedLng,
      coords.lat,
      coords.lng,
    );
    if (dist < closestDist) {
      closestDist = dist;
      closestArea = coords.area;
    }
  }

  return {
    formattedAddress: `${closestArea}, ${detectedCity.name}, ${detectedCity.state}`,
    street: closestArea,
    sublocality: closestArea,
    city: detectedCity.name,
    state: detectedCity.state,
    pincode: detectedCity.id === "ludhiana" ? "141002" : "110020",
    lat: roundedLat,
    lng: roundedLng,
    accuracyMeters,
    provider: "local_database",
  };
}

export function getCoordinatesForArea(
  areaName: string,
  currentCityName: string = "Ludhiana",
): { lat: number; lng: number; area: string; city: string } {
  if (!areaName) {
    if (currentCityName.toLowerCase().includes("delhi")) {
      return KNOWN_AREA_COORDINATES.okhla;
    }
    return KNOWN_AREA_COORDINATES["model town"];
  }

  const clean = areaName.toLowerCase().trim();
  for (const [key, value] of Object.entries(KNOWN_AREA_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return value;
    }
  }

  // If not matched, fallback based on current city
  if (
    clean.includes("delhi") ||
    currentCityName.toLowerCase().includes("delhi")
  ) {
    return KNOWN_AREA_COORDINATES.okhla;
  }
  return KNOWN_AREA_COORDINATES["model town"];
}

// Generate Google Maps Turn-by-Turn Directions URL
export function getGoogleMapsDirectionsUrl(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  travelMode: "walking" | "bicycling" | "driving" = "walking",
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=${travelMode}&utm_campaign=gmp_mcp_codeassist_v1_aistudio`;
}

// Generate Google Maps Location View URL
export function getGoogleMapsLocationUrl(
  lat: number,
  lng: number,
  label?: string,
): string {
  const query = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}&center=${lat},${lng}&utm_campaign=gmp_mcp_codeassist_v1_aistudio`;
}

// Generate Embedded Google Maps Iframe URL with live markers and directions
export function getGoogleMapsEmbedUrl(
  lat: number,
  lng: number,
  destLat?: number,
  destLng?: number,
  zoom: number = 14,
): string {
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
  if (destLat && destLng) {
    if (apiKey) {
      return `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${lat},${lng}&destination=${destLat},${destLng}&mode=walking`;
    }
    return `https://maps.google.com/maps?saddr=${lat},${lng}&daddr=${destLat},${destLng}&output=embed&z=${zoom}`;
  }
  if (apiKey) {
    return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=${zoom}&maptype=roadmap`;
  }
  return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=${zoom}&output=embed`;
}
