import { Check } from "lucide-react";

interface BackgroundColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const colorOptions = [
  { id: "background", name: "Classic", gradient: "bg-gradient-background" },
  { id: "sunset", name: "Sunset", gradient: "bg-gradient-sunset" },
  { id: "soft-peach", name: "Peach", gradient: "bg-soft-peach" },
  { id: "warm-cream", name: "Cream", gradient: "bg-warm-cream" },
  { id: "golden-mist", name: "Golden", gradient: "bg-golden-mist" },
  { id: "coral-blush", name: "Coral", gradient: "bg-coral-blush" },
];

export function BackgroundColorPicker({ selectedColor, onColorChange }: BackgroundColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-bold text-foreground">Theme</span>
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