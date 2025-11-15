import { useEffect, useState, ReactNode } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Sheet({ isOpen, onClose, title, children }: SheetProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // 바디 스크롤 막기
      document.body.style.overflow = 'hidden';
    } else {
      // 애니메이션 후 제거
      const timer = setTimeout(() => setIsAnimating(false), 300);
      document.body.style.overflow = 'auto';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50
        transition-all duration-300
        ${isOpen ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* 백그라운드 딤 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Sheet 콘텐츠 */}
      <div
        className={`
          absolute bottom-0 left-0 right-0
          bg-white rounded-t-2xl
          max-h-[90vh] overflow-y-auto
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* 드래그 핸들 */}
        <div className="sticky top-0 bg-white pt-2 pb-3 px-4 border-b border-divider">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
