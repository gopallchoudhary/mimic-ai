"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useParams, useRouter } from "next/navigation";
import { personas } from "@/data/personas";
import { PersonaTone } from "@/data/types";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ToneSelector } from "@/components/ToneSelector";
import { TemperatureSlider } from "@/components/TemperatureSlider";
import { useChatStore } from "@/components/ChatStoreProvider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, Trash2, ShieldAlert } from "lucide-react";

export default function ChatPage() {
	const params = useParams();
	const router = useRouter();
	const personaId = params.personaId as string;
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const [tone, setTone] = useState<PersonaTone>("default");
	const [temperature, setTemperature] = useState(0.6);
	const [showSettings, setShowSettings] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// Chat store — preserves messages across persona switches
	const { getMessages, setMessages, clearMessages, getAllLastMessages } =
		useChatStore();

	// Find the persona
	const persona = personas.find((p) => p.id === personaId);

	// Redirect if persona not found
	useEffect(() => {
		if (!persona) {
			router.push("/");
		}
	}, [persona, router]);

	const {
		messages,
		sendMessage,
		setMessages: setChatMessages,
		error,
		status,
	} = useChat({
		// Restore saved messages for this persona on mount
		messages: getMessages(personaId),
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
	});

	// Sync messages back to the store whenever they change
	useEffect(() => {
		setMessages(personaId, messages);
	}, [messages, personaId, setMessages]);

	// Clear chat handler
	const handleClearChat = () => {
		clearMessages(personaId);
		setChatMessages([]);
	};

	const isLoading = status === "submitted" || status === "streaming";

	const [input, setInput] = useState("");

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (input.trim()) {
			sendMessage({ text: input });
			setInput("");
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
	};

	// Helper to extract text content from a UIMessage
	const getMessageText = (msg: any): string => {
		if (Array.isArray(msg.parts)) {
			return msg.parts
				.filter((p: any) => p.type === "text")
				.map((p: any) => p.text || "")
				.join("");
		}
		return "";
	};

	// Filter out empty assistant messages (AI SDK adds a placeholder with empty parts while streaming starts)
	const renderedMessages = useMemo(() => {
		return messages.filter((msg) => {
			if (msg.role === "user") return true;
			return getMessageText(msg).trim().length > 0;
		});
	}, [messages]);

	// Build sidebar preview map: all stored personas + live current persona preview
	const lastMessages = useMemo<Record<string, string>>(() => {
		// Start from the persisted store (covers all other personas)
		const base = getAllLastMessages();
		// Override / update the current persona with the live rendered messages
		if (renderedMessages.length > 0) {
			const last = renderedMessages[renderedMessages.length - 1];
			const text = getMessageText(last);
			if (text.trim().length > 0) {
				base[personaId] = text.slice(0, 80);
			}
		}
		return base;
	}, [personaId, renderedMessages, getAllLastMessages]);

	const showTypingIndicator =
		isLoading &&
		(renderedMessages.length === 0 ||
			renderedMessages[renderedMessages.length - 1].role === "user");

	// Auto-scroll to bottom when new messages arrive or typing status changes
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, showTypingIndicator]);

	if (!persona) {
		return null;
	}

	return (
		<div className="relative flex h-screen overflow-hidden bg-background">
			{/* Sexy Blue Background Grid & Glow for Chatroom */}
			<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background to-cyan-500/5 dark:from-blue-950/10 dark:via-background dark:to-cyan-950/5 pointer-events-none" />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/[0.03] dark:bg-blue-400/[0.02] blur-[80px] rounded-full pointer-events-none" />
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

			{/* Left Sidebar */}
			<ChatSidebar
				currentPersonaId={personaId}
				lastMessages={lastMessages}
				isOpen={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
			/>

			{/* Main column */}
			<div className="relative z-10 flex flex-1 flex-col min-w-0 h-screen bg-background/30 dark:bg-background/5">
				{/* Header */}
				<header className="shrink-0 border-b border-border/40 bg-background/50 backdrop-blur-md">
					<div className="flex items-center gap-3 p-4">
						{/* Hamburger — mobile only */}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden shrink-0"
							onClick={() => setSidebarOpen(true)}
							aria-label="Open sidebar"
						>
							<Menu className="h-4 w-4" />
						</Button>

						<div className="relative shrink-0">
							<Avatar className="h-10 w-10 border border-white/20 dark:border-white/10">
								<AvatarImage src={persona.avatar} alt={persona.name} />
								<AvatarFallback>{persona.name.substring(0, 2)}</AvatarFallback>
							</Avatar>
							<span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background animate-pulse" />
						</div>

						<div className="min-w-0 flex-1">
							<h1 className="font-semibold truncate">{persona.name}</h1>
							<p className="text-xs text-muted-foreground truncate">
								{persona.title}
							</p>
						</div>

						{/* Clear chat */}
						<Button
							variant="ghost"
							size="icon"
							className="shrink-0 text-muted-foreground hover:text-destructive transition-colors ml-auto"
							onClick={handleClearChat}
							title="Clear chat history"
							aria-label="Clear chat history"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</header>

				{/* Chat Messages */}
				<div className="flex-1 overflow-hidden">
					<ScrollArea className="h-full">
						<div className="max-w-3xl mx-auto p-4 md:p-6">
							{error && (
								error.message?.includes("daily limit") || error.message?.includes("RATE_LIMITED") ? (
									// Rate limit banner
									<Card className="p-5 mb-4 border-amber-500/40 bg-amber-500/10 dark:bg-amber-400/5 backdrop-blur-sm">
										<div className="flex items-start gap-3">
											<ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
											<div>
												<p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">Daily limit reached</p>
												<p className="text-sm text-amber-700/80 dark:text-amber-300/70">{error.message}</p>
											</div>
										</div>
									</Card>
								) : (
									// Generic error
									<Card className="p-4 mb-4 bg-destructive/10 border-destructive">
										<p className="text-sm text-destructive">Error: {error.message}</p>
									</Card>
								)
							)}
							{/* Welcome card — only when no messages and not loading */}
							{renderedMessages.length === 0 && !isLoading && (
								<Card className="p-8 text-center border border-white/20 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] backdrop-blur-md">
									<Avatar className="h-20 w-20 mx-auto mb-4 border border-white/30 dark:border-white/10">
										<AvatarImage src={persona.avatar} alt={persona.name} />
										<AvatarFallback>
											{persona.name.substring(0, 2)}
										</AvatarFallback>
									</Avatar>
									<h2 className="text-xl font-semibold mb-2">
										Start chatting with {persona.name}
									</h2>
									<p className="text-sm text-muted-foreground/90 max-w-md mx-auto">
										Ask anything about {persona.expertise.join(", ")} and more!
									</p>
								</Card>
							)}

							{/* Messages list */}
							{renderedMessages.length > 0 && (
								<div className="space-y-4">
									{renderedMessages.map((message) => (
										<ChatMessage
											key={message.id}
											message={message}
											personaName={persona.name}
											personaAvatar={persona.avatar}
										/>
									))}
								</div>
							)}

							{/* Typing indicator — shown at bottom regardless of message count */}
							{showTypingIndicator && (
								<div className="flex gap-3 mt-4 mb-5 animate-slide-up justify-start">
									<Avatar className="h-8 w-8 flex-shrink-0 border border-border/40">
										<AvatarImage src={persona.avatar} alt={persona.name} />
										<AvatarFallback>
											{persona.name.substring(0, 2)}
										</AvatarFallback>
									</Avatar>
									<div className="rounded-2xl px-4 py-3 bg-white/45 dark:bg-white/[0.02] backdrop-blur-md border border-white/30 dark:border-white/10 rounded-tl-none shadow-sm">
										<div className="flex items-center gap-1.5 py-1 select-none">
											<span
												className="h-2.5 w-2.5 rounded-full bg-foreground/60 animate-typing-dot"
												style={{ animationDelay: "0ms" }}
											/>
											<span
												className="h-2.5 w-2.5 rounded-full bg-foreground/60 animate-typing-dot"
												style={{ animationDelay: "150ms" }}
											/>
											<span
												className="h-2.5 w-2.5 rounded-full bg-foreground/60 animate-typing-dot"
												style={{ animationDelay: "300ms" }}
											/>
										</div>
									</div>
								</div>
							)}

							<div ref={messagesEndRef} />
						</div>
					</ScrollArea>
				</div>

				{/* Input */}
				<div className="shrink-0 border-t border-border/40 bg-background/50 backdrop-blur-md">
					<div className="max-w-3xl mx-auto p-4">
						<ChatInput
							input={input}
							handleInputChange={handleInputChange}
							handleSubmit={handleSubmit}
							isLoading={isLoading}
							showSettings={showSettings}
							onSettingsToggle={() => setShowSettings((prev) => !prev)}
							settingsPanel={
								<div className="flex flex-col gap-3">
									<ToneSelector selectedTone={tone} onToneChange={setTone} />
									<TemperatureSlider
										value={temperature}
										onChange={setTemperature}
									/>
								</div>
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
