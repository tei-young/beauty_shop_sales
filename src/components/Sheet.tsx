import type { ReactNode } from 'react';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Sheet({ isOpen, onClose, title, children }: SheetProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()} snapPoints={[0.5, 0.9]} fadeFromIndex={0}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content
          className="
            fixed bottom-0 left-0 right-0 z-50
            bg-white rounded-t-2xl
            h-[90vh] flex flex-col
            outline-none
          "
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
          <div className="p-4 overflow-y-auto flex-1">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
