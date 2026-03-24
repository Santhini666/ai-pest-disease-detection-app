import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reject oversized images (5MB base64 ≈ 3.75MB raw)
    if (imageBase64.length > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Image too large. Please use an image under 5MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let mediaType = "image/jpeg";
    if (imageBase64.startsWith("data:")) {
      const match = imageBase64.match(/^data:(image\/\w+);base64,/);
      if (match) mediaType = match[1];
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const systemPrompt = `You are an expert agricultural pathologist and entomologist. Analyze the provided plant image and identify any pests, diseases, or nutrient deficiencies visible.

Return your analysis using the extract_detections tool. For each issue found, provide:
- name: specific name of the pest or disease
- type: either "pest" or "disease"  
- confidence: your confidence level as a percentage (0-100)
- severity: "low", "medium", or "high"
- description: brief description of what you observe
- treatment: recommended treatment steps

If the plant appears healthy, return an empty detections array.
If the image is not of a plant, still return empty detections and note it in a single detection with type "disease", name "Not a plant image", confidence 100, severity "low".`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mediaType};base64,${base64Data}` },
              },
              {
                type: "text",
                text: "Analyze this plant image for pests and diseases.",
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_detections",
              description: "Extract pest and disease detections from a plant image analysis",
              parameters: {
                type: "object",
                properties: {
                  detections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        type: { type: "string", enum: ["pest", "disease"] },
                        confidence: { type: "number", minimum: 0, maximum: 100 },
                        severity: { type: "string", enum: ["low", "medium", "high"] },
                        description: { type: "string" },
                        treatment: { type: "string" },
                      },
                      required: ["name", "type", "confidence", "severity", "description", "treatment"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["detections"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_detections" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ detections: parsed.detections || [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("detect-pests error:", e);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
