import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { DailyRecord } from '../types';

// 특정 날짜의 일별 기록 조회
export function useDailyRecords(date: string) {
  return useQuery({
    queryKey: ['dailyRecords', date],
    queryFn: async () => {
      if (!date) return [];

      const { data, error } = await supabase
        .from('daily_records')
        .select('*, treatments(*)')
        .eq('date', date)
        .order('created_at');

      if (error) {
        console.error('useDailyRecords error:', error);
        throw error;
      }

      // treatment 필드를 treatments에서 가져온 데이터로 매핑
      const records = (data || []).map(record => ({
        ...record,
        treatment: record.treatments
      }));

      return records as DailyRecord[];
    },
    enabled: !!date,
  });
}

// 특정 월의 모든 기록 조회
export function useMonthlyRecords(yearMonth: string) {
  return useQuery({
    queryKey: ['monthlyRecords', yearMonth],
    queryFn: async () => {
      // 날짜 범위를 정확히 계산 (각 월의 실제 마지막 날 사용)
      const year = parseInt(yearMonth.split('-')[0]);
      const month = parseInt(yearMonth.split('-')[1]);

      // 해당 월의 첫날과 마지막날 (로컬 시간대 기준)
      const startDate = `${yearMonth}-01`; // YYYY-MM-01
      const lastDayOfMonth = new Date(year, month, 0).getDate(); // 월의 마지막 일
      const endDate = `${yearMonth}-${String(lastDayOfMonth).padStart(2, '0')}`; // YYYY-MM-DD

      const { data, error } = await supabase
        .from('daily_records')
        .select('*, treatments(*)')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');

      if (error) {
        console.error('useMonthlyRecords error:', error);
        throw error;
      }

      // treatment 필드를 treatments에서 가져온 데이터로 매핑
      const records = (data || []).map(record => ({
        ...record,
        treatment: record.treatments
      }));

      return records as DailyRecord[];
    },
  });
}

// 시술 기록 추가
export function useAddDailyRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: { date: string; treatment_id: string; count: number; total_amount: number }) => {
      // 1. 기존 기록 확인
      const { data: existing } = await supabase
        .from('daily_records')
        .select('*')
        .eq('date', record.date)
        .eq('treatment_id', record.treatment_id)
        .maybeSingle();

      if (existing) {
        // 2. 있으면 count 증가
        const { data, error } = await supabase
          .from('daily_records')
          .update({
            count: existing.count + record.count,
            total_amount: existing.total_amount + record.total_amount,
          })
          .eq('id', existing.id)
          .select('*, treatments(*)')
          .single();

        if (error) {
          console.error('Update record error:', error);
          throw error;
        }

        const result = {
          ...data,
          treatment: data.treatments
        };
        return result as DailyRecord;
      } else {
        // 3. 없으면 새로 추가
        const { data, error } = await supabase
          .from('daily_records')
          .insert(record)
          .select('*, treatments(*)')
          .single();

        if (error) {
          console.error('Insert record error:', error);
          throw error;
        }

        const result = {
          ...data,
          treatment: data.treatments
        };
        return result as DailyRecord;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dailyRecords', variables.date] });
      const yearMonth = variables.date.substring(0, 7);
      queryClient.invalidateQueries({ queryKey: ['monthlyRecords', yearMonth] });
    },
  });
}

// 시술 기록 수정
export function useUpdateDailyRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, count, total_amount }: { id: string; count: number; total_amount: number }) => {
      const { data, error } = await supabase
        .from('daily_records')
        .update({ count, total_amount })
        .eq('id', id)
        .select('*, treatments(*)')
        .single();

      if (error) {
        console.error('Update record error:', error);
        throw error;
      }

      const result = {
        ...data,
        treatment: data.treatments
      };
      return result as DailyRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dailyRecords', data.date] });
      const yearMonth = data.date.substring(0, 7);
      queryClient.invalidateQueries({ queryKey: ['monthlyRecords', yearMonth] });
    },
  });
}

// 시술 기록 삭제
export function useDeleteDailyRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const { error } = await supabase
        .from('daily_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete record error:', error);
        throw error;
      }
      return { id, date };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dailyRecords', data.date] });
      const yearMonth = data.date.substring(0, 7);
      queryClient.invalidateQueries({ queryKey: ['monthlyRecords', yearMonth] });
    },
  });
}
