import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import Calendar from '../../components/Calendar';
import Sheet from '../../components/Sheet';
import TreatmentButton from '../../components/TreatmentButton';
import { useMonthlyRecords, useDailyRecords, useAddDailyRecord, useDeleteDailyRecord } from '../../hooks/useDailyRecords';
import { useTreatments } from '../../hooks/useTreatments';
import { formatCurrency, formatFullCurrency } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/date';

export default function CalendarTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isTreatmentSheetOpen, setIsTreatmentSheetOpen] = useState(false);

  const yearMonth = format(currentDate, 'yyyy-MM');
  const { data: monthlyRecords = [] } = useMonthlyRecords(yearMonth);
  const { data: dailyRecords = [] } = useDailyRecords(selectedDate || '');
  const { data: treatments = [] } = useTreatments();
  const addRecord = useAddDailyRecord();
  const deleteRecord = useDeleteDailyRecord();

  // 월 총 매출 계산
  const monthlyTotal = monthlyRecords.reduce((sum, record) => sum + record.total_amount, 0);

  // 일별 총 매출
  const dailyTotal = dailyRecords.reduce((sum, record) => sum + record.total_amount, 0);

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
  };

  // 시술 선택 Sheet 열기
  const openTreatmentSheet = () => {
    setIsTreatmentSheetOpen(true);
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
        <div className="bg-blue-50 rounded-lg p-3 text-center">
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
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-sm text-textSecondary mb-1">일 총 매출</div>
            <div className="text-xl font-bold text-primary">{formatFullCurrency(dailyTotal)}</div>
          </div>

          {/* 시술 추가 버튼 */}
          <button
            onClick={openTreatmentSheet}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            <span>시술 추가</span>
          </button>

          {/* 시술 기록 리스트 */}
          {dailyRecords.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-textSecondary">시술 내역</h3>
              {dailyRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-card rounded-lg p-3 border border-divider flex items-center gap-3"
                >
                  {/* 색상 표시 */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: record.treatment?.color + '26' }}
                  >
                    {record.treatment?.icon || ''}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1">
                    <h4 className="font-semibold">{record.treatment?.name}</h4>
                    <p className="text-sm text-textSecondary">
                      {record.count}회 × {formatCurrency(record.treatment?.price || 0)} = {formatFullCurrency(record.total_amount)}
                    </p>
                  </div>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={() => handleDeleteRecord(record.id, record.treatment?.name || '')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-textSecondary">
              <p className="text-3xl mb-2">📝</p>
              <p>기록된 시술이 없습니다</p>
              <p className="text-sm mt-1">+ 시술 추가 버튼을 눌러보세요</p>
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
    </div>
  );
}
