import { FormEvent, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
}

export function ChatInput({
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
}: ChatInputProps) {
    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const form = e.currentTarget.form;
            if (form) {
                form.requestSubmit();
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
                value={input}
                onChange={handleInputChange}
                onKeyDown={onKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input?.trim()}>
                <Send className="h-4 w-4" />
            </Button>
        </form>
    );
}
