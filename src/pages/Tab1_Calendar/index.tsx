import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus, Trash2, Edit } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import Calendar from '../../components/Calendar';
import Sheet from '../../components/Sheet';
import TreatmentButton from '../../components/TreatmentButton';
import { useMonthlyRecords, useDailyRecords, useAddDailyRecord, useUpdateDailyRecord, useDeleteDailyRecord } from '../../hooks/useDailyRecords';
import { useTreatments } from '../../hooks/useTreatments';
import { useDailyAdjustments, useAddAdjustment, useUpdateAdjustment, useDeleteAdjustment } from '../../hooks/useDailyAdjustments';
import { formatCurrency, formatFullCurrency } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/date';
import type { DailyAdjustment } from '../../types';

export default function CalendarTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isTreatmentSheetOpen, setIsTreatmentSheetOpen] = useState(false);
  const [isAdjustmentSheetOpen, setIsAdjustmentSheetOpen] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState<DailyAdjustment | null>(null);
  const [adjustmentFormData, setAdjustmentFormData] = useState({
    amount: '',
    reason: '',
  });

  const yearMonth = format(currentDate, 'yyyy-MM');
  const { data: monthlyRecords = [] } = useMonthlyRecords(yearMonth);
  const { data: dailyRecords = [] } = useDailyRecords(selectedDate || '');
  const { data: dailyAdjustments = [] } = useDailyAdjustments(selectedDate || '');
  const { data: treatments = [] } = useTreatments();
  const addRecord = useAddDailyRecord();
  const updateRecord = useUpdateDailyRecord();
  const deleteRecord = useDeleteDailyRecord();
  const addAdjustment = useAddAdjustment();
  const updateAdjustment = useUpdateAdjustment();
  const deleteAdjustment = useDeleteAdjustment();

  // 월 총 매출 계산
  const monthlyTotal = monthlyRecords.reduce((sum, record) => sum + record.total_amount, 0);

  // 일별 총 매출 (시술 + 조정)
  const treatmentTotal = dailyRecords.reduce((sum, record) => sum + record.total_amount, 0);
  const adjustmentTotal = dailyAdjustments.reduce((sum, adj) => sum + adj.amount, 0);
  const dailyTotal = treatmentTotal + adjustmentTotal;

  // 월 변경
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // 날짜 클릭
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };

  // 일별 상세 Sheet 닫기
  const closeDailySheet = () => {
    setSelectedDate(null);
    setIsTreatmentSheetOpen(false);
    setIsAdjustmentSheetOpen(false);
    setEditingAdjustment(null);
  };

  // 시술 선택 Sheet 열기
  const openTreatmentSheet = () => {
    setIsTreatmentSheetOpen(true);
  };

  // 조정 추가 Sheet 열기
  const openAddAdjustmentSheet = () => {
    setAdjustmentFormData({ amount: '', reason: '' });
    setEditingAdjustment(null);
    setIsAdjustmentSheetOpen(true);
  };

  // 조정 수정 Sheet 열기
  const openEditAdjustmentSheet = (adjustment: DailyAdjustment) => {
    // 숫자를 쉼표 포맷으로 변환
    const formattedAmount = adjustment.amount.toLocaleString('ko-KR');
    setAdjustmentFormData({
      amount: formattedAmount,
      reason: adjustment.reason || '',
    });
    setEditingAdjustment(adjustment);
    setIsAdjustmentSheetOpen(true);
  };

  // 조정 Sheet 닫기
  const closeAdjustmentSheet = () => {
    setIsAdjustmentSheetOpen(false);
    setEditingAdjustment(null);
  };

  // 금액 입력 포맷팅 (쉼표 추가)
  const handleAmountChange = (value: string) => {
    // 숫자와 마이너스, 쉼표만 허용
    const cleaned = value.replace(/[^\d,-]/g, '');

    // 마이너스는 맨 앞에만 허용
    const hasNegative = cleaned.startsWith('-');
    const numbersOnly = cleaned.replace(/-/g, '').replace(/,/g, '');

    if (numbersOnly === '') {
      setAdjustmentFormData({ ...adjustmentFormData, amount: hasNegative ? '-' : '' });
      return;
    }

    // 숫자를 천 단위 구분자로 포맷팅
    const formatted = parseInt(numbersOnly).toLocaleString('ko-KR');
    setAdjustmentFormData({
      ...adjustmentFormData,
      amount: hasNegative ? `-${formatted}` : formatted
    });
  };

  // 시술 추가
  const handleAddTreatment = async (treatmentId: string, price: number) => {
    if (!selectedDate) return;

    try {
      await addRecord.mutateAsync({
        date: selectedDate,
        treatment_id: treatmentId,
        count: 1,
        total_amount: price,
      });
    } catch (err: any) {
      alert(err.message || '기록 추가 중 오류가 발생했습니다.');
    }
  };

  // 기록 삭제
  const handleDeleteRecord = async (id: string, treatmentName: string) => {
    if (!selectedDate) return;
    if (!confirm(`"${treatmentName}" 기록을 삭제하시겠습니까?`)) return;

    try {
      await deleteRecord.mutateAsync({ id, date: selectedDate });
    } catch (err: any) {
      alert(err.message || '삭제 중 오류가 발생했습니다.');
    }
  };

  // 시술 수량 증가
  const handleIncreaseCount = async (id: string, currentCount: number, unitPrice: number) => {
    try {
      const newCount = currentCount + 1;
      const newTotalAmount = unitPrice * newCount;
      await updateRecord.mutateAsync({ id, count: newCount, total_amount: newTotalAmount });
    } catch (err: any) {
      alert(err.message || '수량 증가 중 오류가 발생했습니다.');
    }
  };

  // 시술 수량 감소
  const handleDecreaseCount = async (id: string, currentCount: number, unitPrice: number, treatmentName: string) => {
    if (currentCount <= 1) {
      // 수량이 1이면 삭제 확인
      if (!confirm(`"${treatmentName}" 기록을 삭제하시겠습니까?`)) return;
      try {
        await deleteRecord.mutateAsync({ id, date: selectedDate || '' });
      } catch (err: any) {
        alert(err.message || '삭제 중 오류가 발생했습니다.');
      }
    } else {
      // 수량 감소
      try {
        const newCount = currentCount - 1;
        const newTotalAmount = unitPrice * newCount;
        await updateRecord.mutateAsync({ id, count: newCount, total_amount: newTotalAmount });
      } catch (err: any) {
        alert(err.message || '수량 감소 중 오류가 발생했습니다.');
      }
    }
  };

  // 조정 저장
  const handleSaveAdjustment = async () => {
    if (!selectedDate) return;

    // 쉼표 제거하고 숫자로 변환
    const cleanedAmount = adjustmentFormData.amount.replace(/,/g, '');
    const amount = parseInt(cleanedAmount);

    if (isNaN(amount) || amount === 0) {
      alert('금액을 입력해주세요. (할인은 음수로 입력)');
      return;
    }

    try {
      if (editingAdjustment) {
        // 수정
        await updateAdjustment.mutateAsync({
          id: editingAdjustment.id,
          date: selectedDate,
          amount,
          reason: adjustmentFormData.reason || null,
        });
      } else {
        // 추가
        await addAdjustment.mutateAsync({
          date: selectedDate,
          amount,
          reason: adjustmentFormData.reason || null,
        });
      }
      closeAdjustmentSheet();
    } catch (err: any) {
      alert(err.message || '오류가 발생했습니다.');
    }
  };

  // 조정 삭제
  const handleDeleteAdjustment = async (id: string, amount: number) => {
    if (!selectedDate) return;
    const type = amount > 0 ? '추가금액' : '할인';
    if (!confirm(`${type} ${formatFullCurrency(Math.abs(amount))}를 삭제하시겠습니까?`)) return;

    try {
      await deleteAdjustment.mutateAsync({ id, date: selectedDate });
    } catch (err: any) {
      alert(err.message || '삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="p-m border-b border-divider">
        <div className="flex items-center justify-between mb-3">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </h1>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* 월 총 매출 */}
        <div className="bg-accent rounded-lg p-3 text-center">
          <div className="text-sm text-textSecondary mb-1">월 총 매출</div>
          <div className="text-2xl font-bold text-primary">{formatFullCurrency(monthlyTotal)}</div>
        </div>
      </div>

      {/* 캘린더 */}
      <div className="flex-1 overflow-y-auto p-m">
        <Calendar
          currentDate={currentDate}
          records={monthlyRecords}
          onDateClick={handleDateClick}
        />
      </div>

      {/* 일별 상세 Sheet (Layer 2) */}
      <Sheet
        isOpen={selectedDate !== null}
        onClose={closeDailySheet}
        title={selectedDate ? formatDisplayDate(selectedDate) : ''}
      >
        <div className="space-y-4">
          {/* 일별 총 매출 */}
          <div className="bg-accent rounded-lg p-4 text-center">
            <div className="text-sm text-textSecondary mb-1">일 총 매출</div>
            <div className="text-xl font-bold text-primary">{formatFullCurrency(dailyTotal)}</div>
            {adjustmentTotal !== 0 && (
              <div className="text-xs text-textSecondary mt-1">
                (시술: {formatFullCurrency(treatmentTotal)} {adjustmentTotal > 0 ? '+' : ''}{adjustmentTotal !== 0 ? formatFullCurrency(adjustmentTotal) : ''})
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={openTreatmentSheet}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors"
            >
              <Plus size={20} />
              <span>시술 추가</span>
            </button>
            <button
              onClick={openAddAdjustmentSheet}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus size={20} />
              <span>조정</span>
            </button>
          </div>

          {/* 시술 기록 리스트 */}
          {dailyRecords.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-textSecondary">시술 내역</h3>
              {dailyRecords.map((record) => {
                const unitPrice = record.treatment?.price || 0;
                return (
                  <div
                    key={record.id}
                    className="bg-card rounded-lg p-3 border border-divider"
                  >
                    <div className="flex items-center gap-3">
                      {/* 색상 표시 */}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: record.treatment?.color + '26' }}
                      >
                        {record.treatment?.icon || ''}
                      </div>

                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold">{record.treatment?.name}</h4>
                        <p className="text-sm text-textSecondary">
                          {record.count}회 × {formatCurrency(unitPrice)} = {formatFullCurrency(record.total_amount)}
                        </p>
                      </div>
                    </div>

                    {/* 수량 조절 및 삭제 버튼 */}
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <button
                        onClick={() => handleDecreaseCount(record.id, record.count, unitPrice, record.treatment?.name || '')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="수량 감소"
                      >
                        <Minus size={16} className="text-gray-600" />
                      </button>
                      <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium min-w-[40px] text-center">
                        {record.count}
                      </span>
                      <button
                        onClick={() => handleIncreaseCount(record.id, record.count, unitPrice)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="수량 증가"
                      >
                        <Plus size={16} className="text-gray-600" />
                      </button>
                      <div className="w-px h-6 bg-divider mx-1" />
                      <button
                        onClick={() => handleDeleteRecord(record.id, record.treatment?.name || '')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="전체 삭제"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-textSecondary">
              <p className="text-3xl mb-2">📝</p>
              <p>기록된 시술이 없습니다</p>
              <p className="text-sm mt-1">+ 시술 추가 버튼을 눌러보세요</p>
            </div>
          )}

          {/* 조정 내역 */}
          {dailyAdjustments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-textSecondary">조정 내역</h3>
              {dailyAdjustments.map((adjustment) => (
                <div
                  key={adjustment.id}
                  className={`rounded-lg p-3 border flex items-center gap-3 ${
                    adjustment.amount > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  {/* 아이콘 */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                    adjustment.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {adjustment.amount > 0 ? '➕' : '➖'}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {adjustment.amount > 0 ? '추가금액' : '할인'} {formatFullCurrency(Math.abs(adjustment.amount))}
                    </h4>
                    {adjustment.reason && (
                      <p className="text-sm text-textSecondary">{adjustment.reason}</p>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditAdjustmentSheet(adjustment)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit size={18} className="text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteAdjustment(adjustment.id, adjustment.amount)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Sheet>

      {/* 시술 선택 Sheet (Layer 3) */}
      {selectedDate && (
        <Sheet
          isOpen={isTreatmentSheetOpen}
          onClose={() => setIsTreatmentSheetOpen(false)}
          title="시술 선택"
        >
          <div className="grid grid-cols-3 gap-3">
            {treatments.map((treatment) => (
              <TreatmentButton
                key={treatment.id}
                treatment={treatment}
                onClick={() => {
                  handleAddTreatment(treatment.id, treatment.price);
                  setIsTreatmentSheetOpen(false);
                }}
              />
            ))}
          </div>

          {treatments.length === 0 && (
            <div className="text-center py-12 text-textSecondary">
              <p className="text-4xl mb-4">💅</p>
              <p>등록된 시술이 없습니다</p>
              <p className="text-sm mt-2">설정 탭에서 시술을 추가해주세요</p>
            </div>
          )}
        </Sheet>
      )}

      {/* 조정 추가/수정 Sheet (Layer 3) */}
      {selectedDate && (
        <Sheet
          isOpen={isAdjustmentSheetOpen}
          onClose={closeAdjustmentSheet}
          title={editingAdjustment ? '조정 수정' : '조정 추가'}
        >
          <div className="space-y-6">
            {/* 안내 메시지 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                💡 할인은 음수(-)로, 추가금액은 양수(+)로 입력하세요
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                예: 할인 10,000원 → -10,000 입력
              </p>
            </div>

            {/* 금액 */}
            <div>
              <label className="block text-sm font-medium mb-2">금액 *</label>
              <input
                type="text"
                value={adjustmentFormData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                onFocus={(e) => e.target.focus({ preventScroll: true })}
                placeholder="-10,000 또는 5,000"
                className="w-full px-4 py-3 border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 사유 */}
            <div>
              <label className="block text-sm font-medium mb-2">사유 (선택)</label>
              <input
                type="text"
                value={adjustmentFormData.reason}
                onChange={(e) => setAdjustmentFormData({ ...adjustmentFormData, reason: e.target.value })}
                onFocus={(e) => e.target.focus({ preventScroll: true })}
                placeholder="예: 단체 할인, 팁"
                maxLength={50}
                className="w-full px-4 py-3 border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={closeAdjustmentSheet}
                className="flex-1 px-4 py-3 border border-divider rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveAdjustment}
                disabled={addAdjustment.isPending || updateAdjustment.isPending}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors disabled:opacity-50"
              >
                {addAdjustment.isPending || updateAdjustment.isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}
