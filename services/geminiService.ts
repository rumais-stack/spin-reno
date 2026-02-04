
import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWheelOptions = async (topic: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 6 to 8 creative and distinct options for a decision wheel based on this topic: "${topic}". Make them concise (1-3 words).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 6-8 wheel segment options",
            },
          },
          required: ["options"],
        },
      },
    });

    const data = JSON.parse(response.text || '{"options": []}');
    return data.options;
  } catch (error) {
    console.error("Error generating options:", error);
    return [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4",
      "Option 5",
      "Option 6"
    ];
  }
};