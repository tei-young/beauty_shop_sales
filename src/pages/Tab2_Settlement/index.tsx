import { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Plus, Trash2, Settings } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import Sheet from '../../components/Sheet';
import { useMonthlyRecords } from '../../hooks/useDailyRecords';
import { useExpenseCategories, useAddExpenseCategory, useUpdateExpenseCategory, useDeleteExpenseCategory } from '../../hooks/useExpenseCategories';
import { useMonthlyExpenses, useUpsertMonthlyExpense } from '../../hooks/useMonthlyExpenses';
import { formatFullCurrency } from '../../utils/currency';
import type { ExpenseCategory } from '../../types';

export default function SettlementTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [expenseAmount, setExpenseAmount] = useState('');

  // 지출 항목 관리 상태
  const [isCategoryManageSheetOpen, setIsCategoryManageSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', icon: '' });

  const yearMonth = format(currentDate, 'yyyy-MM');
  const { data: monthlyRecords = [] } = useMonthlyRecords(yearMonth);
  const { data: expenseCategories = [] } = useExpenseCategories();
  const { data: monthlyExpenses = [] } = useMonthlyExpenses(yearMonth);
  const upsertExpense = useUpsertMonthlyExpense();
  const addCategory = useAddExpenseCategory();
  const updateCategory = useUpdateExpenseCategory();
  const deleteCategory = useDeleteExpenseCategory();

  // 월 총 매출 계산
  const monthlyRevenue = monthlyRecords.reduce((sum, record) => sum + record.total_amount, 0);

  // 월 총 지출 계산
  const monthlyExpense = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // 순이익 계산
  const netProfit = monthlyRevenue - monthlyExpense;

  // 월 변경
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // 지출 금액 입력 클릭
  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    const existingExpense = monthlyExpenses.find(e => e.category_id === categoryId);
    setSelectedCategory({ id: categoryId, name: categoryName });
    setExpenseAmount(existingExpense ? existingExpense.amount.toString() : '');
  };

  // 지출 금액 Sheet 닫기
  const closeExpenseSheet = () => {
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
      closeExpenseSheet();
    } catch (err: any) {
      alert(err.message || '저장 중 오류가 발생했습니다.');
    }
  };

  // 지출 항목 추가 Sheet 열기
  const openAddCategorySheet = () => {
    setCategoryFormData({ name: '', icon: '' });
    setEditingCategory(null);
    setIsCategoryManageSheetOpen(true);
  };

  // 지출 항목 수정 Sheet 열기
  const openEditCategorySheet = (category: ExpenseCategory, e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    setCategoryFormData({ name: category.name, icon: category.icon || '' });
    setEditingCategory(category);
    setIsCategoryManageSheetOpen(true);
  };

  // 지출 항목 관리 Sheet 닫기
  const closeCategorySheet = () => {
    setIsCategoryManageSheetOpen(false);
    setEditingCategory(null);
  };

  // 지출 항목 저장
  const handleSaveCategory = async () => {
    if (!categoryFormData.name) {
      alert('항목명을 입력해주세요.');
      return;
    }

    try {
      if (editingCategory) {
        // 수정
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          name: categoryFormData.name,
          icon: categoryFormData.icon || undefined,
        });
      } else {
        // 추가
        const maxOrder = expenseCategories.reduce((max, c) => Math.max(max, c.order), -1);
        await addCategory.mutateAsync({
          name: categoryFormData.name,
          icon: categoryFormData.icon || undefined,
          order: maxOrder + 1,
        });
      }
      closeCategorySheet();
    } catch (err: any) {
      alert(err.message || '오류가 발생했습니다.');
    }
  };

  // 지출 항목 삭제
  const handleDeleteCategory = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    if (!confirm(`"${name}" 항목을 삭제하시겠습니까?`)) return;

    try {
      await deleteCategory.mutateAsync(id);
    } catch (err: any) {
      alert(err.message || '삭제 중 오류가 발생했습니다.');
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
          <div className="bg-accent rounded-lg p-4">
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">지출 관리</h2>
            <button
              onClick={openAddCategorySheet}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors"
            >
              <Plus size={16} />
              <span>항목 추가</span>
            </button>
          </div>

          {expenseCategories.length > 0 ? (
            <div className="space-y-3">
              {expenseCategories.map((category) => {
                const amount = getExpenseAmount(category.id);

                return (
                  <div
                    key={category.id}
                    className="bg-card rounded-lg p-4 border border-divider"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{category.icon || '📝'}</div>
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-textSecondary">
                            {amount > 0 ? formatFullCurrency(amount) : '미입력'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => openEditCategorySheet(category, e)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="항목 수정"
                        >
                          <Settings size={18} className="text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteCategory(category.id, category.name, e)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="항목 삭제"
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCategoryClick(category.id, category.name)}
                      className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="text-sm text-textSecondary">금액 입력</span>
                      <Edit2 size={16} className="text-gray-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-textSecondary">
              <p className="text-4xl mb-4">📝</p>
              <p>등록된 지출 항목이 없습니다</p>
              <p className="text-sm mt-2">+ 항목 추가 버튼을 눌러 지출 항목을 추가해보세요</p>
            </div>
          )}
        </div>
      </div>

      {/* 지출 금액 입력 Sheet */}
      <Sheet
        isOpen={selectedCategory !== null}
        onClose={closeExpenseSheet}
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
              onClick={closeExpenseSheet}
              className="flex-1 px-4 py-3 border border-divider rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSaveExpense}
              disabled={upsertExpense.isPending}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors disabled:opacity-50"
            >
              {upsertExpense.isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </Sheet>

      {/* 지출 항목 추가/수정 Sheet */}
      <Sheet
        isOpen={isCategoryManageSheetOpen}
        onClose={closeCategorySheet}
        title={editingCategory ? '지출 항목 수정' : '지출 항목 추가'}
      >
        <div className="space-y-6">
          {/* 항목명 */}
          <div>
            <label className="block text-sm font-medium mb-2">항목명 *</label>
            <input
              type="text"
              value={categoryFormData.name}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
              placeholder="예: 월세"
              maxLength={20}
              className="w-full px-4 py-3 border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* 이모지 */}
          <div>
            <label className="block text-sm font-medium mb-2">이모지 (선택)</label>
            <input
              type="text"
              value={categoryFormData.icon}
              onChange={(e) => {
                // 이모지만 필터링
                const filtered = e.target.value.split('').filter(char =>
                  /\p{Emoji}/u.test(char)
                ).join('');
                setCategoryFormData({ ...categoryFormData, icon: filtered.slice(0, 2) });
              }}
              placeholder="🏠"
              className="w-full px-4 py-3 border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-3xl"
            />
            <p className="text-xs text-textSecondary mt-1">
              키보드에서 이모지를 선택하세요
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={closeCategorySheet}
              className="flex-1 px-4 py-3 border border-divider rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSaveCategory}
              disabled={addCategory.isPending || updateCategory.isPending}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors disabled:opacity-50"
            >
              {addCategory.isPending || updateCategory.isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
