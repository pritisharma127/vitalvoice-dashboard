import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');

const VALID_BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Known Bangalore area pincodes with coordinates
const BANGALORE_PINCODE_FALLBACKS: Record<string, { lat: number; lng: number }> = {
  '560052': { lat: 12.8451, lng: 77.6604 },
  '560100': { lat: 12.8407, lng: 77.6537 },
  '560099': { lat: 12.8298, lng: 77.6764 },
  '560043': { lat: 12.9141, lng: 77.6480 },
  '560001': { lat: 12.9716, lng: 77.5946 },
  '560002': { lat: 12.9763, lng: 77.5929 },
};

async function geocodeZipcode(zipcode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${encodeURIComponent(zipcode)}|country:IN&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      if (location.lat >= 12 && location.lat <= 14 && location.lng >= 77 && location.lng <= 79) {
        return { lat: location.lat, lng: location.lng };
      }
    }
    
    // Fallback with address search
    const fallbackResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zipcode + ' Bangalore Karnataka India')}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const fallbackData = await fallbackResponse.json();
    
    if (fallbackData.status === 'OK' && fallbackData.results.length > 0) {
      const location = fallbackData.results[0].geometry.location;
      if (location.lat >= 12 && location.lat <= 14 && location.lng >= 77 && location.lng <= 79) {
        return { lat: location.lat, lng: location.lng };
      }
    }
    
    // Use hardcoded fallback
    if (BANGALORE_PINCODE_FALLBACKS[zipcode]) {
      return BANGALORE_PINCODE_FALLBACKS[zipcode];
    }
    
    return null;
  } catch (error) {
    console.error(`Geocoding error for ${zipcode}:`, error);
    if (BANGALORE_PINCODE_FALLBACKS[zipcode]) {
      return BANGALORE_PINCODE_FALLBACKS[zipcode];
    }
    return null;
  }
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use GET.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Extract donor_id from path: /donors/{donor_id}
    const donorId = pathParts[pathParts.length - 1];
    const finalDonorId = (donorId && donorId !== 'donors') ? donorId : null;

    // Get specific donor by ID
    if (finalDonorId) {
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .eq('id', finalDonorId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching donor:', error);
        throw error;
      }

      if (!data) {
        return new Response(
          JSON.stringify({ success: false, error: 'Donor not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // List donors with filters and optional proximity search
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const bloodType = url.searchParams.get('blood_type');
    const zipcode = url.searchParams.get('zipcode');
    const city = url.searchParams.get('city');
    const area = url.searchParams.get('area');
    const availableOnly = url.searchParams.get('available_only') !== 'false';
    const proximitySearch = url.searchParams.get('proximity_search') === 'true';
    const searchZipcode = url.searchParams.get('search_zipcode');
    const offset = (page - 1) * limit;

    console.log('Donors API request:', { page, limit, bloodType, zipcode, city, area, availableOnly, proximitySearch, searchZipcode });

    let query = supabase
      .from('donors')
      .select('*', { count: 'exact' });

    if (availableOnly) {
      query = query.eq('is_available', true);
    }
    if (bloodType && VALID_BLOOD_TYPES.includes(bloodType)) {
      query = query.eq('blood_type', bloodType);
    }
    if (zipcode) {
      query = query.eq('zipcode', zipcode);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (area) {
      query = query.ilike('area', `%${area}%`);
    }

    const { data: donors, error, count } = await query;

    if (error) {
      console.error('Error fetching donors:', error);
      throw error;
    }

    if (!donors || donors.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: [], 
          pagination: { page, limit, total: 0, total_pages: 0 } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If proximity search is enabled and search_zipcode is provided
    if (proximitySearch && searchZipcode) {
      const searchLocation = await geocodeZipcode(searchZipcode);
      
      if (!searchLocation) {
        console.log('Could not geocode search zipcode');
        // Return without distance sorting
        const paginatedDonors = donors.slice(offset, offset + limit);
        return new Response(
          JSON.stringify({
            success: true,
            data: paginatedDonors.map(d => ({ ...d, distance_km: null, distance_text: 'Unknown' })),
            pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) },
            warning: 'Could not determine location for search_zipcode'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Geocode unique donor zipcodes
      const uniqueZipcodes = [...new Set(donors.map(d => d.zipcode))];
      const zipcodeLocations: Record<string, { lat: number; lng: number } | null> = {};
      
      for (const zc of uniqueZipcodes) {
        zipcodeLocations[zc] = await geocodeZipcode(zc);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Calculate distances
      const donorsWithDistance = donors.map(donor => {
        const donorLocation = zipcodeLocations[donor.zipcode];
        
        if (!donorLocation) {
          return { ...donor, distance_km: 9999, distance_text: 'Unknown' };
        }

        const distance = haversineDistance(
          searchLocation.lat, searchLocation.lng,
          donorLocation.lat, donorLocation.lng
        );

        return {
          ...donor,
          distance_km: Math.round(distance * 10) / 10,
          distance_text: distance < 1 ? 'Less than 1 km' : `${Math.round(distance)} km`
        };
      });

      // Sort by distance and paginate
      donorsWithDistance.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
      const paginatedDonors = donorsWithDistance.slice(offset, offset + limit);

      console.log(`Returning ${paginatedDonors.length} donors with proximity search`);

      return new Response(
        JSON.stringify({
          success: true,
          data: paginatedDonors,
          pagination: {
            page,
            limit,
            total: count,
            total_pages: Math.ceil((count || 0) / limit)
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Regular pagination without proximity
    const paginatedDonors = donors.slice(offset, offset + limit);

    console.log(`Returning ${paginatedDonors.length} donors`);

    return new Response(
      JSON.stringify({
        success: true,
        data: paginatedDonors,
        pagination: {
          page,
          limit,
          total: count,
          total_pages: Math.ceil((count || 0) / limit)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in donors API:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
