import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
// Initialize Supabase client
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'));
// Function to fetch Google's public keys
async function fetchGooglePublicKeys() {
  const response = await fetch('https://www.googleapis.com/ads/admob/v1/publisher/publicKeys');
  const data = await response.json();
  return data.publicKeys;
}
// Function to verify the signature
async function verifySignature(message, signature, publicKeys) {
  try {
    for (const key of publicKeys){
      const publicKey = await jose.importJWK(key, 'RS256');
      try {
        await jose.jwtVerify(signature, publicKey, {
          algorithms: [
            'RS256'
          ]
        });
        return true;
      } catch  {
        continue;
      }
    }
    return false;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}
// Main handler for the Edge Function
Deno.serve(async (req)=>{
  try {
    // Parse URL and query parameters
    const url = new URL(req.url);
    const params = url.searchParams;
    // Extract AdMob SSV parameters
    const key = params.get('key');
    const signature = params.get('signature');
    const timestamp = params.get('timestamp');
    const userId = params.get('user_id');
    const energy = parseFloat(params.get('energy') || '2'); // Default to 10 if not provided
    // Validate required parameters
    if (!key || !signature || !timestamp) {
      return new Response(JSON.stringify({
        error: 'Missing required query parameters'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    // Construct the message to verify
    const message = `${timestamp}:${key}`; // Adjust based on AdMob's documentation
    // Fetch Google's public keys
    const publicKeys = await fetchGooglePublicKeys();
    // Verify the signature
    const isValid = await verifySignature(message, signature, publicKeys);
    if (!isValid) {
      return new Response(JSON.stringify({
        error: 'Invalid signature'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    // Prepare data to store
    const eventData = {
      key,
      timestamp,
      user_id: userId || null,
      energy: isNaN(energy) ? 2 : energy
    };
    // Store the event in Supabase
    const { error: eventError } = await supabase.from('admob_events').insert([
      eventData
    ]);
    if (eventError) {
      console.error('Database error (admob_events):', eventError.message);
      return new Response(JSON.stringify({
        error: 'Failed to store event'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    // Update user's energy if user_id is provided
    if (userId) {
      const { error: rpcError } = await supabase.rpc('increase_energy', {
        p_user_id: userId,
        p_energy: isNaN(energy) ? 2 : energy
      });
      if (rpcError) {
        console.error('Error calling increase_energy:', rpcError.message);
        return new Response(JSON.stringify({
          error: 'Failed to update user energy'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
    return new Response(JSON.stringify({
      message: 'Verification successful',
      data: eventData
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
