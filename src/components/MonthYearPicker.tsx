import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

interface MonthYearPickerProps {
  currentDate: Date;
  onChange: (date: Date) => void;
  className?: string;
}

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export default function MonthYearPicker({ currentDate, onChange, className }: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());

  // < > 버튼으로 월이 바뀌면 팝오버 내 연도도 동기
  useEffect(() => {
    setPickerYear(currentDate.getFullYear());
  }, [currentDate]);

  const handleMonthClick = (monthIndex: number) => {
    onChange(new Date(pickerYear, monthIndex, 1));
    setIsOpen(false);
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  return (
    <div className={`relative ${className || ''}`}>
      {/* 헤더 행: < 연월⌄ > */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onChange(subMonths(currentDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1"
        >
          <span className="text-xl font-semibold">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </span>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <button
          onClick={() => onChange(addMonths(currentDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* 팝오버 (백드롭 + 그리드) */}
      {isOpen && (
        <>
          {/* 백드롭 — 팝오버 밖 클릭/탭 시 닫기 */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />

          {/* 팝오버 본체 */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-divider rounded-xl shadow-lg z-40 p-3 w-60">
            {/* 연도 네비 */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setPickerYear(y => y - 1)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-semibold">{pickerYear}년</span>
              <button
                onClick={() => setPickerYear(y => y + 1)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* 월 그리드 — 4열 × 3행 */}
            <div className="grid grid-cols-4 gap-1">
              {MONTHS.map((month, index) => {
                const isSelected = pickerYear === currentYear && index === currentMonth;
                return (
                  <button
                    key={index}
                    onClick={() => handleMonthClick(index)}
                    className={`
                      py-2 rounded-lg text-sm font-medium transition-colors
                      ${isSelected
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
