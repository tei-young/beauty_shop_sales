import { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import Sheet from '../../components/Sheet';
import { useMonthlyRecords } from '../../hooks/useDailyRecords';
import { useExpenseCategories } from '../../hooks/useExpenseCategories';
import { useMonthlyExpenses, useUpsertMonthlyExpense } from '../../hooks/useMonthlyExpenses';
import { formatFullCurrency } from '../../utils/currency';

export default function SettlementTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [expenseAmount, setExpenseAmount] = useState('');

  const yearMonth = format(currentDate, 'yyyy-MM');
  const { data: monthlyRecords = [] } = useMonthlyRecords(yearMonth);
  const { data: expenseCategories = [] } = useExpenseCategories();
  const { data: monthlyExpenses = [] } = useMonthlyExpenses(yearMonth);
  const upsertExpense = useUpsertMonthlyExpense();

  // 월 총 매출 계산
  const monthlyRevenue = monthlyRecords.reduce((sum, record) => sum + record.total_amount, 0);

  // 월 총 지출 계산
  const monthlyExpense = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // 순이익 계산
  const netProfit = monthlyRevenue - monthlyExpense;

  // 월 변경
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // 지출 항목 클릭
  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    const existingExpense = monthlyExpenses.find(e => e.category_id === categoryId);
    setSelectedCategory({ id: categoryId, name: categoryName });
    setExpenseAmount(existingExpense ? existingExpense.amount.toString() : '');
  };

  // Sheet 닫기
  const closeSheet = () => {
    setSelectedCategory(null);
    setExpenseAmount('');
  };

  // 지출 저장
  const handleSaveExpense = async () => {
    if (!selectedCategory) return;

    const amount = parseInt(expenseAmount) || 0;

    try {
      await upsertExpense.mutateAsync({
        year_month: yearMonth,
        category_id: selectedCategory.id,
        amount,
      });
      closeSheet();
    } catch (err: any) {
      alert(err.message || '저장 중 오류가 발생했습니다.');
    }
  };

  // 특정 카테고리의 지출 금액 가져오기
  const getExpenseAmount = (categoryId: string) => {
    const expense = monthlyExpenses.find(e => e.category_id === categoryId);
    return expense ? expense.amount : 0;
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="p-m border-b border-divider">
        <div className="flex items-center justify-between">
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
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 상단 50%: 결산 결과 */}
        <div className="p-m space-y-4">
          <h2 className="text-lg font-semibold">결산 결과</h2>

          {/* 월 매출 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-textSecondary mb-1">💰 월 매출</div>
            <div className="text-2xl font-bold text-primary">{formatFullCurrency(monthlyRevenue)}</div>
          </div>

          {/* 총 지출 */}
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-textSecondary mb-1">💸 총 지출</div>
            <div className="text-2xl font-bold text-red-600">{formatFullCurrency(monthlyExpense)}</div>
          </div>

          {/* 구분선 */}
          <div className="border-t-2 border-divider my-4" />

          {/* 순이익 */}
          <div className={`rounded-lg p-4 ${netProfit >= 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
            <div className="text-sm text-textSecondary mb-1">
              ✨ 순이익 {netProfit < 0 ? '(적자)' : ''}
            </div>
            <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {formatFullCurrency(netProfit)}
            </div>
          </div>
        </div>

        {/* 하단 50%: 지출 관리 */}
        <div className="p-m space-y-4 border-t-8 border-background">
          <h2 className="text-lg font-semibold">지출 관리</h2>

          {expenseCategories.length > 0 ? (
            <div className="space-y-3">
              {expenseCategories.map((category) => {
                const amount = getExpenseAmount(category.id);

                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id, category.name)}
                    className="w-full bg-card rounded-lg p-4 border border-divider hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{category.icon || '📝'}</div>
                        <div className="text-left">
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-textSecondary">
                            {amount > 0 ? formatFullCurrency(amount) : '미입력'}
                          </p>
                        </div>
                      </div>
                      <Edit2 size={20} className="text-gray-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-textSecondary">
              <p className="text-4xl mb-4">📝</p>
              <p>등록된 지출 항목이 없습니다</p>
              <p className="text-sm mt-2">설정 탭에서 지출 항목을 추가해주세요</p>
            </div>
          )}
        </div>
      </div>

      {/* 지출 입력 Sheet */}
      <Sheet
        isOpen={selectedCategory !== null}
        onClose={closeSheet}
        title={selectedCategory?.name || ''}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">지출 금액</label>
            <input
              type="number"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-xl text-center"
              autoFocus
            />
            <p className="text-sm text-textSecondary mt-2 text-center">
              {expenseAmount ? formatFullCurrency(parseInt(expenseAmount) || 0) : '금액을 입력하세요'}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={closeSheet}
              className="flex-1 px-4 py-3 border border-divider rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSaveExpense}
              disabled={upsertExpense.isPending}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {upsertExpense.isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
