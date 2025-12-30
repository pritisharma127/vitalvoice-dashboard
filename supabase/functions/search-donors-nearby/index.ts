import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface Donor {
  id: string;
  name: string;
  phone_number: string;
  blood_type: string;
  zipcode: string;
  area: string | null;
  city: string;
  is_available: boolean;
}

interface DonorWithDistance extends Donor {
  distance_km: number | null;
  distance_text: string | null;
}

// Known Bangalore area pincodes with their approximate coordinates
// Used as fallback when Google Geocoding fails
const BANGALORE_PINCODE_FALLBACKS: Record<string, { lat: number; lng: number }> = {
  '560052': { lat: 12.8451, lng: 77.6604 }, // Electronic City
  '560100': { lat: 12.8407, lng: 77.6537 }, // Electronic City Phase 1
  '560099': { lat: 12.8298, lng: 77.6764 }, // Electronic City Phase 2
};

// Geocode a zipcode to get lat/lng using postal code component filter
async function geocodeZipcode(zipcode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Use components filter for more accurate postal code geocoding in India
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${encodeURIComponent(zipcode)}|country:IN&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const formattedAddress = data.results[0].formatted_address;
      
      // Validate the result is in Karnataka/Bangalore region (lat ~12-14, lng ~77-78)
      if (location.lat >= 12 && location.lat <= 14 && location.lng >= 77 && location.lng <= 79) {
        console.log(`Geocoding ${zipcode}: OK -> ${formattedAddress} (${location.lat}, ${location.lng})`);
        return { lat: location.lat, lng: location.lng };
      } else {
        console.log(`Geocoding ${zipcode}: Result outside Bangalore region (${location.lat}, ${location.lng}), trying fallbacks`);
      }
    }
    
    // Fallback 1: Try with more specific address including Bangalore Karnataka
    console.log(`Geocoding ${zipcode}: components filter failed, trying specific address fallback`);
    const fallbackResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zipcode + ' Bangalore Karnataka India')}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const fallbackData = await fallbackResponse.json();
    
    if (fallbackData.status === 'OK' && fallbackData.results.length > 0) {
      const location = fallbackData.results[0].geometry.location;
      const formattedAddress = fallbackData.results[0].formatted_address;
      
      // Validate the result is in Karnataka/Bangalore region
      if (location.lat >= 12 && location.lat <= 14 && location.lng >= 77 && location.lng <= 79) {
        console.log(`Geocoding ${zipcode}: fallback OK -> ${formattedAddress} (${location.lat}, ${location.lng})`);
        return { lat: location.lat, lng: location.lng };
      } else {
        console.log(`Geocoding ${zipcode}: Fallback result outside Bangalore region (${location.lat}, ${location.lng})`);
      }
    }
    
    // Fallback 2: Use hardcoded coordinates for known problem pincodes
    if (BANGALORE_PINCODE_FALLBACKS[zipcode]) {
      const coords = BANGALORE_PINCODE_FALLBACKS[zipcode];
      console.log(`Geocoding ${zipcode}: Using hardcoded fallback (${coords.lat}, ${coords.lng})`);
      return coords;
    }
    
    console.log(`Geocoding ${zipcode}: FAILED - ${data.status}`);
    return null;
  } catch (error) {
    console.error(`Geocoding error for ${zipcode}:`, error);
    
    // Even on error, try hardcoded fallback
    if (BANGALORE_PINCODE_FALLBACKS[zipcode]) {
      const coords = BANGALORE_PINCODE_FALLBACKS[zipcode];
      console.log(`Geocoding ${zipcode}: Using hardcoded fallback after error (${coords.lat}, ${coords.lng})`);
      return coords;
    }
    
    return null;
  }
}

// Calculate distance between two points using Haversine formula (fallback)
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchZipcode, bloodType, limit = 50 } = await req.json();

    if (!searchZipcode) {
      return new Response(
        JSON.stringify({ error: 'searchZipcode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching donors near zipcode: ${searchZipcode}, bloodType: ${bloodType}`);

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all available donors
    let query = supabase
      .from('donors')
      .select('id, name, phone_number, blood_type, zipcode, area, city, is_available')
      .eq('is_available', true);

    if (bloodType && bloodType !== 'All') {
      query = query.eq('blood_type', bloodType);
    }

    const { data: donors, error } = await query;

    if (error) {
      console.error('Error fetching donors:', error);
      throw error;
    }

    if (!donors || donors.length === 0) {
      return new Response(
        JSON.stringify({ donors: [], message: 'No donors found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${donors.length} donors`);

    // Geocode the search zipcode
    const searchLocation = await geocodeZipcode(searchZipcode);
    
    if (!searchLocation) {
      console.log('Could not geocode search zipcode, returning donors without distance sorting');
      return new Response(
        JSON.stringify({ 
          donors: donors.slice(0, limit).map(d => ({ ...d, distance_km: null, distance_text: 'Unknown' })),
          message: 'Could not determine location for zipcode'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get unique zipcodes from donors
    const uniqueZipcodes = [...new Set(donors.map(d => d.zipcode))];
    console.log(`Unique donor zipcodes: ${uniqueZipcodes.length}`);

    // Geocode each unique zipcode and cache results
    const zipcodeLocations: Record<string, { lat: number; lng: number } | null> = {};
    
    for (const zipcode of uniqueZipcodes) {
      zipcodeLocations[zipcode] = await geocodeZipcode(zipcode);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Calculate distances and sort donors
    const donorsWithDistance: DonorWithDistance[] = donors.map(donor => {
      const donorLocation = zipcodeLocations[donor.zipcode];
      
      if (!donorLocation) {
        console.log(`Donor ${donor.name} (${donor.zipcode}): No location found`);
        return { ...donor, distance_km: 9999, distance_text: 'Unknown' };
      }

      const distance = haversineDistance(
        searchLocation.lat, searchLocation.lng,
        donorLocation.lat, donorLocation.lng
      );

      // Debug log for Electronic City donors
      if (donor.area?.toLowerCase().includes('electronic') || donor.zipcode === '560052') {
        console.log(`DEBUG Electronic City donor: ${donor.name}`);
        console.log(`  Search location (${searchZipcode}): ${searchLocation.lat}, ${searchLocation.lng}`);
        console.log(`  Donor location (${donor.zipcode}): ${donorLocation.lat}, ${donorLocation.lng}`);
        console.log(`  Calculated distance: ${distance} km`);
      }

      return {
        ...donor,
        distance_km: Math.round(distance * 10) / 10,
        distance_text: distance < 1 ? 'Less than 1 km' : `${Math.round(distance)} km`
      };
    });

    // Sort by distance (ascending) and limit results
    donorsWithDistance.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
    const limitedDonors = donorsWithDistance.slice(0, limit);

    console.log(`Returning ${limitedDonors.length} donors sorted by distance`);
    // Log top 5 for debugging
    limitedDonors.slice(0, 5).forEach((d, i) => {
      console.log(`  #${i+1}: ${d.name} (${d.zipcode}) - ${d.distance_km} km`);
    });

    return new Response(
      JSON.stringify({ donors: limitedDonors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-donors-nearby:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
