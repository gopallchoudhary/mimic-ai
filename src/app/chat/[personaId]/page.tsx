"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useParams, useRouter } from "next/navigation";
import { personas } from "@/data/personas";
import { PersonaTone } from "@/data/types";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ToneSelector } from "@/components/ToneSelector";
import { TemperatureSlider } from "@/components/TemperatureSlider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const personaId = params.personaId as string;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [tone, setTone] = useState<PersonaTone>("default");
    const [temperature, setTemperature] = useState(0.7);

    // Find the persona
    const persona = personas.find((p) => p.id === personaId);

    // Redirect if persona not found
    useEffect(() => {
        if (!persona) {
            router.push("/");
        }
    }, [persona, router]);

    const { messages, sendMessage, isLoading, error, status } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
            body: () => ({
                personaId,
                tone,
                temperature,
            }),
        }),
        onError: (error) => {
            console.error("Chat error:", error);
        },
        onResponse: (response) => {
            console.log("Response received:", response);
        },
    });

    const [input, setInput] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim()) {
            console.log("Sending message:", input);
            sendMessage({ text: input });
            setInput("");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    // Log messages changes
    useEffect(() => {
        console.log("Messages updated:", messages);
    }, [messages]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!persona) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b">
                <div className="max-w-5xl mx-auto p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={persona.avatar} alt={persona.name} />
                                <AvatarFallback>{persona.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="font-semibold">{persona.name}</h1>
                                <p className="text-sm text-muted-foreground">{persona.title}</p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <ToneSelector selectedTone={tone} onToneChange={setTone} />
                        <TemperatureSlider value={temperature} onChange={setTemperature} />
                    </div>
                </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="max-w-5xl mx-auto p-4">
                        {error && (
                            <Card className="p-4 mb-4 bg-destructive/10 border-destructive">
                                <p className="text-sm text-destructive">Error: {error.message}</p>
                            </Card>
                        )}
                        {messages.length === 0 ? (
                            <Card className="p-8 text-center">
                                <Avatar className="h-20 w-20 mx-auto mb-4">
                                    <AvatarImage src={persona.avatar} alt={persona.name} />
                                    <AvatarFallback>{persona.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <h2 className="text-xl font-semibold mb-2">
                                    Start chatting with {persona.name}
                                </h2>
                                <p className="text-muted-foreground">
                                    Ask anything about {persona.expertise.join(", ")} and more!
                                </p>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <ChatMessage
                                        key={message.id}
                                        message={message}
                                        personaName={persona.name}
                                        personaAvatar={persona.avatar}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Input */}
            <div className="border-t bg-background">
                <div className="max-w-5xl mx-auto p-4">
                    <ChatInput
                        input={input}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}
