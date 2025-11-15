import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { DailyRecord } from '../types';

interface CalendarProps {
  currentDate: Date;
  records: DailyRecord[];
  onDateClick: (date: string) => void;
}

export default function Calendar({ currentDate, records, onDateClick }: CalendarProps) {
  // 캘린더 그리드를 위한 날짜 배열 생성
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일 시작
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // 특정 날짜의 시술 기록들 가져오기
  const getRecordsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return records.filter((record) => record.date === dateString);
  };

  // 특정 날짜의 총 매출
  const getTotalForDate = (date: Date) => {
    const dateRecords = getRecordsForDate(date);
    return dateRecords.reduce((sum, record) => sum + record.total_amount, 0);
  };

  return (
    <div className="bg-card rounded-lg p-4">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-medium py-2 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-textSecondary'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          const dateString = format(day, 'yyyy-MM-dd');
          const dayRecords = getRecordsForDate(day);
          const hasRecords = dayRecords.length > 0;

          return (
            <button
              key={dateString}
              onClick={() => onDateClick(dateString)}
              className={`
                relative aspect-square rounded-lg p-2
                transition-all duration-200
                ${isCurrentMonth ? 'bg-background' : 'bg-gray-50'}
                ${isCurrentDay ? 'ring-2 ring-primary' : ''}
                ${hasRecords ? 'hover:bg-blue-50' : 'hover:bg-gray-100'}
              `}
            >
              {/* 날짜 숫자 */}
              <div
                className={`
                  text-sm font-medium
                  ${!isCurrentMonth ? 'text-gray-300' : ''}
                  ${isCurrentDay ? 'text-primary font-bold' : ''}
                `}
              >
                {format(day, 'd')}
              </div>

              {/* 시술 도트 */}
              {hasRecords && (
                <div className="flex gap-0.5 justify-center mt-1 flex-wrap">
                  {dayRecords.slice(0, 3).map((record, index) => (
                    <div
                      key={index}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: record.treatment?.color || '#999' }}
                    />
                  ))}
                  {dayRecords.length > 3 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
