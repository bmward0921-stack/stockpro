import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, category, description, zipCode } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Product title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a pricing expert for secondhand and resale marketplaces. You help sellers price their items competitively based on the product details and local market conditions.

Consider these factors when suggesting prices:
- Product condition and brand value
- Local market demand based on zip code region
- Platform-specific pricing (Facebook Marketplace, Poshmark, etc.)
- Seasonal demand
- Typical resale value percentages

Always provide realistic, competitive prices that will help items sell while maximizing seller profit.`;

    const userPrompt = `Suggest competitive selling prices for this product:

Product Title: ${title}
Category: ${category || 'General'}
Description: ${description || 'No description provided'}
Seller Zip Code: ${zipCode || 'Not specified'}

Provide price suggestions for these platforms:
1. Facebook Marketplace (local pickup, price-conscious buyers)
4. eBay (auction/buy-it-now, broader reach, fees apply)
2. Poshmark (fashion-focused, willing to pay more for brands)
3. General/Squarespace (e-commerce, broader audience)

Also consider the zip code region for local market adjustments if provided.`;

    console.log("Calling Lovable AI for price suggestion...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_prices",
              description: "Return price suggestions for different platforms",
              parameters: {
                type: "object",
                properties: {
                  facebook: {
                    type: "object",
                    properties: {
                      price: { type: "number", description: "Suggested price in USD" },
                      reasoning: { type: "string", description: "Brief explanation for this price" }
                    },
                    required: ["price", "reasoning"]
                  },
                  poshmark: {
                    type: "object",
                    properties: {
                      price: { type: "number", description: "Suggested price in USD" },
                      reasoning: { type: "string", description: "Brief explanation for this price" }
                    },
                    required: ["price", "reasoning"]
                  },
                  squarespace: {
                    type: "object",
                    properties: {
                      price: { type: "number", description: "Suggested price in USD" },
                      reasoning: { type: "string", description: "Brief explanation for this price" }
                    },
                    required: ["price", "reasoning"]
                  },
                  ebay: {
                    type: "object",
                    properties: {
                      price: { type: "number", description: "Suggested price in USD" },
                      reasoning: { type: "string", description: "Brief explanation for this price" }
                    },
                    required: ["price", "reasoning"]
                  },
                  marketInsight: {
                    type: "string",
                    description: "Brief insight about the local market based on zip code if provided"
                  }
                },
                required: ["facebook", "poshmark", "squarespace", "ebay"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_prices" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get price suggestions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received:", JSON.stringify(data));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response");
      return new Response(
        JSON.stringify({ error: "Failed to parse price suggestions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const suggestions = JSON.parse(toolCall.function.arguments);
    console.log("Price suggestions:", suggestions);

    return new Response(
      JSON.stringify(suggestions),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in suggest-price function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
