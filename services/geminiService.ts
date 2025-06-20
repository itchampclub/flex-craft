
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AiMode, FlexContainer } from "../types";
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
    fullPrompt = `You are an expert LINE Flex Message designer. Create a valid LINE Flex Message JSON (either a single Bubble or a Carousel) based on the following request: "${prompt}".
    The JSON output should strictly follow the LINE Flex Message specification. Ensure all component types and properties are valid.
    Output ONLY the raw JSON object, without any surrounding text, explanations, or markdown fences.
    For example, if a bubble is requested, output should start with {"type": "bubble", ...}. If a carousel, {"type": "carousel", ...}.
    Use placeholder image URLs like 'https://picsum.photos/seed/example/600/400' if images are needed. Max 2 bubbles in a carousel for simplicity.
    Make it visually appealing.`;
  } else if (mode === AiMode.Improve && currentDesignJson) {
    fullPrompt = `You are an expert LINE Flex Message designer. Given the following LINE Flex Message JSON:
    \`\`\`json
    ${currentDesignJson}
    \`\`\`
    Apply the following improvements based on this request: "${prompt}".
    Return the fully modified LINE Flex Message JSON (either a single Bubble or a Carousel).
    The JSON output should strictly follow the LINE Flex Message specification. Ensure all component types and properties are valid.
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

    const parsedJson = JSON.parse(cleanedJson);

    // Basic validation for LINE Flex Message structure
    if (!parsedJson.type || (parsedJson.type !== 'bubble' && parsedJson.type !== 'carousel')) {
      console.error("Parsed JSON is not a valid Flex Message container:", parsedJson);
      throw new Error("AI response is not a valid LINE Flex Message (Bubble or Carousel). Please try a more specific prompt.");
    }
    
    // The parsedJson is LineApiFlexContainer (no IDs). We will add IDs in the reducer.
    return parsedJson as FlexContainer; // Type assertion, IDs will be added later

  } catch (error: any) {
    console.error("Error calling Gemini API or parsing response:", error);
    let errorMessage = "Failed to generate Flex Message with AI.";
    if (error.message) {
        errorMessage += ` Details: ${error.message}`;
    }
    if (error.message && error.message.includes("API key not valid")) {
        errorMessage = "Invalid Gemini API Key. Please check your settings.";
    } else if (error instanceof SyntaxError) {
        errorMessage = "AI returned an invalid JSON structure. Try refining your prompt for a clearer JSON output.";
    }
    // TODO: Handle specific Gemini API errors if possible by inspecting `error` properties
    throw new Error(errorMessage);
  }
};
