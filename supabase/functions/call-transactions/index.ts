import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CallTransactionInput {
  campaign_id: string;
  donor_id: string;
  phone_number: string;
  name: string;
  address: string;
  zip: string;
  gender?: string;
  blood_type: string;
  urgency: string;
  reason?: string;
  hospital_location: string;
  availability?: string;
  alternate_phone?: string;
  current_location?: string;
  pincode?: string;
  eligibility?: string;
  donor_selected?: string;
  whatsapp_sent?: string;
  sms_sent?: string;
  email_sent?: string;
  call_id?: string;
}

interface CallTransactionUpdate {
  availability?: string;
  alternate_phone?: string;
  current_location?: string;
  pincode?: string;
  eligibility?: string;
  gender?: string;
  reason?: string;
  donor_selected?: string;
  whatsapp_sent?: string;
  sms_sent?: string;
  email_sent?: string;
  call_id?: string;
}

function validatePhone(phone: string): boolean {
  // Format: +[country_code][number] - no dashes, 10-15 digits after +
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(phone);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const transactionId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

    // GET - List or retrieve call transactions
    if (req.method === 'GET') {
      if (transactionId && transactionId !== 'call-transactions') {
        // Get by ID or campaign_id
        let query = supabase.from('call_transactions').select('*');
        
        // Check if it's a UUID (transaction id) or campaign_id
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(transactionId)) {
          query = query.eq('id', transactionId);
        } else {
          // Treat as campaign_id
          query = query.eq('campaign_id', transactionId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching transaction:', error);
          return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!data || data.length === 0) {
          return new Response(JSON.stringify({ success: false, error: 'Transaction not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          data: uuidRegex.test(transactionId) ? data[0] : data 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // List all with pagination and filtering
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
      const offset = (page - 1) * limit;

      let query = supabase.from('call_transactions').select('*', { count: 'exact' });

      // Apply filters
      const campaignId = url.searchParams.get('campaign_id');
      const donorId = url.searchParams.get('donor_id');
      const phoneNumber = url.searchParams.get('phone_number');
      const availability = url.searchParams.get('availability');
      const bloodType = url.searchParams.get('blood_type');

      if (campaignId) query = query.eq('campaign_id', campaignId);
      if (donorId) query = query.eq('donor_id', donorId);
      if (phoneNumber) query = query.eq('phone_number', phoneNumber);
      if (availability) query = query.eq('availability', availability);
      if (bloodType) query = query.eq('blood_type', bloodType);

      query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error listing transactions:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST with call_id query param - Update call transaction by call_id (must be checked BEFORE create)
    if (req.method === 'POST' && url.searchParams.has('call_id')) {
      const callIdParam = url.searchParams.get('call_id');
      
      if (!callIdParam) {
        return new Response(JSON.stringify({
          success: false,
          error: 'call_id query parameter is required',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body: CallTransactionUpdate = await req.json();

      // Only allow updating specific fields (post-call updates)
      const allowedFields = ['availability', 'alternate_phone', 'current_location', 'pincode', 'eligibility', 'gender', 'reason', 'donor_selected', 'whatsapp_sent', 'sms_sent', 'email_sent'];
      const updateData: Record<string, string> = {};

      for (const field of allowedFields) {
        if (body[field as keyof CallTransactionUpdate] !== undefined) {
          updateData[field] = body[field as keyof CallTransactionUpdate]!;
        }
      }

      if (Object.keys(updateData).length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No valid fields to update. Allowed fields: ' + allowedFields.join(', '),
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Updating transaction by call_id:', callIdParam, 'with data:', updateData);

      // First check if the record exists
      const { data: existingData, error: findError } = await supabase
        .from('call_transactions')
        .select('id')
        .eq('call_id', callIdParam)
        .maybeSingle();

      if (findError) {
        console.error('Error finding transaction:', findError);
        return new Response(JSON.stringify({ success: false, error: findError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!existingData) {
        console.error('Transaction not found for call_id:', callIdParam);
        return new Response(JSON.stringify({ 
          success: false, 
          error: `No transaction found with call_id: ${callIdParam}` 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update the record
      const { data, error } = await supabase
        .from('call_transactions')
        .update(updateData)
        .eq('call_id', callIdParam)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Call transaction updated successfully:', data.id);

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Create new call transaction (no call_id param)
    if (req.method === 'POST') {
      const body: CallTransactionInput = await req.json();

      // Validate required fields
      const requiredFields = ['campaign_id', 'donor_id', 'phone_number', 'name', 'address', 'zip', 'blood_type', 'urgency', 'hospital_location'];
      const missingFields = requiredFields.filter(field => !body[field as keyof CallTransactionInput]);

      if (missingFields.length > 0) {
        return new Response(JSON.stringify({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate blood type
      const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      if (!validBloodTypes.includes(body.blood_type)) {
        return new Response(JSON.stringify({
          success: false,
          error: `Invalid blood_type. Must be one of: ${validBloodTypes.join(', ')}`,
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate phone numbers
      if (!validatePhone(body.phone_number)) {
        return new Response(JSON.stringify({
          success: false,
          error: 'phone_number must be in format +919113669741 (no dashes)',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (body.alternate_phone && body.alternate_phone !== 'NA' && !validatePhone(body.alternate_phone)) {
        return new Response(JSON.stringify({
          success: false,
          error: 'alternate_phone must be in format +919113669741 (no dashes)',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const insertData = {
        campaign_id: body.campaign_id,
        donor_id: body.donor_id,
        phone_number: body.phone_number,
        name: body.name,
        address: body.address,
        zip: body.zip,
        gender: body.gender || 'NA',
        blood_type: body.blood_type,
        urgency: body.urgency,
        reason: body.reason || 'NA',
        hospital_location: body.hospital_location,
        availability: body.availability || 'NA',
        alternate_phone: body.alternate_phone || 'NA',
        current_location: body.current_location || 'NA',
        pincode: body.pincode || 'NA',
        eligibility: body.eligibility || 'NA',
        donor_selected: body.donor_selected || 'NA',
        whatsapp_sent: body.whatsapp_sent || 'NA',
        sms_sent: body.sms_sent || 'NA',
        email_sent: body.email_sent || 'NA',
        call_id: body.call_id || null,
      };

      const { data, error } = await supabase.from('call_transactions').insert(insertData).select().single();

      if (error) {
        console.error('Error creating transaction:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Call transaction created:', data.id);

      return new Response(JSON.stringify({ success: true, data }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }


    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in call-transactions function:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
