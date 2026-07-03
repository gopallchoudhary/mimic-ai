import { generateAIResponse } from "@/ai/response";
import { personas } from "@/data/personas";
import { PersonaTone } from "@/data/types";
import { createUIMessageStreamResponse, toUIMessageStream, convertToModelMessages, UIMessage } from "ai";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, personaId, tone = "default", temperature = 0.7 } = body as {
            messages: UIMessage[];
            personaId: string;
            tone?: PersonaTone;
            temperature?: number;
        };

        // Find the persona by ID
        const persona = personas.find((p) => p.id === personaId);

        if (!persona) {
            return new Response(JSON.stringify({ error: "Persona not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Convert UI messages to model messages
        const modelMessages = await convertToModelMessages(messages);

        // Generate AI response with streaming
        const result = await generateAIResponse(
            modelMessages,
            persona,
            tone,
            temperature
        );

        // Return the streaming response
        return createUIMessageStreamResponse({
            stream: toUIMessageStream({ stream: result.stream }),
        });
    } catch (error) {
        console.error("Error in chat API:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        return new Response(
            JSON.stringify({ 
                error: "Internal server error",
                details: error instanceof Error ? error.message : String(error)
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
