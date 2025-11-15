import { TREATMENT_COLORS } from '../utils/colors';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {TREATMENT_COLORS.map((color) => {
        const isSelected = value === color.value;

        return (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={`
              w-full aspect-square rounded-lg
              transition-all duration-200
              ${isSelected ? 'scale-110 ring-4 ring-primary ring-offset-2' : 'scale-100'}
            `}
            style={{ backgroundColor: color.value }}
            aria-label={color.name}
          >
            {isSelected && (
              <span className="text-white text-xl">✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
