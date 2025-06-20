
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AiMode, FlexContainer, FlexBubble, FlexCarousel } from "../types"; // Added FlexBubble, FlexCarousel
import { stripIds } from "../utils/flexTransform";

// This service uses the API key provided by the user and stored in localStorage.
// The `process.env.API_KEY` is NOT used here as per the prompt instructions for runtime.

const MODEL_TEXT = 'gemini-2.5-flash-preview-04-17'; // General tasks
// const MODEL_IMAGE = 'imagen-3.0-generate-002'; // For image generation, if needed later

const cleanJsonString = (jsonStr: string): string => {
  let cleaned = jsonStr.trim();
  // Remove markdown fences (```json ... ``` or ``` ... ```)
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleaned.match(fenceRegex);
  if (match && match[2]) {
    cleaned = match[2].trim();
  }
  return cleaned;
};

export const callGeminiApi = async (
  apiKey: string,
  prompt: string,
  mode: AiMode,
  currentDesignJson?: string // JSON string of current design for "Improve" mode
): Promise<FlexContainer> => {
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  let fullPrompt = "";
  if (mode === AiMode.Generate) {
  fullPrompt = `You are an expert LINE Flex Message designer, specializing in modern, visually appealing designs. Create a valid LINE Flex Message JSON (either a single Bubble or a Carousel) based on the following request: "${prompt}".
  Design Principles (Inspired by Tailwind CSS/Material UI): Use a harmonious and modern color palette. Prefer muted tones with occasional vibrant accents. Think about primary, secondary, and accent colors, and their variations (e.g., light, dark). 
  Utilize consistent spacing (e.g., multiples of 4px or 8px) for padding, margins, and component separation to create a clean, breathable layout. Employ a clear and legible font stack. Vary font sizes and weights judiciously for hierarchy (e.g., larger, bolder for titles; smaller, lighter for supporting text). 
  Apply subtle box shadows for depth and emphasis, mimicking material design's elevation concept where appropriate (e.g., for cards or prominent buttons). Focus on a clean, uncluttered aesthetic with good contrast and readability. 
  The JSON output should strictly follow the LINE Flex Message specification. Ensure all component types and properties are valid. The 'hero' component (if present in a bubble) should NOT contain an 'alt' field. The overall message altText is handled separately. Output ONLY the raw JSON object, without any surrounding text, explanations, or markdown fences. 
  For example, if a bubble is requested, output should start with {"type": "bubble", ...}. If a carousel, {"type": "carousel", ...}. Use placeholder image URLs like 'https://picsum.photos/seed/example/600/400' if images are needed. Max 2 bubbles in a carousel for simplicity.`;
  } else if (mode === AiMode.Improve && currentDesignJson) {
    fullPrompt = `You are an expert LINE Flex Message designer. Given the following LINE Flex Message JSON:
    \`\`\`json
    ${currentDesignJson}
    \`\`\`
    Apply the following improvements based on this request: "${prompt}".
    Return the fully modified LINE Flex Message JSON (either a single Bubble or a Carousel).
    The JSON output should strictly follow the LINE Flex Message specification. Ensure all component types and properties are valid.
    The 'hero' component (if present in a bubble) should NOT contain an 'alt' field. The overall message altText is handled separately.
    Output ONLY the raw JSON object, without any surrounding text, explanations, or markdown fences.
    For example, if a bubble is requested, output should start with {"type": "bubble", ...}. If a carousel, {"type": "carousel", ...}.
    Make it visually appealing.`;
  } else {
    throw new Error("Invalid AI mode or missing current design for improvement.");
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: fullPrompt,
        config: {
            responseMimeType: "application/json", // Request JSON output
            // Omit thinkingConfig for higher quality (default enabled)
        }
    });

    const rawJsonText = response.text;
    if (!rawJsonText) {
      throw new Error("Gemini API returned an empty response.");
    }
    
    const cleanedJson = cleanJsonString(rawJsonText);

    const parsedJson = JSON.parse(cleanedJson) as FlexContainer; // Assume it's a FlexContainer initially

    // Sanitize: Remove 'alt' from hero if present
    if (parsedJson.type === 'bubble') {
      const bubble = parsedJson as FlexBubble;
      if (bubble.hero && typeof bubble.hero === 'object' && bubble.hero !== null) {
        if ('alt' in bubble.hero) {
          console.warn("Gemini AI generated an 'alt' field in hero. Sanitizing it out.");
          delete (bubble.hero as any).alt;
        }
      }
    } else if (parsedJson.type === 'carousel') {
      const carousel = parsedJson as FlexCarousel;
      if (Array.isArray(carousel.contents)) {
        carousel.contents.forEach((bubble: FlexBubble) => {
          if (bubble && bubble.type === 'bubble' && bubble.hero && typeof bubble.hero === 'object' && bubble.hero !== null) {
            if ('alt' in bubble.hero) {
              console.warn("Gemini AI generated an 'alt' field in a carousel bubble's hero. Sanitizing it out.");
              delete (bubble.hero as any).alt;
            }
          }
        });
      }
    }


    // Basic validation for LINE Flex Message structure
    if (!parsedJson.type || (parsedJson.type !== 'bubble' && parsedJson.type !== 'carousel')) {
      console.error("Parsed JSON is not a valid Flex Message container:", parsedJson);
      throw new Error("AI response is not a valid LINE Flex Message (Bubble or Carousel). Please try a more specific prompt.");
    }
    
    return parsedJson;

  } catch (error: any) {
    console.error("Error calling Gemini API or parsing response:", error);
    let errorMessage = "Failed to generate Flex Message with AI.";
    if (error.message) {
        errorMessage += ` Details: ${error.message}`;
    }
    if (error.message && error.message.includes("API key not valid")) {
        errorMessage = "Invalid Gemini API Key. Please check your settings.";
    } else if (error instanceof SyntaxError) {
        errorMessage = "AI returned an invalid JSON structure. Try refining your prompt for a clearer JSON output. The raw AI output was: " + (error as any).rawResponseTextForDebug;
    }
    throw new Error(errorMessage);
  }
};
