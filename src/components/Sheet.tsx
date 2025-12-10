import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  disableDrag?: boolean; // true면 순수 CSS 방식 (입력 안정), false면 vaul 드래그 기능
  initialSnapIndex?: number; // vaul 사용 시 초기 snapPoint 인덱스 (0=50%, 1=90%)
  zIndex?: number; // z-index 레벨 (기본값: 50, Layer 3는 60 사용)
}

export default function Sheet({ isOpen, onClose, title, children, disableDrag = false, initialSnapIndex = 0, zIndex = 50 }: SheetProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const snapPoints = [0.5, 0.9];
  const activeSnap = snapPoints[initialSnapIndex];

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // disableDrag일 때만 바디 스크롤 막기 (vaul은 자체적으로 처리함)
      if (disableDrag) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      // 애니메이션 후 제거
      const timer = setTimeout(() => setIsAnimating(false), 300);
      if (disableDrag) {
        document.body.style.overflow = 'auto';
      }
      return () => clearTimeout(timer);
    }
  }, [isOpen, disableDrag]);

  // disableDrag={true}: 순수 CSS 방식 (이전 안정적인 방식)
  if (disableDrag) {
    if (!isOpen && !isAnimating) return null;

    return (
      <div
        className={`
          fixed inset-0
          transition-all duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ zIndex }}
      >
        {/* 백그라운드 딤 */}
        <div
          className="absolute inset-0 bg-black/40 z-0"
          onClick={onClose}
        />

        {/* Sheet 콘텐츠 */}
        <div
          className={`
            absolute bottom-0 left-0 right-0 z-10
            bg-white rounded-t-2xl
            max-h-[90vh] overflow-y-auto
            transition-transform duration-300 ease-out
            ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          `}
        >
          {/* 헤더 */}
          <div className="sticky top-0 bg-white pt-4 pb-3 px-4 border-b border-divider">
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

  // disableDrag={false}: vaul 드래그 방식 (조회용)
  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnap}
      fadeFromIndex={0}
      dismissible={true}
      modal={true}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" style={{ zIndex: zIndex }} />
        <Drawer.Content
          className="
            fixed bottom-0 left-0 right-0
            bg-white rounded-t-2xl
            flex flex-col
            outline-none
          "
          style={{ zIndex: zIndex + 1 }}
        >
          {/* 드래그 핸들 */}
          <div className="sticky top-0 bg-white pt-2 pb-3 px-4 border-b border-divider flex-shrink-0">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <Drawer.Title className="text-xl font-semibold">{title}</Drawer.Title>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* 콘텐츠 - 스크롤 가능 영역 */}
          <div className="p-4 overflow-y-auto flex-1" data-vaul-no-drag>
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
