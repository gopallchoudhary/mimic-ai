import { Slider } from "@/components/ui/slider";

interface TemperatureSliderProps {
    value: number;
    onChange: (value: number) => void;
}

export function TemperatureSlider({ value, onChange }: TemperatureSliderProps) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium whitespace-nowrap">
                Temperature:
            </span>
            <div className="flex-1 max-w-[200px]">
                <Slider
                    value={[value]}
                    onValueChange={([newValue]) => onChange(newValue)}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    className="cursor-pointer"
                />
            </div>
            <span className="text-sm text-muted-foreground min-w-[2.5rem] text-right">
                {value.toFixed(1)}
            </span>
        </div>
    );
}
