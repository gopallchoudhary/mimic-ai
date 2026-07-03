import { UIMessage } from "ai";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ChatMessageProps {
    message: UIMessage;
    personaName: string;
    personaAvatar: string;
}

export function ChatMessage({ message, personaName, personaAvatar }: ChatMessageProps) {
    const isUser = message.role === "user";

    return (
        <div
            className={cn(
                "flex gap-3 mb-4",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {!isUser && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={personaAvatar} alt={personaName} />
                    <AvatarFallback>{personaName.substring(0, 2)}</AvatarFallback>
                </Avatar>
            )}
            
            <div
                className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2",
                    isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                )}
            >
                <div className="text-sm">
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
                <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
