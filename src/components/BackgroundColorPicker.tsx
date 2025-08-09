import { Check } from "lucide-react";

interface BackgroundColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const colorOptions = [
  { id: "hero", name: "Clink Purple", gradient: "bg-gradient-hero" },
  { id: "soft-lavender", name: "Soft Lavender", gradient: "bg-soft-lavender" },
  { id: "pale-lilac", name: "Pale Lilac", gradient: "bg-pale-lilac" },
  { id: "warm-cream", name: "Warm Cream", gradient: "bg-warm-cream" },
  { id: "light-pink", name: "Light Pink Blush", gradient: "bg-light-pink" },
  { id: "cool-mist", name: "Cool Mist Blue", gradient: "bg-cool-mist" },
];

export function BackgroundColorPicker({ selectedColor, onColorChange }: BackgroundColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">Background</span>
      <div className="flex flex-wrap gap-2">
        {colorOptions.map((color) => (
          <button
            key={color.id}
            onClick={() => onColorChange(color.id)}
            className={`
              relative w-8 h-8 rounded-full ${color.gradient} 
              border-2 transition-all duration-200 hover:scale-110
              ${selectedColor === color.id 
                ? "border-foreground shadow-glow" 
                : "border-border hover:border-foreground/50"
              }
            `}
            title={color.name}
          >
            {selectedColor === color.id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-4 h-4 text-white drop-shadow-lg" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}