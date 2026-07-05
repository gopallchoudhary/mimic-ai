"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Menu, Trash2, ShieldAlert, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
	const params = useParams();
	const router = useRouter();
	const personaId = params.personaId as string;
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const [tone, setTone] = useState<PersonaTone>("default");
	const [temperature, setTemperature] = useState(0.6);
	const [showSettings, setShowSettings] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [messagesLeft, setMessagesLeft] = useState<number | null>(null);

	// Chat store — preserves messages across persona switches
	const { getMessages, setMessages, clearMessages, getAllLastMessages } =
		useChatStore();

	const [showScrollButton, setShowScrollButton] = useState(false);
	const [hasNewMessages, setHasNewMessages] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

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

	const isLoading = status === "submitted" || status === "streaming";

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

	const showTypingIndicator =
		isLoading &&
		(renderedMessages.length === 0 ||
			renderedMessages[renderedMessages.length - 1].role === "user");

	// Sync messages back to the store whenever they change
	useEffect(() => {
		setMessages(personaId, messages);
	}, [messages, personaId, setMessages]);

	// Scroll container to bottom
	const scrollToBottom = useCallback(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
		}
		setHasNewMessages(false);
	}, []);

	// Handle viewport scroll events
	const handleScroll = useCallback(() => {
		if (scrollContainerRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
			const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
			setShowScrollButton(!isNearBottom);
			if (isNearBottom) {
				setHasNewMessages(false);
			}
		}
	}, []);

	// Auto-scroll when messages change or typing indicator status toggles
	const prevMessagesLength = useRef(messages.length);
	useEffect(() => {
		if (scrollContainerRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
			const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;

			if (messages.length > prevMessagesLength.current) {
				if (isNearBottom) {
					setTimeout(scrollToBottom, 30);
				} else {
					setHasNewMessages(true);
				}
			}
		}
		prevMessagesLength.current = messages.length;
	}, [messages, scrollToBottom]);

	useEffect(() => {
		if (scrollContainerRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
			const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;
			if (isNearBottom) {
				setTimeout(scrollToBottom, 30);
			}
		}
	}, [showTypingIndicator, scrollToBottom]);

	// Fetch remaining message limits from the server
	const fetchLimits = useCallback(async () => {
		try {
			const res = await fetch("/api/chat");
			if (res.ok) {
				const data = await res.json();
				setMessagesLeft(data.remaining);
			}
		} catch (err) {
			console.error("Failed to fetch rate limits:", err);
		}
	}, []);

	// Sync limits on mount, persona change, or when message history length changes
	useEffect(() => {
		fetchLimits();
	}, [personaId, messages.length, fetchLimits]);

	// Clear chat handler
	const handleClearChat = () => {
		clearMessages(personaId);
		setChatMessages([]);
		setMessagesLeft(15); // Reset limit visually on clear
	};


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

						{/* Actions (Limits + Clear Chat) */}
						<div className="flex items-center gap-3 shrink-0 ml-auto">
							{/* Limits left */}
							{messagesLeft !== null && (
								<span
									className={cn(
										"text-[11px] px-2.5 py-1 rounded-full font-semibold border transition-all duration-300 select-none",
										messagesLeft === -1 // Bypass/admin
											? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
											: messagesLeft <= 3
												? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse"
												: messagesLeft <= 7
													? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
													: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
									)}
								>
									{messagesLeft === -1 ? "Admin Vibe" : `${messagesLeft}/15 left`}
								</span>
							)}

							{/* Clear chat */}
							<Button
								variant="ghost"
								size="icon"
								className="shrink-0 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
								onClick={handleClearChat}
								title="Clear chat history"
								aria-label="Clear chat history"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</header>

				{/* Chat Messages Container */}
				<div className="flex-1 overflow-hidden relative">
					<div
						ref={scrollContainerRef}
						onScroll={handleScroll}
						className="h-full overflow-y-auto"
					>
						<div className="max-w-3xl mx-auto p-4 md:p-6 pb-20">
							{error && (
								error.message?.includes("daily limit") || error.message?.includes("RATE_LIMITED") ? (
									// Rate limit banner
									<Card className="p-5 mb-4 border-amber-500/40 bg-amber-500/10 dark:bg-amber-400/5 backdrop-blur-sm animate-fade-in">
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

							{/* Welcome / Onboarding Starter Questions */}
							{renderedMessages.length === 0 && !isLoading && (
								<div className="flex flex-col items-center justify-center py-12 text-center max-w-2xl mx-auto space-y-8 animate-fade-in">
									<div>
										<Avatar className="h-20 w-20 mx-auto mb-4 border-2 border-white/30 dark:border-white/10 shadow-lg">
											<AvatarImage src={persona.avatar} alt={persona.name} />
											<AvatarFallback>
												{persona.name.substring(0, 2)}
											</AvatarFallback>
										</Avatar>
										<h2 className="text-2xl font-bold tracking-tight mb-2">
											Chat with {persona.name}
										</h2>
										<p className="text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
											Ask me about {persona.expertise.join(", ")} or pick one of the conversation starters below:
										</p>
									</div>

									{/* Starter Prompt Cards */}
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-4">
										{(personaId === "hc"
											? [
													"How do I start learning DSA?",
													"Tell me about freeapi.app.",
													"Can you give me a Web Dev roadmap?"
											  ]
											: [
													"Explain RAG and vector DBs.",
													"What is Next.js Turbopack?",
													"How do I build GenAI apps?"
											  ]
										).map((promptText, idx) => (
											<button
												key={idx}
												onClick={() => {
													sendMessage({ text: promptText });
												}}
												className="p-4 rounded-xl border border-white/20 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] hover:bg-white/60 dark:hover:bg-white/[0.05] hover:border-blue-500/30 dark:hover:border-blue-400/20 text-xs font-semibold text-left leading-relaxed transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer shadow-sm hover:shadow group text-foreground"
											>
												<span className="block text-muted-foreground group-hover:text-primary mb-1 text-[9px] font-bold uppercase tracking-wider">
													Starter Prompt
												</span>
												{promptText}
											</button>
										))}
									</div>
								</div>
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
					</div>

					{/* Floating Scroll-to-Bottom Button */}
					{showScrollButton && (
						<Button
							onClick={scrollToBottom}
							size="icon"
							variant="secondary"
							className="absolute bottom-6 right-6 z-30 h-10 w-10 rounded-full border border-white/20 dark:border-white/10 bg-background/85 backdrop-blur-md text-foreground shadow-md hover:bg-muted/95 active:scale-95 transition-all duration-300 hover:scale-105 cursor-pointer"
							title="Scroll to bottom"
						>
							<ArrowDown className="h-4 w-4" />
							{hasNewMessages && (
								<span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 border-2 border-background animate-pulse" />
							)}
						</Button>
					)}
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
