import { generateAIResponse } from "@/ai/response";
import { personas } from "@/data/personas";
import { PersonaTone } from "@/data/types";
import { createUIMessageStreamResponse, toUIMessageStream, convertToModelMessages, UIMessage } from "ai";
import { auth } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── Rate limiter ─────────────────────────────────────────────────────────────
// 15 requests per 24-hour rolling window, keyed by Clerk userId
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(15, "24 h"),
    analytics: true,
    prefix: "mimic-ai:ratelimit",
});

// Bypass userId — set RATE_LIMIT_BYPASS_USER_ID in your .env to skip rate limiting
const BYPASS_USER_ID = process.env.RATE_LIMIT_BYPASS_USER_ID ?? "";

export async function POST(req: Request) {
    try {
        // ── Auth ──────────────────────────────────────────────────────────────
        const { userId } = await auth();

        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // ── Rate limit (skip for bypass account) ─────────────────────────────
        if (userId !== BYPASS_USER_ID) {
            const { success, limit, remaining, reset } = await ratelimit.limit(userId);

            if (!success) {
                const resetDate = new Date(reset);
                const now = Date.now();
                const msUntilReset = reset - now;
                const hoursLeft = Math.floor(msUntilReset / (1000 * 60 * 60));
                const minutesLeft = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));

                const timeMsg = hoursLeft > 0
                    ? `${hoursLeft}h ${minutesLeft}m`
                    : `${minutesLeft}m`;

                return new Response(
                    JSON.stringify({
                        error: `You've reached your daily limit of ${limit} messages. Your limit resets in ${timeMsg} (at ${resetDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}).`,
                        code: "RATE_LIMITED",
                        reset,
                        remaining: 0,
                    }),
                    {
                        status: 429,
                        headers: {
                            "Content-Type": "application/json",
                            "X-RateLimit-Limit": String(limit),
                            "X-RateLimit-Remaining": "0",
                            "X-RateLimit-Reset": String(reset),
                            "Retry-After": String(Math.ceil(msUntilReset / 1000)),
                        },
                    }
                );
            }

            // Optionally log remaining for debugging
            console.log(`[rate-limit] userId=${userId} remaining=${remaining}`);
        }

        // ── Parse body ────────────────────────────────────────────────────────
        const body = await req.json();
        const { messages, personaId, tone = "default", temperature = 0.6 } = body as {
            messages: UIMessage[];
            personaId: string;
            tone?: PersonaTone;
            temperature?: number;
        };

        // ── Find persona ─────────────────────────────────────────────────────
        const persona = personas.find((p) => p.id === personaId);

        if (!persona) {
            return new Response(JSON.stringify({ error: "Persona not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        // ── Generate & stream response ────────────────────────────────────────
        const modelMessages = await convertToModelMessages(messages);
        const result = await generateAIResponse(modelMessages, persona, tone, temperature);

        return createUIMessageStreamResponse({
            stream: toUIMessageStream({ stream: result.stream }),
        });

    } catch (error) {
        console.error("Error in chat API:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        return new Response(
            JSON.stringify({
                error: "Internal server error",
                details: error instanceof Error ? error.message : String(error),
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // If bypass account, return mock values
        if (userId === BYPASS_USER_ID) {
            return new Response(
                JSON.stringify({
                    remaining: -1, // Special value for bypass/admin
                    limit: 15,
                    bypass: true,
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Check the limit using rate: 0 (read-only)
        const { remaining, limit } = await ratelimit.limit(userId, { rate: 0 });

        return new Response(
            JSON.stringify({
                remaining,
                limit,
                bypass: false,
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error fetching rate limits:", error);
        return new Response(
            JSON.stringify({
                error: "Internal server error",
                details: error instanceof Error ? error.message : String(error),
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
