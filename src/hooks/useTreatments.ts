import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Treatment } from '../types';

// 시술 목록 조회
export function useTreatments() {
  return useQuery({
    queryKey: ['treatments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .order('order');

      if (error) throw error;
      return data as Treatment[];
    },
  });
}

// 시술 추가
export function useAddTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (treatment: Omit<Treatment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('treatments')
        .insert(treatment)
        .select()
        .single();

      if (error) throw error;
      return data as Treatment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
    },
  });
}

// 시술 수정
export function useUpdateTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Treatment> & { id: string }) => {
      const { data, error } = await supabase
        .from('treatments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Treatment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
    },
  });
}

// 시술 삭제
export function useDeleteTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('treatments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
    },
  });
}

// 시술 순서 변경
export function useReorderTreatments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (treatments: Treatment[]) => {
      // 각 시술의 order를 업데이트
      const updates = treatments.map((treatment, index) =>
        supabase
          .from('treatments')
          .update({ order: index })
          .eq('id', treatment.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
    },
  });
}
