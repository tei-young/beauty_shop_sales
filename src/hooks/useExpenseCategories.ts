import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { ExpenseCategory } from '../types';

// 지출 항목 목록 조회
export function useExpenseCategories() {
  return useQuery({
    queryKey: ['expenseCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('order');

      if (error) {
        console.error('useExpenseCategories error:', error);
        throw error;
      }
      return data as ExpenseCategory[];
    },
  });
}

// 지출 항목 추가
export function useAddExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<ExpenseCategory, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('expense_categories')
        .insert(category)
        .select()
        .single();

      if (error) {
        console.error('Add expense category error:', error);
        throw error;
      }
      return data as ExpenseCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseCategories'] });
    },
  });
}

// 지출 항목 수정
export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExpenseCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('expense_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update expense category error:', error);
        throw error;
      }
      return data as ExpenseCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseCategories'] });
    },
  });
}

// 지출 항목 삭제
export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete expense category error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseCategories'] });
    },
  });
}
