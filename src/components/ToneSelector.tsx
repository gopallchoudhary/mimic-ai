import { PersonaTone } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ToneSelectorProps {
    selectedTone: PersonaTone;
    onToneChange: (tone: PersonaTone) => void;
}

const tones: { value: PersonaTone; label: string }[] = [
    { value: "default", label: "Default" },
    { value: "funny", label: "Funny" },
    { value: "advice", label: "Advice" },
    { value: "educational", label: "Educational" },
];

export function ToneSelector({ selectedTone, onToneChange }: ToneSelectorProps) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Tone:</span>
            {tones.map((tone) => (
                <Badge
                    key={tone.value}
                    variant={selectedTone === tone.value ? "default" : "outline"}
                    className={cn(
                        "cursor-pointer hover:bg-primary/10 transition-colors",
                        selectedTone === tone.value && "cursor-default"
                    )}
                    onClick={() => onToneChange(tone.value)}
                >
                    {tone.label}
                </Badge>
            ))}
        </div>
    );
}
