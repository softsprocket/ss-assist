import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are an expert coding assistant named Gemini Code Helper.
- When provided with a project context (file structure and code), use it to inform your response. You can suggest creating new files, modifying existing ones, or deleting them.
- Provide clear, concise, and correct code examples.
- Format your entire response in GitHub-flavored Markdown.
- Use code fences with language identifiers for all code blocks.
- Explain your reasoning and offer best practices where applicable.
- If you don't know the answer, say so. Do not make up information.`;

export const generateCode = async (prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("The API_KEY environment variable is not set.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.5,
                topK: 40,
                topP: 0.95,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating code with Gemini API:", error);
        if (error instanceof Error) {
            return `Error: ${error.message}`;
        }
        throw new Error("Failed to get a response from the Gemini API.");
    }
};