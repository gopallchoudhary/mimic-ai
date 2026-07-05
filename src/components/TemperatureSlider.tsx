import { Slider } from "@/components/ui/slider";

interface TemperatureSliderProps {
    value: number;
    onChange: (value: number) => void;
}

export function TemperatureSlider({ value, onChange }: TemperatureSliderProps) {
    const getLabel = (val: number) => {
        if (val <= 0.3) return "Precise & Focused";
        if (val <= 0.7) return "Balanced Vibe";
        return "Creative & Playful";
    };

    const getDescription = (val: number) => {
        if (val <= 0.3) return "Predictable, direct, and factual answers.";
        if (val <= 0.7) return "A natural balance of creativity and consistency.";
        return "Spontaneous, highly expressive, and random vibes.";
    };

    return (
        <div className="flex flex-col gap-2 w-full min-w-[240px] max-w-[280px]">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Temperature
                </span>
                <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full select-none">
                    {value.toFixed(1)} • {getLabel(value)}
                </span>
            </div>
            
            <div className="py-1">
                <Slider
                    value={[value]}
                    onValueChange={(newValue) => onChange(newValue as number)}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    className="cursor-pointer"
                />
            </div>
            
            <p className="text-[11px] text-muted-foreground/80 leading-normal min-h-[1.5rem]">
                {getDescription(value)}
            </p>
        </div>
    );
}
