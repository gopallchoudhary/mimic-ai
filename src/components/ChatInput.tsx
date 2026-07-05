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
		<form onSubmit={handleSubmit} className="flex flex-col gap-2">
			{/* Settings panel — right-aligned, sits just above the ⚙️ and ➤ buttons */}
			<div
				className={cn(
					"flex justify-end overflow-hidden transition-all duration-300 ease-in-out",
					showSettings ? "max-h-48 opacity-100" : "max-h-0 opacity-0",
				)}
			>
				<div className="rounded-xl border border-border/60 bg-muted/40 backdrop-blur-sm px-4 py-3 shadow-sm flex flex-col gap-3">
					{settingsPanel}
				</div>
			</div>

			{/* Input row — taller h-12 input + larger buttons with h-5 icons */}
			<div className="flex gap-2">
				<Input
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
