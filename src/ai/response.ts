import { IPersona, PersonaTone } from "@/data/types";
import { basePromptGenerator } from "./basePromptGenerator";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const client = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_BASE_URL,
});


export async function generateAIResponse(
    message: string,
    temperature: number = 0.7,
    persona: IPersona[],
    personaTone: PersonaTone = "default",
) {
    try {
        const currentPersona = persona[0]
        const basePrompt = basePromptGenerator(currentPersona, personaTone);

        const userInstruction = `
        TASK:
        Respond to this message: "${message}"
        RESPONSE GUIDELINES:
        - Respond in Hinglish style as ${currentPersona.name}
        - Keep your response to 3-4 Lines
        - Stay true to your unique voice and personality`;
        const prompt = basePrompt + "\n\n" + userInstruction;

        const result = streamText({
            model: client('gpt-4o-mini'),
            prompt,
            temperature,

        })



        //. 
    } catch (error) {
        console.error("Error generating AI response:", error);
    }
}
