
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AiMode, FlexContainer, FlexBubble, FlexCarousel, FlexComponent, FlexButton, FlexBox, FlexImage } from "../types";
// stripIds is not used in this service, it's for preparing output in JsonViewModal
// import { stripIds } from "../utils/flexTransform";

const MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

const cleanJsonString = (jsonStr: string): string => {
  let cleaned = jsonStr.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleaned.match(fenceRegex);
  if (match && match[2]) {
    cleaned = match[2].trim();
  }
  return cleaned;
};

// Recursive function to sanitize components, e.g., button height
const sanitizeComponents = (component: any): void => {
  if (!component || typeof component !== 'object') {
    return;
  }

  // Sanitize FlexButton height
  if (component.type === 'button') {
    const button = component as FlexButton;
    if (button.height && button.height !== 'sm' && button.height !== 'md') {
      console.warn(`AI generated an invalid height ("${button.height}") for a button (ID: ${button.id || 'N/A'}). Sanitizing it out.`);
      delete (button as any).height;
    }
  }

  // Recursively sanitize children
  if (component.type === 'box' && Array.isArray(component.contents)) {
    component.contents.forEach(sanitizeComponents);
  } else if (component.type === 'bubble') {
    const bubble = component as FlexBubble;
    if (bubble.header) sanitizeComponents(bubble.header);
    if (bubble.hero) sanitizeComponents(bubble.hero);
    if (bubble.body) sanitizeComponents(bubble.body);
    if (bubble.footer) sanitizeComponents(bubble.footer);
  } else if (component.type === 'carousel' && Array.isArray(component.contents)) {
    component.contents.forEach(sanitizeComponents);
  }
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

  const commonInstructions = `
    The JSON output should strictly follow the LINE Flex Message specification. 
    Ensure all component types (bubble, carousel, box, text, image, button, icon, separator, spacer, etc.), their properties, and the valid values for those properties are correct.
    For example, FlexButton height can only be 'sm' or 'md'. Do not use other values.
    The 'hero' component (if present in a bubble) should NOT contain an 'alt' field. The overall message altText is handled separately.
    Incorporate relevant emojis within text content where appropriate for a youthful and engaging tone.
    Suggest or use icon URLs (for FlexIcon) or image URLs (for FlexImage) that fit a vibrant, modern aesthetic. Use placeholder image URLs like 'https://picsum.photos/seed/example/600/400' if actual images are not specified in the prompt.
    Employ vibrant and appealing color schemes suitable for a younger audience.
    Before finalizing the response, rigorously double-check the generated JSON output against the LINE Flex Message specification.
    Output ONLY the raw JSON object, without any surrounding text, explanations, or markdown fences.
    If a bubble is requested, output should start with {"type": "bubble", ...}. If a carousel, {"type": "carousel", ...}. Max 2 bubbles in a carousel unless specified.
    Make it visually appealing and ready for practical use.
  `;

  let fullPrompt = "";
  if (mode === AiMode.Generate) {
    fullPrompt = `You are an expert LINE Flex Message designer. Create a valid LINE Flex Message JSON (either a single Bubble or a Carousel) based on the following request: "${prompt}".
    ${commonInstructions}`;
  } else if (mode === AiMode.Improve && currentDesignJson) {
    fullPrompt = `You are an expert LINE Flex Message designer. Given the following LINE Flex Message JSON:
    \`\`\`json
    ${currentDesignJson}
    \`\`\`
    Apply the following improvements based on this request: "${prompt}".
    Return the fully modified LINE Flex Message JSON (either a single Bubble or a Carousel).
    ${commonInstructions}`;
  } else {
    throw new Error("Invalid AI mode or missing current design for improvement.");
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: fullPrompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    const rawJsonText = response.text;
    if (!rawJsonText) {
      throw new Error("Gemini API returned an empty response.");
    }
    
    const cleanedJson = cleanJsonString(rawJsonText);
    let parsedJson: FlexContainer;

    try {
        parsedJson = JSON.parse(cleanedJson) as FlexContainer;
    } catch (parseError: any) {
        console.error("Failed to parse JSON from AI:", cleanedJson, parseError);
        throw new SyntaxError("AI returned an invalid JSON structure. Try refining your prompt. Raw AI output: " + cleanedJson);
    }
    

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

    // Apply further sanitization (e.g., button height)
    sanitizeComponents(parsedJson);


    if (!parsedJson.type || (parsedJson.type !== 'bubble' && parsedJson.type !== 'carousel')) {
      console.error("Parsed JSON is not a valid Flex Message container:", parsedJson);
      throw new Error("AI response is not a valid LINE Flex Message (Bubble or Carousel). Please try a more specific prompt.");
    }
    
    return parsedJson;

  } catch (error: any) {
    console.error("Error calling Gemini API or processing response:", error);
    let errorMessage = "Failed to generate Flex Message with AI.";
    if (error.message) {
        errorMessage += ` Details: ${error.message}`;
    }
    if (error.message && error.message.includes("API key not valid")) {
        errorMessage = "Invalid Gemini API Key. Please check your settings.";
    } else if (error instanceof SyntaxError) {
        // SyntaxError from our custom throw for parsing issues
        errorMessage = error.message; // Use the message from the custom SyntaxError
    }
    throw new Error(errorMessage);
  }
};
