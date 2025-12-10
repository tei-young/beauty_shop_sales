import { useState } from 'react';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import { useTreatments, useAddTreatment, useDeleteTreatment, useUpdateTreatment } from '../../hooks/useTreatments';
import { formatCurrency } from '../../utils/currency';
import { TREATMENT_COLORS } from '../../utils/colors';
import Sheet from '../../components/Sheet';
import ColorPicker from '../../components/ColorPicker';
import type { Treatment } from '../../types';

export default function SettingsTab() {
  const { data: treatments, isLoading, error } = useTreatments();
  const addTreatment = useAddTreatment();
  const updateTreatment = useUpdateTreatment();
  const deleteTreatment = useDeleteTreatment();

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState<{
    name: string;
    price: string;
    icon: string;
    color: string;
  }>({
    name: '',
    price: '',
    icon: '',
    color: TREATMENT_COLORS[0].value,
  });

  // Sheet 열기/닫기
  const openAddSheet = () => {
    setFormData({
      name: '',
      price: '',
      icon: '',
      color: TREATMENT_COLORS[0].value,
    });
    setEditingTreatment(null);
    setIsAddSheetOpen(true);
  };

  const openEditSheet = (treatment: Treatment) => {
    // 가격을 쉼표 포맷으로 변환
    const formattedPrice = treatment.price.toLocaleString('ko-KR');
    setFormData({
      name: treatment.name,
      price: formattedPrice,
      icon: treatment.icon || '',
      color: treatment.color,
    });
    setEditingTreatment(treatment);
    setIsAddSheetOpen(true);
  };

  const closeSheet = () => {
    setIsAddSheetOpen(false);
    setEditingTreatment(null);
  };

  // 금액 입력 포맷팅 (쉼표 추가)
  const handlePriceChange = (value: string) => {
    // 숫자와 쉼표만 허용
    const cleaned = value.replace(/[^\d,]/g, '');
    const numbersOnly = cleaned.replace(/,/g, '');

    if (numbersOnly === '') {
      setFormData({ ...formData, price: '' });
      return;
    }

    // 숫자를 천 단위 구분자로 포맷팅
    const formatted = parseInt(numbersOnly).toLocaleString('ko-KR');
    setFormData({ ...formData, price: formatted });
  };

  // 시술 저장
  const handleSave = async () => {
    // 쉼표 제거하고 숫자로 변환
    const cleanedPrice = formData.price.replace(/,/g, '');
    const price = parseInt(cleanedPrice);

    if (!formData.name || !price || price < 0) {
      alert('시술명과 금액을 입력해주세요.');
      return;
    }

    try {
      if (editingTreatment) {
        // 수정
        await updateTreatment.mutateAsync({
          id: editingTreatment.id,
          name: formData.name,
          price,
          icon: formData.icon || null,
          color: formData.color,
        });
      } else {
        // 추가
        const maxOrder = treatments?.reduce((max, t) => Math.max(max, t.order), -1) ?? -1;
        await addTreatment.mutateAsync({
          name: formData.name,
          price,
          icon: formData.icon || null,
          color: formData.color,
          order: maxOrder + 1,
        });
      }
      closeSheet();
    } catch (err: any) {
      alert(err.message || '오류가 발생했습니다.');
    }
  };

  // 시술 삭제
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 시술을 삭제하시겠습니까?`)) return;

    try {
      await deleteTreatment.mutateAsync(id);
    } catch (err: any) {
      alert(err.message || '삭제 중 오류가 발생했습니다.');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <p className="text-red-500 text-center">
          데이터를 불러오는데 실패했습니다.<br />
          Supabase 설정을 확인해주세요.
        </p>
        <p className="text-sm text-textSecondary mt-2">
          {(error as Error).message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="p-m border-b border-divider">
        <h1 className="text-2xl font-semibold">설정</h1>
        <p className="text-textSecondary mt-1">시술 항목을 관리합니다</p>
      </div>

      {/* 시술 목록 */}
      <div className="flex-1 overflow-y-auto p-m">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">시술 관리</h2>
          <button
            onClick={openAddSheet}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors"
          >
            <Plus size={20} />
            <span>추가</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-textSecondary">
            로딩 중...
          </div>
        ) : treatments && treatments.length > 0 ? (
          <div className="space-y-3">
            {treatments.map((treatment) => (
              <div
                key={treatment.id}
                className="bg-card rounded-lg p-4 border border-divider flex items-center gap-4"
              >
                {/* 색상 표시 */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: treatment.color + '26' }}
                >
                  {treatment.icon || ''}
                </div>

                {/* 정보 */}
                <div className="flex-1">
                  <h3 className="font-semibold">{treatment.name}</h3>
                  <p className="text-sm text-textSecondary">{formatCurrency(treatment.price)}</p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditSheet(treatment)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit size={20} className="text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(treatment.id, treatment.name)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-textSecondary">
            <p className="text-4xl mb-4">💅</p>
            <p>등록된 시술이 없습니다</p>
            <p className="text-sm mt-2">+ 버튼을 눌러 시술을 추가해보세요</p>
          </div>
        )}
      </div>

      {/* 시술 추가/수정 Sheet */}
      <Sheet
        isOpen={isAddSheetOpen}
        onClose={closeSheet}
        title={editingTreatment ? '시술 수정' : '시술 추가'}
        disableDrag={true}
      >
        <div className="space-y-6">
          {/* 시술명 */}
          <div>
            <label className="block text-sm font-medium mb-2">시술명 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 네일아트"
              maxLength={30}
              className="w-full px-4 py-3 border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* 금액 */}
          <div>
            <label className="block text-sm font-medium mb-2">금액 *</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="50,000"
              className="w-full px-4 py-3 border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* 아이콘 */}
          <div>
            <label className="block text-sm font-medium mb-2">아이콘 (선택)</label>
            <div className="relative">
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, icon: value.slice(0, 2) });
                }}
                onFocus={(e) => e.target.select()}
                placeholder="이모지 또는 글자 입력"
                className="w-full px-4 py-3 border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-3xl"
              />
              {formData.icon && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: '' })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              )}
            </div>
            <p className="text-xs text-textSecondary mt-1">
              이모지 또는 2글자 이내 입력 가능
            </p>
          </div>

          {/* 색상 */}
          <div>
            <label className="block text-sm font-medium mb-2">색상 *</label>
            <ColorPicker
              value={formData.color}
              onChange={(color) => setFormData({ ...formData, color })}
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={closeSheet}
              className="flex-1 px-4 py-3 border border-divider rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={addTreatment.isPending || updateTreatment.isPending}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors disabled:opacity-50"
            >
              {addTreatment.isPending || updateTreatment.isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
