import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Valid enum values
const VALID_STATUS = ['pending', 'in_progress', 'fulfilled', 'cancelled'];
const VALID_URGENCY = ['immediate', 'within_3_hours', 'within_6_hours', 'within_24_hours', 'within_48_hours'];
const VALID_BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const VALID_GENDER = ['male', 'female', 'other'];

interface CreatePayload {
  patient_name: string;
  blood_type: string;
  quantity_units: number;
  urgency: string;
  patient_age: number;
  patient_gender: string;
  caretaker_name?: string;
  caretaker_phone: string;
  caretaker_email: string;
  hospital_name: string;
  hospital_city: string;
  hospital_zipcode: string;
  notes?: string;
}

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

function validateCreatePayload(payload: CreatePayload): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!payload.patient_name || typeof payload.patient_name !== 'string' || payload.patient_name.trim().length === 0) {
    errors.push('patient_name is required');
  } else if (payload.patient_name.length > 100) {
    errors.push('patient_name must be less than 100 characters');
  }

  if (!payload.blood_type || !VALID_BLOOD_TYPES.includes(payload.blood_type)) {
    errors.push(`blood_type is required and must be one of: ${VALID_BLOOD_TYPES.join(', ')}`);
  }

  if (!payload.urgency || !VALID_URGENCY.includes(payload.urgency)) {
    errors.push(`urgency is required and must be one of: ${VALID_URGENCY.join(', ')}`);
  }

  if (!payload.patient_gender || !VALID_GENDER.includes(payload.patient_gender)) {
    errors.push(`patient_gender is required and must be one of: ${VALID_GENDER.join(', ')}`);
  }

  if (payload.quantity_units === undefined || typeof payload.quantity_units !== 'number' || payload.quantity_units < 1 || payload.quantity_units > 20) {
    errors.push('quantity_units is required and must be a number between 1 and 20');
  }

  if (payload.patient_age === undefined || typeof payload.patient_age !== 'number' || payload.patient_age < 0 || payload.patient_age > 120) {
    errors.push('patient_age is required and must be a number between 0 and 120');
  }

  if (!payload.caretaker_phone || !validatePhone(payload.caretaker_phone)) {
    errors.push('caretaker_phone is required and must be in format +919113669741 (no dashes)');
  }

  if (!payload.caretaker_email || !validateEmail(payload.caretaker_email)) {
    errors.push('caretaker_email is required and must be a valid email');
  }

  if (!payload.hospital_name || typeof payload.hospital_name !== 'string' || payload.hospital_name.trim().length === 0) {
    errors.push('hospital_name is required');
  }

  if (!payload.hospital_city || typeof payload.hospital_city !== 'string' || payload.hospital_city.trim().length === 0) {
    errors.push('hospital_city is required');
  }

  if (!payload.hospital_zipcode || typeof payload.hospital_zipcode !== 'string' || payload.hospital_zipcode.trim().length === 0) {
    errors.push('hospital_zipcode is required');
  }

  if (payload.notes && typeof payload.notes === 'string' && payload.notes.length > 1000) {
    errors.push('notes must be less than 1000 characters');
  }

  if (payload.caretaker_name && payload.caretaker_name.length > 100) {
    errors.push('caretaker_name must be less than 100 characters');
  }

  return { valid: errors.length === 0, errors };
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
    
    // Extract request_id from path: /blood-requests/{request_id}
    const requestId = pathParts[pathParts.length - 1];
    const requestIdFromQuery = url.searchParams.get('request_id');
    const finalRequestId = (requestId && requestId !== 'blood-requests') ? requestId : requestIdFromQuery;

    // GET: List all or get specific request
    if (req.method === 'GET') {
      if (!finalRequestId) {
        // List all requests with pagination and filters
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
        const status = url.searchParams.get('status');
        const bloodType = url.searchParams.get('blood_type');
        const urgency = url.searchParams.get('urgency');
        const offset = (page - 1) * limit;

        let query = supabase
          .from('blood_requests')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (status && VALID_STATUS.includes(status)) {
          query = query.eq('status', status);
        }
        if (bloodType && VALID_BLOOD_TYPES.includes(bloodType)) {
          query = query.eq('blood_type', bloodType);
        }
        if (urgency && VALID_URGENCY.includes(urgency)) {
          query = query.eq('urgency', urgency);
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
              total_pages: Math.ceil((count || 0) / limit)
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get specific request by request_id
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('request_id', finalRequestId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching request:', error);
        throw error;
      }

      if (!data) {
        return new Response(
          JSON.stringify({ success: false, error: 'Request not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST: Create a new blood request
    if (req.method === 'POST') {
      const body: CreatePayload = await req.json();
      console.log('Creating new blood request:', JSON.stringify(body));

      const { valid, errors } = validateCreatePayload(body);
      if (!valid) {
        return new Response(
          JSON.stringify({ success: false, errors }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const requestId = uuidv4();
      const insertData = {
        request_id: requestId,
        patient_name: body.patient_name.trim(),
        blood_type: body.blood_type,
        quantity_units: body.quantity_units,
        urgency: body.urgency,
        patient_age: body.patient_age,
        patient_gender: body.patient_gender,
        caretaker_name: body.caretaker_name?.trim() || null,
        caretaker_phone: body.caretaker_phone,
        caretaker_email: body.caretaker_email,
        hospital_name: body.hospital_name.trim(),
        hospital_city: body.hospital_city.trim(),
        hospital_zipcode: body.hospital_zipcode.trim(),
        notes: body.notes?.trim() || null,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('blood_requests')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating request:', error);
        throw error;
      }

      console.log(`Created blood request: ${requestId}`);

      return new Response(
        JSON.stringify({ success: true, data, request_id: requestId }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PATCH: Update a request
    if (req.method === 'PATCH') {
      if (!finalRequestId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'request_id is required. Use PATCH /blood-requests/{request_id}' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body: UpdatePayload = await req.json();
      console.log(`Updating request ${finalRequestId}:`, JSON.stringify(body));

      const { valid, errors } = validateUpdatePayload(body);
      if (!valid) {
        return new Response(
          JSON.stringify({ success: false, errors }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const updateData: Record<string, unknown> = {};
      const allowedFields = [
        'status', 'notes', 'quantity_units', 'urgency',
        'caretaker_name', 'caretaker_phone', 'caretaker_email',
        'patient_name', 'patient_age', 'patient_gender', 'blood_type'
      ];

      for (const field of allowedFields) {
        if (body[field as keyof UpdatePayload] !== undefined) {
          updateData[field] = body[field as keyof UpdatePayload];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No valid fields to update',
            allowed_fields: allowedFields 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('blood_requests')
        .update(updateData)
        .eq('request_id', finalRequestId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating request:', error);
        throw error;
      }

      if (!data) {
        return new Response(
          JSON.stringify({ success: false, error: 'Request not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Updated request ${finalRequestId}`);

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE: Cancel a request (soft delete by setting status to cancelled)
    if (req.method === 'DELETE') {
      if (!finalRequestId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'request_id is required. Use DELETE /blood-requests/{request_id}' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('blood_requests')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('request_id', finalRequestId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error cancelling request:', error);
        throw error;
      }

      if (!data) {
        return new Response(
          JSON.stringify({ success: false, error: 'Request not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Cancelled request ${finalRequestId}`);

      return new Response(
        JSON.stringify({ success: true, message: 'Request cancelled', data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use GET, POST, PATCH, or DELETE.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in blood-requests:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
