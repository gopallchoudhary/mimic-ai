import { FormEvent, KeyboardEvent, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
    showSettings: boolean;
    onSettingsToggle: () => void;
    settingsPanel?: ReactNode;
}

export function ChatInput({
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    showSettings,
    onSettingsToggle,
    settingsPanel,
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
        <div className="flex flex-col gap-2">
            {/* Animated settings panel */}
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    showSettings ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="rounded-xl border border-border/60 bg-muted/40 backdrop-blur-sm px-4 py-3 shadow-sm">
                    {settingsPanel}
                </div>
            </div>

            {/* Input row */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={onKeyDown}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={onSettingsToggle}
                    aria-label="Toggle settings"
                    className={cn(
                        "transition-colors duration-200",
                        showSettings && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                >
                    <Settings2 className="h-4 w-4" />
                </Button>
                <Button type="submit" disabled={isLoading || !input?.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
