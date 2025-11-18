import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { DailyAdjustment } from '../types';

// 특정 날짜의 조정 목록 조회
export function useDailyAdjustments(date: string) {
  return useQuery({
    queryKey: ['daily-adjustments', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_adjustments')
        .select('*')
        .eq('date', date)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as DailyAdjustment[];
    },
  });
}

// 조정 추가
export function useAddAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adjustment: Omit<DailyAdjustment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('daily_adjustments')
        .insert(adjustment)
        .select()
        .single();

      if (error) throw error;
      return data as DailyAdjustment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['daily-adjustments', data.date] });
      queryClient.invalidateQueries({ queryKey: ['daily-records'] });
    },
  });
}

// 조정 수정
export function useUpdateAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, date, ...updates }: Partial<DailyAdjustment> & { id: string; date: string }) => {
      const { data, error } = await supabase
        .from('daily_adjustments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as DailyAdjustment, date };
    },
    onSuccess: ({ date }) => {
      queryClient.invalidateQueries({ queryKey: ['daily-adjustments', date] });
      queryClient.invalidateQueries({ queryKey: ['daily-records'] });
    },
  });
}

// 조정 삭제
export function useDeleteAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const { error } = await supabase
        .from('daily_adjustments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { date };
    },
    onSuccess: ({ date }) => {
      queryClient.invalidateQueries({ queryKey: ['daily-adjustments', date] });
      queryClient.invalidateQueries({ queryKey: ['daily-records'] });
    },
  });
}
