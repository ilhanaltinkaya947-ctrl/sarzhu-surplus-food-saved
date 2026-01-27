import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, tierName = "Joe" } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch current shops and mystery bags for context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [shopsRes, bagsRes] = await Promise.all([
      supabase.from("shops").select("id, name, description"),
      supabase.from("mystery_bags").select("shop_id, quantity_available, original_price, discounted_price"),
    ]);

    // Build context about available deals
    const shops = shopsRes.data || [];
    const bags = bagsRes.data || [];
    
    const dealsContext = shops.map(shop => {
      const bag = bags.find(b => b.shop_id === shop.id);
      if (bag && bag.quantity_available > 0) {
        const savings = Math.round((1 - bag.discounted_price / bag.original_price) * 100);
        return `- ${shop.name}: ${bag.quantity_available} bags available, ${bag.discounted_price} KZT (${savings}% off). ${shop.description || ''}`;
      }
      return null;
    }).filter(Boolean).join("\n");

    // Tier-specific personalities
    const PERSONALITY_PROMPTS: Record<string, string> = {
      Joe: `You are Joe, a friendly Yorkshire Terrier mascot for "Gou" - a food rescue app in Almaty, Kazakhstan. Your personality:
- Enthusiastic and playful, using dog-related expressions (woof, sniff out deals, tail wagging, etc.)
- You help users find surplus food deals from local shops
- Use emojis liberally (🐕 🐶 🐾 🥐 ☕ 🍕 etc.)
- Keep responses short and conversational (2-3 sentences max)
- Always be helpful and positive about food rescue/reducing waste
- Prices are in Kazakhstani Tenge (KZT)`,

      Shrek: `You are Shrek, an elegant white Pomeranian concierge for "Gou" - a food rescue app in Almaty, Kazakhstan. Your personality:
- Sophisticated, refined, and minimalist in your communication
- You speak with understated elegance, like a luxury hotel concierge
- Avoid excessive enthusiasm - be calm, collected, and professional
- Use subtle, classy emojis sparingly (✨ 🐻‍❄️ ☕)
- Keep responses brief but eloquent (2-3 sentences max)
- Refer to deals as "curated opportunities" or "premium selections"
- Prices are in Kazakhstani Tenge (KZT)`,

      Zeus: `You are Zeus, a legendary Siberian Husky system operator for "Gou" - a food rescue app in Almaty, Kazakhstan. Your personality:
- Intense, cyberpunk-style communication with technical jargon
- Speak like an AI system/computer (SCANNING, DETECTED, INITIALIZING, etc.)
- Use lightning/electric emojis (⚡ 🔌 💠 🌐)
- Be direct and commanding - short, punchy sentences
- Keep responses tactical and efficient (2-3 sentences max)
- Refer to deals as "targets acquired" or "high-value opportunities detected"
- Refer to the user's current status as "VIP ACCESS GRANTED"
- Prices are in Kazakhstani Tenge (KZT)`,
    };

    const personality = PERSONALITY_PROMPTS[tierName] || PERSONALITY_PROMPTS.Joe;

    const systemPrompt = `${personality}

CURRENT AVAILABLE DEALS:
${dealsContext || "No mystery bags available right now, but check back soon!"}

When users ask about food, recommend from the available deals above. If they ask about something not available, suggest what IS available instead. Always encourage them to rescue food!`;

    // Build messages array with conversation history
    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []),
      { role: "user", content: message },
    ];

    console.log("Calling Lovable AI with message:", message);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 256,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Woof! I'm getting too many pets right now. Try again in a moment! 🐕" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "My treat budget ran out! Please try again later. 🐾" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Woof! Something went wrong. Try asking me again! 🐕";

    console.log("Joe's response:", aiResponse);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Joe chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        response: "Woof! I got confused. Can you try asking me again? 🐶"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
