import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { MonthlyExpense } from '../types';

// 특정 월의 지출 목록 조회
export function useMonthlyExpenses(yearMonth: string) {
  return useQuery({
    queryKey: ['monthlyExpenses', yearMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_expenses')
        .select('*, expense_categories(*)')
        .eq('year_month', yearMonth)
        .order('created_at');

      if (error) {
        console.error('useMonthlyExpenses error:', error);
        throw error;
      }

      // category 필드를 expense_categories에서 가져온 데이터로 매핑
      const expenses = (data || []).map(expense => ({
        ...expense,
        category: expense.expense_categories
      }));

      return expenses as MonthlyExpense[];
    },
  });
}

// 월별 지출 추가 또는 수정
export function useUpsertMonthlyExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: { year_month: string; category_id: string; amount: number; memo?: string | null }) => {
      // 1. 기존 기록 확인
      const { data: existing } = await supabase
        .from('monthly_expenses')
        .select('*')
        .eq('year_month', expense.year_month)
        .eq('category_id', expense.category_id)
        .maybeSingle();

      // memo가 undefined이면 update/insert 대상에서 제외 (복사 시 메모 미변경)
      const updatePayload: { amount: number; memo?: string | null } = { amount: expense.amount };
      if (expense.memo !== undefined) {
        updatePayload.memo = expense.memo;
      }

      if (existing) {
        // 2. 있으면 업데이트
        const { data, error } = await supabase
          .from('monthly_expenses')
          .update(updatePayload)
          .eq('id', existing.id)
          .select('*, expense_categories(*)')
          .single();

        if (error) {
          console.error('Update monthly expense error:', error);
          throw error;
        }

        const result = {
          ...data,
          category: data.expense_categories
        };
        return result as MonthlyExpense;
      } else {
        // 3. 없으면 새로 추가
        const insertPayload: { year_month: string; category_id: string; amount: number; memo?: string | null } = {
          year_month: expense.year_month,
          category_id: expense.category_id,
          amount: expense.amount,
        };
        if (expense.memo !== undefined) {
          insertPayload.memo = expense.memo;
        }

        const { data, error } = await supabase
          .from('monthly_expenses')
          .insert(insertPayload)
          .select('*, expense_categories(*)')
          .single();

        if (error) {
          console.error('Insert monthly expense error:', error);
          throw error;
        }

        const result = {
          ...data,
          category: data.expense_categories
        };
        return result as MonthlyExpense;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['monthlyExpenses', variables.year_month] });
    },
  });
}

// 월별 지출 삭제
export function useDeleteMonthlyExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, year_month }: { id: string; year_month: string }) => {
      const { error } = await supabase
        .from('monthly_expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete monthly expense error:', error);
        throw error;
      }
      return { id, year_month };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['monthlyExpenses', data.year_month] });
    },
  });
}
