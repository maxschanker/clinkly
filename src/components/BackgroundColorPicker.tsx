import { Check } from "lucide-react";

interface BackgroundColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const colorOptions = [
  { id: "secondary", name: "Default", gradient: "bg-gradient-secondary" },
  { id: "soft-lavender", name: "Lavender", gradient: "bg-gradient-soft-lavender" },
  { id: "pale-lilac", name: "Lilac", gradient: "bg-gradient-pale-lilac" },
  { id: "warm-cream", name: "Cream", gradient: "bg-gradient-warm-cream" },
  { id: "light-pink", name: "Pink", gradient: "bg-gradient-light-pink" },
  { id: "cool-mist", name: "Blue", gradient: "bg-gradient-cool-mist" },
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