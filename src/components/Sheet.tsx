import type { ReactNode } from 'react';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  disableDrag?: boolean; // true면 드래그 비활성화, 90% 고정
}

export default function Sheet({ isOpen, onClose, title, children, disableDrag = false }: SheetProps) {
  const content = (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
      <Drawer.Content
        className="
          fixed bottom-0 left-0 right-0 z-50
          bg-white rounded-t-2xl
          flex flex-col
          outline-none
        "
        style={{ height: disableDrag ? '90vh' : undefined }}
      >
        {/* 드래그 핸들 - disableDrag일 때는 숨김 */}
        {!disableDrag && (
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
        )}

        {/* disableDrag일 때는 헤더 따로 표시 */}
        {disableDrag && (
          <div className="sticky top-0 bg-white pt-4 pb-3 px-4 border-b border-divider flex-shrink-0">
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
        )}

        {/* 콘텐츠 - 스크롤 가능 영역 */}
        <div className="p-4 overflow-y-auto flex-1" data-vaul-no-drag>
          {children}
        </div>
      </Drawer.Content>
    </Drawer.Portal>
  );

  return disableDrag ? (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      dismissible={false}
      modal={true}
    >
      {content}
    </Drawer.Root>
  ) : (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      snapPoints={[0.5, 0.9]}
      fadeFromIndex={0}
      dismissible={true}
      modal={true}
    >
      {content}
    </Drawer.Root>
  );
}
