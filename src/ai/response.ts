import { IPersona, PersonaTone } from "@/data/types";
import { basePromptGenerator } from "./basePromptGenerator";
import { streamText, ModelMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const client = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_BASE_URL,
});

export async function generateAIResponse(
    messages: ModelMessage[],
    persona: IPersona,
    personaTone: PersonaTone = "default",
    temperature: number = 0.6,
) {
    try {
        const systemPrompt = basePromptGenerator(persona, personaTone);

        const result = streamText({
            model: client('openrouter/free'),
            system: systemPrompt,
            messages,
            temperature,
        });

        return result;
    } catch (error) {
        console.error("Error generating AI response:", error);
        throw error;
    }
}
