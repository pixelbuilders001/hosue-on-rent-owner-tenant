/**
 * Distance Calculation Service
 * Computes distances from property location (pincode, area, or coordinates)
 * to primary transit hubs: Samastipur Junction Railway Station and Govt Bus Stand.
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface TransitDistances {
  stationDistanceKm: number;
  busStandDistanceKm: number;
  primaryDistanceKm: number;
  commuteMinutes: number;
  source: 'coords' | 'pincode' | 'area' | 'default';
}

// Major Reference Anchors in Samastipur, Bihar
export const SAMASTIPUR_ANCHORS = {
  RAILWAY_STATION: {
    name: 'Samastipur Junction Railway Station',
    latitude: 25.8631,
    longitude: 85.7812
  },
  BUS_STAND: {
    name: 'Samastipur Govt Bus Stand',
    latitude: 25.8590,
    longitude: 85.7870
  },
  ABC_COLLEGE: {
    name: 'College Road / ABC College',
    latitude: 25.8570,
    longitude: 85.7760
  }
};

// Known Samastipur PIN Code Coordinates
export const PINCODE_COORDINATES: Record<string, LocationCoordinates> = {
  '848101': { latitude: 25.8631, longitude: 85.7812 }, // Station Road / Gudri / Mohanpur
  '848102': { latitude: 25.8560, longitude: 85.7740 }, // Magadh Colony / Kashipur / College Rd
  '848134': { latitude: 25.8820, longitude: 85.7980 }, // Muktapur / Sugar Mill Area
  '848114': { latitude: 25.6660, longitude: 85.8340 }, // Dalsinghsarai
  '848130': { latitude: 25.7500, longitude: 85.7800 }, // Ujiarpur
  '848125': { latitude: 25.9800, longitude: 85.6700 }, // Pusa
  '848208': { latitude: 25.7500, longitude: 86.0200 }, // Rosera
};

// Area-based Fallback Coordinates
export const AREA_COORDINATES: Record<string, LocationCoordinates> = {
  'Station Road': { latitude: 25.8635, longitude: 85.7820 },
  'Magadh Colony': { latitude: 25.8550, longitude: 85.7730 },
  'Kashipur': { latitude: 25.8580, longitude: 85.7770 },
  'Mohanpur': { latitude: 25.8670, longitude: 85.7850 },
  'Tajpur Road': { latitude: 25.8600, longitude: 85.7650 },
  'Hospital Road': { latitude: 25.8610, longitude: 85.7840 },
  'Gudri Bazaar': { latitude: 25.8620, longitude: 85.7830 },
  'Musrigharari': { latitude: 25.8050, longitude: 85.7350 },
};

/**
 * Calculates straight-line distance in kilometers using the Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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
  const distance = R * c;
  // Apply a 1.25 road-network routing factor for realistic Indian city commute
  return Number((distance * 1.25).toFixed(1));
}

/**
 * Calculates distance from Railway Station & Bus Stand based on input parameters
 */
export function calculateTransitDistances(params: {
  latitude?: number;
  longitude?: number;
  pincode?: string;
  area?: string;
}): TransitDistances {
  let coords: LocationCoordinates | null = null;
  let source: TransitDistances['source'] = 'default';

  if (params.latitude && params.longitude && params.latitude !== 0 && params.longitude !== 0) {
    coords = { latitude: params.latitude, longitude: params.longitude };
    source = 'coords';
  } else if (params.pincode && PINCODE_COORDINATES[params.pincode.trim()]) {
    coords = PINCODE_COORDINATES[params.pincode.trim()];
    source = 'pincode';
  } else if (params.area && AREA_COORDINATES[params.area.trim()]) {
    coords = AREA_COORDINATES[params.area.trim()];
    source = 'area';
  } else {
    // Default to central Samastipur
    coords = { latitude: 25.8600, longitude: 85.7800 };
    source = 'default';
  }

  const stationDist = calculateHaversineDistance(
    coords.latitude,
    coords.longitude,
    SAMASTIPUR_ANCHORS.RAILWAY_STATION.latitude,
    SAMASTIPUR_ANCHORS.RAILWAY_STATION.longitude
  );

  const busStandDist = calculateHaversineDistance(
    coords.latitude,
    coords.longitude,
    SAMASTIPUR_ANCHORS.BUS_STAND.latitude,
    SAMASTIPUR_ANCHORS.BUS_STAND.longitude
  );

  // Primary transit distance is the minimum of station or bus stand, with a minimum of 0.3 km
  const primaryDist = Math.max(0.3, Math.min(stationDist, busStandDist));
  // Average e-rickshaw / auto commute speed in town: ~15 km/h => 4 mins per km + 2 min buffer
  const commuteMins = Math.max(3, Math.round(primaryDist * 4.5 + 2));

  return {
    stationDistanceKm: Math.max(0.3, stationDist),
    busStandDistanceKm: Math.max(0.3, busStandDist),
    primaryDistanceKm: primaryDist,
    commuteMinutes: commuteMins,
    source
  };
}

/**
 * Attempts browser geolocation to get live device coordinates
 */
export async function getLiveDeviceCoordinates(): Promise<LocationCoordinates | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: Number(pos.coords.latitude.toFixed(5)),
          longitude: Number(pos.coords.longitude.toFixed(5))
        });
      },
      () => {
        resolve(null);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  });
}
