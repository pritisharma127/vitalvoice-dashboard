import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Valid enum values
const VALID_STATUS = ['pending', 'in_progress', 'fulfilled', 'cancelled'];
const VALID_URGENCY = ['immediate', 'within_3_hours', 'within_6_hours', 'within_24_hours', 'within_48_hours'];
const VALID_BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const VALID_GENDER = ['male', 'female', 'other'];

interface UpdatePayload {
  status?: string;
  notes?: string;
  quantity_units?: number;
  urgency?: string;
  caretaker_name?: string;
  caretaker_phone?: string;
  caretaker_email?: string;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  blood_type?: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  // Format: +[country_code][number] - no dashes, 10-15 digits after +
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(phone);
}

function validateUpdatePayload(payload: UpdatePayload): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (payload.status !== undefined && !VALID_STATUS.includes(payload.status)) {
    errors.push(`Invalid status. Must be one of: ${VALID_STATUS.join(', ')}`);
  }

  if (payload.urgency !== undefined && !VALID_URGENCY.includes(payload.urgency)) {
    errors.push(`Invalid urgency. Must be one of: ${VALID_URGENCY.join(', ')}`);
  }

  if (payload.blood_type !== undefined && !VALID_BLOOD_TYPES.includes(payload.blood_type)) {
    errors.push(`Invalid blood_type. Must be one of: ${VALID_BLOOD_TYPES.join(', ')}`);
  }

  if (payload.patient_gender !== undefined && !VALID_GENDER.includes(payload.patient_gender)) {
    errors.push(`Invalid patient_gender. Must be one of: ${VALID_GENDER.join(', ')}`);
  }

  if (payload.quantity_units !== undefined) {
    if (typeof payload.quantity_units !== 'number' || payload.quantity_units < 1 || payload.quantity_units > 20) {
      errors.push('quantity_units must be a number between 1 and 20');
    }
  }

  if (payload.patient_age !== undefined) {
    if (typeof payload.patient_age !== 'number' || payload.patient_age < 0 || payload.patient_age > 120) {
      errors.push('patient_age must be a number between 0 and 120');
    }
  }

  if (payload.caretaker_email !== undefined && !validateEmail(payload.caretaker_email)) {
    errors.push('Invalid caretaker_email format');
  }

  if (payload.caretaker_phone !== undefined && !validatePhone(payload.caretaker_phone)) {
    errors.push('Invalid caretaker_phone format. Must be in format +919113669741 (no dashes)');
  }

  if (payload.notes !== undefined && typeof payload.notes === 'string' && payload.notes.length > 1000) {
    errors.push('notes must be less than 1000 characters');
  }

  if (payload.patient_name !== undefined && typeof payload.patient_name === 'string' && payload.patient_name.length > 100) {
    errors.push('patient_name must be less than 100 characters');
  }

  if (payload.caretaker_name !== undefined && typeof payload.caretaker_name === 'string' && payload.caretaker_name.length > 100) {
    errors.push('caretaker_name must be less than 100 characters');
  }

  return { valid: errors.length === 0, errors };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Extract request_id from path: /update-blood-request/{request_id}
    // The function name is part of the path, so we look for the ID after it
    const requestId = pathParts[pathParts.length - 1];
    
    // If no ID in path, check query params
    const requestIdFromQuery = url.searchParams.get('request_id');
    const finalRequestId = (requestId && requestId !== 'update-blood-request') ? requestId : requestIdFromQuery;

    // GET: Retrieve a specific request by request_id
    if (req.method === 'GET') {
      if (!finalRequestId) {
        // Return all requests (paginated)
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
        const status = url.searchParams.get('status');
        const offset = (page - 1) * limit;

        let query = supabase
          .from('blood_requests')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (status && VALID_STATUS.includes(status)) {
          query = query.eq('status', status);
        }

        const { data, error, count } = await query;

        if (error) {
          console.error('Error fetching requests:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({
            success: true,
            data,
            pagination: {
              page,
              limit,
              total: count,
              totalPages: Math.ceil((count || 0) / limit)
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get specific request
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('request_id', finalRequestId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(
            JSON.stringify({ success: false, error: 'Request not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PATCH: Update a request
    if (req.method === 'PATCH') {
      if (!finalRequestId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'request_id is required. Use PATCH /update-blood-request/{request_id} or ?request_id=...' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      console.log(`Updating request ${finalRequestId} with:`, JSON.stringify(body));

      // Validate payload
      const { valid, errors } = validateUpdatePayload(body);
      if (!valid) {
        return new Response(
          JSON.stringify({ success: false, errors }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Build update object with only valid fields
      const updateData: Record<string, unknown> = {};
      const allowedFields = [
        'status', 'notes', 'quantity_units', 'urgency',
        'caretaker_name', 'caretaker_phone', 'caretaker_email',
        'patient_name', 'patient_age', 'patient_gender', 'blood_type'
      ];

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No valid fields to update',
            allowedFields 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Add updated_at timestamp
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('blood_requests')
        .update(updateData)
        .eq('request_id', finalRequestId)
        .select()
        .single();

      if (error) {
        console.error('Error updating request:', error);
        if (error.code === 'PGRST116') {
          return new Response(
            JSON.stringify({ success: false, error: 'Request not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw error;
      }

      console.log(`Successfully updated request ${finalRequestId}`);

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use GET or PATCH.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-blood-request:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
