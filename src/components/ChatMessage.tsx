import { UIMessage } from "ai";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { useUser } from "@clerk/nextjs";

interface ChatMessageProps {
    message: UIMessage;
    personaName: string;
    personaAvatar: string;
}

export function ChatMessage({ message, personaName, personaAvatar }: ChatMessageProps) {
    const isUser = message.role === "user";
    const { user } = useUser();

    return (
        <div
            className={cn(
                "flex gap-3 mb-5 animate-slide-up",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {!isUser && (
                <Avatar className="h-8 w-8 flex-shrink-0 border border-border/40">
                    <AvatarImage src={personaAvatar} alt={personaName} />
                    <AvatarFallback>{personaName.substring(0, 2)}</AvatarFallback>
                </Avatar>
            )}
            
            <div
                className={cn(
                    "max-w-[78%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm transition-all duration-300",
                    isUser
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white dark:from-blue-500 dark:to-cyan-400 rounded-tr-none shadow-[0_4px_12px_-4px_rgba(0,123,255,0.3)]"
                        : "bg-white/45 dark:bg-white/[0.02] backdrop-blur-md border border-white/30 dark:border-white/10 rounded-tl-none text-foreground shadow-sm"
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
            
            {isUser && (
                <Avatar className="h-8 w-8 flex-shrink-0 border border-border/40 bg-muted">
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
