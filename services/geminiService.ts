import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This will be caught by the calling function's try-catch block.
  // In a real app, this check might happen at app startup.
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Analyzes an image of an artifact using the Gemini model.
 * @param imageBase64 The base64-encoded image data.
 * @param mimeType The MIME type of the image.
 * @returns A promise that resolves to the text analysis from the AI.
 */
export async function identifyArtifact(imageBase64: string, mimeType: string): Promise<string> {
  try {
    const model = 'gemini-2.5-flash';

    const prompt = `You are a world-renowned archaeologist with a specialization in ancient artifacts. 
    Analyze the provided image of an object.
    
    Your task is to:
    - **Identify the object:** What is it? (e.g., "Amphora", "Flint Arrowhead", "Roman Coin"). If it is not an artifact, state that clearly and stop.
    - **Describe its appearance:** Detail its key visual features.
    - **Estimate its origin:** Suggest the most likely civilization, culture, and geographical region.
    - **Estimate the time period:** Provide a likely date range (e.g., "Late Bronze Age, c. 1600-1200 BCE").
    - **Suggest materials:** What is it likely made of? (e.g., "Terracotta clay", "Bronze", "Chert").
    - **Explain its purpose:** Describe its common use or function in its historical context.

    Format your response clearly. Use markdown bold for headings only (like '**Identification**'). Do not use any other asterisks for emphasis in the body of the text. Do not use numbering or hashtags for the sections.`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [textPart, imagePart] },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        // You can add more specific error handling here based on error types from the SDK
        return Promise.reject(new Error("Failed to communicate with the AI model. Please try again later."));
    }
    return Promise.reject(new Error("An unknown error occurred while analyzing the artifact."));
  }
}

/**
 * Generates a short, funny story about an artifact.
 * @param artifactInfo The text description of the artifact.
 * @returns A promise that resolves to the story text from the AI.
 */
export async function generateArtifactStory(artifactInfo: string): Promise<string> {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `Based on the following artifact description, write a short, funny, and engaging story for a general audience. The story should creatively feature the artifact. Make the story about 2-3 paragraphs long and give it a fun title. Format the title with markdown bold like **My Awesome Title**. Do not use any asterisks for emphasis in the body of the story.

Artifact Description:
${artifactInfo}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API call for story failed:", error);
    if (error instanceof Error) {
        return Promise.reject(new Error("Failed to communicate with the AI model for story generation."));
    }
    return Promise.reject(new Error("An unknown error occurred while writing the story."));
  }
}