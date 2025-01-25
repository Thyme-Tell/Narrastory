import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const RPI_PRINT_API_KEY = Deno.env.get('RPI_PRINT_API_KEY');
const WEBHOOK_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/rpi-print-webhook`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  sku: string;
  quantity: number;
  retailPrice: string;
  itemDescription: string;
  product: {
    coverUrl: string;
    gutsUrl: string;
  };
}

interface Destination {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  address3?: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  phone: string;
  email: string;
}

interface CreateOrderRequest {
  destination: Destination;
  orderItems: OrderItem[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, orderItems } = await req.json() as CreateOrderRequest;

    console.log('Creating RPI Print order with:', { destination, orderItems });

    const response = await fetch('https://open.api.sandbox.rpiprint.com/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RPI_PRINT_API_KEY}`,
      },
      body: JSON.stringify({
        currency: 'USD',
        shippingClassification: 'priority',
        webhookUrl: WEBHOOK_URL,
        destination,
        orderItems,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('RPI Print API error:', errorData);
      throw new Error(`RPI Print API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('RPI Print order created successfully:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in rpi-print-order function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});