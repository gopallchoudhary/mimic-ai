import { FormEvent, KeyboardEvent, ReactNode, useEffect, useRef } from "react";
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
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-focus on mount (when entering the chatroom)
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// Re-focus after loading finishes (response received / send complete)
	const wasLoadingRef = useRef(false);
	useEffect(() => {
		if (wasLoadingRef.current && !isLoading) {
			inputRef.current?.focus();
		}
		wasLoadingRef.current = isLoading;
	}, [isLoading]);

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
		<form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
			{/* Settings panel — floats absolute above the input row, no page reflows */}
			<div
				className={cn(
					"absolute bottom-14 right-0 z-40 w-72 md:w-80 rounded-2xl border border-white/25 dark:border-white/10 bg-background/95 dark:bg-background/90 backdrop-blur-md px-4 py-4 shadow-xl flex flex-col gap-3 transition-all duration-200 ease-out origin-bottom-right",
					showSettings
						? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
						: "opacity-0 scale-95 translate-y-2 pointer-events-none",
				)}
			>
				{settingsPanel}
			</div>

			{/* Input row — taller h-12 input + larger buttons with h-5 icons */}
			<div className="flex gap-2">
				<Input
					ref={inputRef}
					value={input}
					onChange={handleInputChange}
					onKeyDown={onKeyDown}
					placeholder="Type your message..."
					disabled={isLoading}
					className="flex-1 h-12 px-4 rounded-xl border-border/40 text-sm focus-visible:ring-1"
				/>
				<Button
					type="button"
					variant="outline"
					onClick={onSettingsToggle}
					aria-label="Toggle settings"
					className={cn(
						"h-12 w-12 shrink-0 rounded-xl transition-colors duration-200 cursor-pointer",
						showSettings &&
							"bg-primary text-primary-foreground hover:bg-primary/90",
					)}
				>
					<Settings2 className="h-5 w-5" />
				</Button>
				<Button 
					type="submit" 
					disabled={isLoading || !input?.trim()}
					className="h-12 w-12 shrink-0 rounded-xl cursor-pointer"
				>
					<Send className="h-5 w-5" />
				</Button>
			</div>
		</form>
	);
}
