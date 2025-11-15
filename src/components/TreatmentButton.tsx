import { formatCurrency } from '../utils/currency';
import type { Treatment } from '../types';

interface TreatmentButtonProps {
  treatment: Treatment;
  onClick: () => void;
}

export default function TreatmentButton({ treatment, onClick }: TreatmentButtonProps) {
  const hasIcon = treatment.icon && treatment.icon.length > 0;

  return (
    <button
      onClick={onClick}
      className="w-full aspect-square rounded-lg transition-transform active:scale-95"
      style={{
        backgroundColor: hasIcon ? `${treatment.color}26` : '#FFFFFF',
        border: hasIcon ? `2px solid ${treatment.color}` : '1px solid #E5E5EA',
      }}
    >
      <div className="flex flex-col items-center justify-center h-full p-2">
        {hasIcon ? (
          <>
            {/* 아이콘 있는 경우 */}
            <div className="text-3xl mb-1">{treatment.icon}</div>
            <div className="text-sm font-semibold text-textPrimary">{treatment.name}</div>
            <div className="text-xs text-textSecondary mt-0.5">{formatCurrency(treatment.price)}</div>
          </>
        ) : (
          <>
            {/* 아이콘 없는 경우 */}
            <div
              className="w-full h-3 rounded-t-lg mb-2"
              style={{ backgroundColor: treatment.color }}
            />
            <div className="text-base font-semibold text-textPrimary">{treatment.name}</div>
            <div className="text-xs text-textSecondary mt-1">{formatCurrency(treatment.price)}</div>
          </>
        )}
      </div>
    </button>
  );
}
