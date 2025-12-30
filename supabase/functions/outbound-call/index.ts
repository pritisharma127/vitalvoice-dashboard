import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OutboundCallRequest {
  donor_phone: string;
  donor_name: string;
  donor_gender: string;
  donor_blood_group: string;
  donor_address: string;
  urgency: string;
  reason: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    const body: OutboundCallRequest = await req.json();
    console.log('Outbound call request:', JSON.stringify(body, null, 2));

    const payload = {
      agent_id: "agent_7701kd76hacbfkp86cnqq2avpnsw",
      agent_phone_number_id: "phnum_8001kc6xhfwxetbrtmvy5xyqjqgn",
      to_number: body.donor_phone,
      conversation_initiation_client_data: {
        dynamic_variables: {
          contact_name: body.donor_name,
          gender: body.donor_gender,
          blood_group: body.donor_blood_group,
          required_by_datetime: body.urgency,
          reason: body.reason,
          location: body.donor_address,
        },
      },
    };

    console.log('Calling ElevenLabs API with payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.elevenlabs.io/v1/convai/twilio/outbound-call', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('ElevenLabs API response status:', response.status);
    console.log('ElevenLabs API response:', responseText);

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} - ${responseText}`);
    }

    let result;
    try {
      const parsed = JSON.parse(responseText);
      // Extract only conversation_id for call_id
      result = { call_id: parsed.conversation_id || null };
      console.log('Extracted conversation_id:', result.call_id);
    } catch {
      result = { call_id: null };
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Outbound call error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
