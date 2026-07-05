import { useState } from "react";
import { UIMessage } from "ai";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useUser } from "@clerk/nextjs";
import { Copy, Check } from "lucide-react";

interface ChatMessageProps {
    message: UIMessage;
    personaName: string;
    personaAvatar: string;
}

export function ChatMessage({ message, personaName, personaAvatar }: ChatMessageProps) {
    const isUser = message.role === "user";
    const { user } = useUser();
    const [copied, setCopied] = useState(false);

    // Extract text content
    const text = message.parts
        ? message.parts
            .filter((p: any) => p.type === "text")
            .map((p: any) => p.text || "")
            .join("")
        : "";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy message:", err);
        }
    };

    return (
        <div
            className={cn(
                "group relative flex gap-3 mb-6 animate-slide-up",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {!isUser && (
                <Avatar className="h-8 w-8 flex-shrink-0 border border-border/40 shadow-sm">
                    <AvatarImage src={personaAvatar} alt={personaName} />
                    <AvatarFallback>{personaName.substring(0, 2)}</AvatarFallback>
                </Avatar>
            )}
            
            <div className="relative max-w-[78%] md:max-w-[70%]">
                {/* Frosted Glass Copy Toolbar (Persona messages only, floats above) */}
                {!isUser && text.trim().length > 0 && (
                    <div className="absolute -top-3.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground bg-background/90 hover:bg-background border border-border/50 rounded-lg shadow-sm hover:text-primary transition-all duration-200 active:scale-95 cursor-pointer"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3 w-3 text-emerald-500" />
                                    <span className="text-emerald-500">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                <div
                    className={cn(
                        "rounded-2xl px-4 py-3 text-sm transition-all duration-300",
                        isUser
                            ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white dark:from-blue-500 dark:via-indigo-500 dark:to-cyan-400 rounded-tr-none shadow-[0_6px_16px_-4px_rgba(0,123,255,0.25)] border border-white/10"
                            : "bg-white/55 dark:bg-white/[0.02] backdrop-blur-md border border-white/30 dark:border-white/5 hover:border-white/40 dark:hover:border-white/10 rounded-tl-none text-foreground shadow-sm hover:shadow"
                    )}
                >
                    <div className="leading-relaxed">
                        {message.parts.map((part, index) => {
                            if (part.type === "text") {
                                return isUser ? (
                                    // User messages: plain text with whitespace preserved
                                    <span key={index} className="whitespace-pre-wrap break-words">
                                        {part.text}
                                    </span>
                                ) : (
                                    // AI messages: render markdown
                                    <MarkdownRenderer key={index} content={part.text} />
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            </div>
            
            {isUser && (
                <Avatar className="h-8 w-8 flex-shrink-0 border border-border/40 bg-muted shadow-sm">
                    {user?.imageUrl && (
                        <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
                    )}
                    <AvatarFallback className="text-xs font-semibold">
                        {user?.firstName?.substring(0, 1).toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
