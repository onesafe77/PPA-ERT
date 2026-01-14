import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// This file structures the service. In the ChatAI component we are instantiating 
// directly for the sake of the single-file/demo constraint showing local state,
// but in a production app, this service would handle the singleton.

let ai: GoogleGenAI | null = null;

export const initializeGenAI = () => {
    if (process.env.API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
}

export const generateSafetyInsight = async (prompt: string): Promise<string> => {
    if (!ai) {
        initializeGenAI();
        if (!ai) throw new Error("API Key not configured");
    }

    try {
        const response: GenerateContentResponse = await ai!.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert Safety Officer assistant. Provide concise, actionable advice in Indonesian.",
            }
        });
        return response.text || "No response generated.";
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
}
