import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

import { z } from "zod";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up body parsers with generous limits for image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Initialize the Gemini Client
const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined or is placeholder. Server-side Gemini calls will fail until set.");
}

// Word & Hashtag counts for validation
const getWordCount = (str: string): number => {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
};

const getHashtagCount = (str: string): number => {
  if (!str) return 0;
  const matches = str.match(/#[^\s#]+/g);
  return matches ? matches.length : 0;
};

const visualAppraisalSchema = z.object({
  appraisal_status: z.enum(["estimate_available", "insufficient_visual_evidence"]),
  currency: z.string(),
  low_estimate: z.number().nullable(),
  high_estimate: z.number().nullable(),
  confidence: z.enum(["low", "medium"]),
  visual_clarity_score: z.number().int().min(0).max(100, "Visual clarity score must be between 0 and 100"),
  basis: z.array(z.string()),
  assumptions: z.array(z.string()),
  missing_information: z.array(z.string()),
  value_change_factors: z.array(z.string()),
  disclaimer: z.string().refine(
    (val) => val === "This visual estimate is for preliminary content planning only and is not a certified appraisal, insurance value, resale guarantee, or authentication.",
    { message: "Disclaimer must match the exact required legal wording" }
  ),
});

// Zod Schema matching the exact required JSON structure & validation rules
const gemsightSchema = z.object({
  product_metadata: z.object({
    detected_materials: z.array(z.string()).min(1, "At least one material must be detected"),
    primary_stone: z.string(),
    secondary_stones: z.array(z.string()),
    stone_cut: z.string(),
    setting_style: z.string(),
    jewelry_category: z.string(),
    visual_confidence: z.number().int().min(0).max(100, "Visual confidence must be between 0 and 100"),
  }),
  listing_content: z.object({
    seo_title: z.string().max(60, "SEO title must contain no more than 60 characters"),
    luxury_narrative: z.string().refine(
      (val) => getWordCount(val) === 150,
      { message: "Luxury narrative must contain exactly 150 words" }
    ),
    technical_bullets: z.array(z.string()).min(3).max(5, "Technical bullets must contain between 3 and 5 entries"),
  }),
  social_media: z.object({
    instagram_caption: z.string().refine(
      (val) => getHashtagCount(val) === 5,
      { message: "Instagram caption must contain exactly 5 hashtags" }
    ),
    alt_text: z.string(),
  }),
  seo_tags: z.array(z.string()).length(10, "SEO tags must contain exactly 10 entries"),
  visual_appraisal: visualAppraisalSchema.optional(),
});

// Endpoint to generate jewelry profiles
app.post("/api/generate-profile", async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ai) {
      res.status(500).json({
        error: "Gemini API Client is not initialized. Please ensure GEMINI_API_KEY is set in Settings > Secrets."
      });
      return;
    }

    const { imageBase64, mimeType, stylePreference, includeAppraisal } = req.body;

    if (!imageBase64 || !mimeType) {
      res.status(400).json({ error: "Missing required parameter: imageBase64 and mimeType are required." });
      return;
    }

    if (!stylePreference || !["Minimalist", "Opulent", "Modern"].includes(stylePreference)) {
      res.status(400).json({ error: "Invalid or missing stylePreference. Must be Minimalist, Opulent, or Modern." });
      return;
    }

    // Standardize base64 data
    let cleanBase64 = imageBase64;
    if (imageBase64.includes(";base64,")) {
      cleanBase64 = imageBase64.split(";base64,").pop() || "";
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `Analyze the jewelry piece in the provided photograph. The style preference requested by the designer is "${stylePreference}". Let this preference dictate the visual description, tone, copywriting narrative, and Instagram caption. Output a JSON object matching the strict schema with all required fields filled in appropriately based on your expert visual assessment.`,
    };

    const systemInstruction = `ROLE

You are the “Gemsight AI Engine,” a Senior Luxury Brand Strategist and Expert Gemologist. Your purpose is to transform high-resolution jewelry photography into elite, market-ready digital assets for high-end boutique agencies.

OBJECTIVE

Analyze the provided jewelry image and selected style preference to generate a structured product profile. Balance Lean Luxury, meaning efficiency and precision, with evocative storytelling and emotional appeal.

EVIDENCE STANDARD

Only describe characteristics that are reasonably visible in the supplied image.

Do not claim that a gemstone, precious metal, carat weight, treatment, origin, authenticity, certification, or monetary value has been professionally verified.

When a material or gemstone cannot be determined confidently:

- Use language such as “appears to be,” “likely,” or “visually consistent with.”
- Lower the visual confidence score.
- Use “Undetermined from image” when necessary.
- Never invent a hallmark, carat weight, gemstone origin, certification, or designer.

VISUAL IDENTIFICATION

Inspect the image for:

- Probable metal type and color
- Primary gemstone
- Secondary gemstones
- Stone cut
- Setting style
- Jewelry category
- Distinctive structural details

TONE ALIGNMENT

If the style is Minimalist:

- Focus on architectural lines
- Emphasize quiet luxury
- Highlight proportion, negative space, and subtle sophistication

If the style is Opulent:

- Focus on heritage and maximalist glamour
- Emphasize richness, ceremonial presence, and heirloom character

If the style is Modern:

- Focus on bold geometry
- Emphasize disruptive elegance, asymmetry, structure, and contrast

WRITING REQUIREMENTS

Create:

- An SEO product title no longer than 60 characters
- A story-driven luxury narrative of exactly 150 words
- Between three and five technical bullets
- An Instagram caption containing exactly five hashtags
- Accessible image alt text
- Exactly ten SEO tags

Do not use these words:

- stunning
- beautiful
- must-have

Naturally use appropriate vocabulary such as:

- sculptural
- curated
- ethereal
- ancestral
- precision-engineered
- bespoke

Do not make unsupported claims about sustainability, ethical sourcing, rarity, history, investment value, or certification.

Return only valid JSON matching the required schema. Do not include Markdown or conversational text.`;

    let dynamicSystemInstruction = systemInstruction;
    if (includeAppraisal) {
      dynamicSystemInstruction += `

ESTIMATED APPRAISAL RANGE (REQUIRED IF REQUESTED)

Since the user selected to include a preliminary visual appraisal estimate, you MUST generate the "visual_appraisal" object in your JSON response matching the following constraints:
1. Provide a broad visual estimate based ONLY on visible evidence in the photograph and any user-confirmed information.
2. Never describe the estimate as a certified appraisal, insurance value, guaranteed resale price, authentication, or confirmed market value.
3. If the photograph does not provide enough evidence (e.g., blurry image, poor lighting, or cannot identify materials/gemstones with confidence):
   - Set appraisal_status to "insufficient_visual_evidence"
   - Set low_estimate and high_estimate to null
   - Explain what information is missing in "missing_information" (e.g., metal purity hallmark, exact gemstone weights, internal clarity details)
   - Recommend an in-person professional appraisal in "basis" or "assumptions"
4. If there is sufficient visual evidence to provide a broad estimate:
   - Set appraisal_status to "estimate_available"
   - Provide a reasonable numeric low_estimate and high_estimate in USD (numbers, not strings)
5. Set "confidence" to either "low" or "medium".
6. The "visual_clarity_score" must be an integer between 0 and 100 representing how clearly the image details are visible for the appraisal assessment.
7. Under "disclaimer", you MUST use this exact string: "This visual estimate is for preliminary content planning only and is not a certified appraisal, insurance value, resale guarantee, or authentication."`;
    }

    const responseProperties: any = {
      product_metadata: {
        type: Type.OBJECT,
        properties: {
          detected_materials: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          primary_stone: { type: Type.STRING },
          secondary_stones: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          stone_cut: { type: Type.STRING },
          setting_style: { type: Type.STRING },
          jewelry_category: { type: Type.STRING },
          visual_confidence: { type: Type.INTEGER }
        },
        required: [
          "detected_materials",
          "primary_stone",
          "secondary_stones",
          "stone_cut",
          "setting_style",
          "jewelry_category",
          "visual_confidence"
        ]
      },
      listing_content: {
        type: Type.OBJECT,
        properties: {
          seo_title: { type: Type.STRING },
          luxury_narrative: { type: Type.STRING },
          technical_bullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: [
          "seo_title",
          "luxury_narrative",
          "technical_bullets"
        ]
      },
      social_media: {
        type: Type.OBJECT,
        properties: {
          instagram_caption: { type: Type.STRING },
          alt_text: { type: Type.STRING }
        },
        required: [
          "instagram_caption",
          "alt_text"
        ]
      },
      seo_tags: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    };

    const responseRequired = [
      "product_metadata",
      "listing_content",
      "social_media",
      "seo_tags"
    ];

    if (includeAppraisal) {
      responseProperties.visual_appraisal = {
        type: Type.OBJECT,
        properties: {
          appraisal_status: { type: Type.STRING, description: "Must be 'estimate_available' or 'insufficient_visual_evidence'" },
          currency: { type: Type.STRING, description: "Default is 'USD'" },
          low_estimate: { type: Type.NUMBER, description: "Low visual estimate of appraisal range in USD, or null if insufficient evidence" },
          high_estimate: { type: Type.NUMBER, description: "High visual estimate of appraisal range in USD, or null if insufficient evidence" },
          confidence: { type: Type.STRING, description: "Must be 'low' or 'medium'" },
          visual_clarity_score: { type: Type.INTEGER, description: "Score between 0 and 100 based on image clarity for appraisal assessment" },
          basis: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Visible physical traits or characteristics supporting this estimate"
          },
          assumptions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Underlying assumptions made during this visual-only check (e.g. materials assumption, gemstone weights)"
          },
          missing_information: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Required details that are not determinable from a photograph"
          },
          value_change_factors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Factors that could significantly increase or decrease actual market/resale value"
          },
          disclaimer: { type: Type.STRING, description: "MUST MATCH EXACTLY: 'This visual estimate is for preliminary content planning only and is not a certified appraisal, insurance value, resale guarantee, or authentication.'" }
        },
        required: [
          "appraisal_status",
          "currency",
          "low_estimate",
          "high_estimate",
          "confidence",
          "visual_clarity_score",
          "basis",
          "assumptions",
          "missing_information",
          "value_change_factors",
          "disclaimer"
        ]
      };
      responseRequired.push("visual_appraisal");
    }

    const responseSchema = {
      type: Type.OBJECT,
      properties: responseProperties,
      required: responseRequired
    };

    // We try to call 'gemini-3.1-flash-lite' first.
    // If it's not available, we gracefully fall back to 'gemini-3.5-flash'.
    let responseText = "";
    try {
      console.log("Attempting generation with gemini-3.1-flash-lite...");
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: { parts: [imagePart, textPart] },
        config: {
          temperature: 0.1,
          systemInstruction: dynamicSystemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });
      responseText = response.text || "";
    } catch (error: any) {
      console.warn("gemini-3.1-flash-lite failed or is unavailable. Falling back to gemini-3.5-flash...", error.message || error);
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
          temperature: 0.1,
          systemInstruction: dynamicSystemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });
      responseText = response.text || "";
    }

    if (!responseText) {
      throw new Error("Received an empty response from Gemini.");
    }

    // Parse response
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch (parseErr: any) {
      console.error("JSON Parsing failed for model response:", responseText);
      res.status(500).json({
        error: "Failed to parse model response into JSON format.",
        rawResponse: responseText
      });
      return;
    }

    // Run first-pass Zod validation
    let validationResult = gemsightSchema.safeParse(parsedData);

    if (!validationResult.success) {
      // Extract error details to guide correction
      const errorMsg = validationResult.error.issues
        .map(err => `"${err.path.join(".")}": ${err.message}`)
        .join("; ");
      
      console.warn(`Zod Validation failed on first attempt. Error details: ${errorMsg}. Requesting Gemini correction...`);

      // Ask Gemini to correct the invalid fields once
      const correctionTextPart = {
        text: `Your previous response failed validation with the following errors:
${errorMsg}

Please generate a corrected JSON response conforming EXACTLY to the requested schema and constraints. Pay critical attention to these required rules:
- "product_metadata.visual_confidence" must be an integer between 0 and 100.
- "listing_content.seo_title" must contain no more than 60 characters.
- "listing_content.luxury_narrative" must contain EXACTLY 150 words (current word count is ${getWordCount(parsedData.listing_content?.luxury_narrative)}). Do not use banned words: stunning, beautiful, must-have.
- "listing_content.technical_bullets" must contain between 3 and 5 entries.
- "social_media.instagram_caption" must contain EXACTLY 5 hashtags (current count is ${getHashtagCount(parsedData.social_media?.instagram_caption)}).
- "seo_tags" must contain EXACTLY 10 entries.
${includeAppraisal ? `- "visual_appraisal" object must be present and conform to its schema (if appraisal_status is 'insufficient_visual_evidence', low_estimate and high_estimate must be null, visual_clarity_score must be between 0 and 100, and disclaimer must be exactly 'This visual estimate is for preliminary content planning only and is not a certified appraisal, insurance value, resale guarantee, or authentication.').` : ""}

Failed Response:
${JSON.stringify(parsedData)}`
      };

      try {
        console.log("Attempting Gemini corrective recovery...");
        const correctionResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: { parts: [imagePart, correctionTextPart] },
          config: {
            temperature: 0.1,
            systemInstruction: dynamicSystemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          }
        });
        const correctedText = correctionResponse.text || "";
        const correctedData = JSON.parse(correctedText.trim());

        // Validate the corrected response
        const secondValidation = gemsightSchema.safeParse(correctedData);
        if (secondValidation.success) {
          console.log("Gemini corrective recovery succeeded!");
          parsedData = correctedData;
          validationResult = secondValidation;
        } else {
          const secondErrorMsg = secondValidation.error.issues
            .map(err => `"${err.path.join(".")}": ${err.message}`)
            .join("; ");
          console.error(`Gemini corrective recovery failed Zod validation: ${secondErrorMsg}`);
          res.status(500).json({
            error: `Self-healing correction failed validation: ${secondErrorMsg}`,
            rawResponse: correctedData
          });
          return;
        }
      } catch (correctionErr: any) {
        console.error("Error during corrective recovery:", correctionErr);
        res.status(500).json({
          error: `First attempt failed validation: ${errorMsg}. Corrective attempt failed with error: ${correctionErr.message}`,
          rawResponse: parsedData
        });
        return;
      }
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error("API Error during profile generation:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred during analysis." });
  }
});

// Configure Vite middleware / Serve static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Gemsight backend listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
