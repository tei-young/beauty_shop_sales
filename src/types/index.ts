// 데이터베이스 Row 타입 (실제 DB 컬럼만 포함)
export interface TreatmentRow {
  id: string;
  name: string;
  price: number;
  icon: string | null;
  color: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface DailyRecordRow {
  id: string;
  date: string;
  treatment_id: string;
  count: number;
  total_amount: number;
  created_at: string;
}

export interface ExpenseCategoryRow {
  id: string;
  name: string;
  icon: string | null;
  order: number;
  created_at: string;
}

export interface MonthlyExpenseRow {
  id: string;
  year_month: string;
  category_id: string;
  amount: number;
  memo: string | null;
  created_at: string;
}

export interface DailyAdjustmentRow {
  id: string;
  date: string;
  amount: number;
  reason: string | null;
  created_at: string;
}

// 애플리케이션 타입 (조인된 데이터 포함)
export interface Treatment {
  id: string;
  name: string;
  price: number;
  icon?: string | null;
  color: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface DailyRecord {
  id: string;
  date: string;
  treatment_id: string;
  count: number;
  total_amount: number;
  created_at?: string;
  treatment?: Treatment;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string | null;
  order: number;
  created_at?: string;
}

export interface MonthlyExpense {
  id: string;
  year_month: string;
  category_id: string;
  amount: number;
  memo?: string | null;
  created_at?: string;
  category?: ExpenseCategory;
}

export interface DailyAdjustment {
  id: string;
  date: string;
  amount: number;
  reason?: string | null;
  created_at?: string;
}

// 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      treatments: {
        Row: TreatmentRow;
        Insert: Omit<TreatmentRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TreatmentRow, 'id' | 'created_at' | 'updated_at'>>;
      };
      daily_records: {
        Row: DailyRecordRow;
        Insert: Omit<DailyRecordRow, 'id' | 'created_at'>;
        Update: Partial<Omit<DailyRecordRow, 'id' | 'created_at'>>;
      };
      expense_categories: {
        Row: ExpenseCategoryRow;
        Insert: Omit<ExpenseCategoryRow, 'id' | 'created_at'>;
        Update: Partial<Omit<ExpenseCategoryRow, 'id' | 'created_at'>>;
      };
      monthly_expenses: {
        Row: MonthlyExpenseRow;
        Insert: Omit<MonthlyExpenseRow, 'id' | 'created_at'>;
        Update: Partial<Omit<MonthlyExpenseRow, 'id' | 'created_at'>>;
      };
      daily_adjustments: {
        Row: DailyAdjustmentRow;
        Insert: Omit<DailyAdjustmentRow, 'id' | 'created_at'>;
        Update: Partial<Omit<DailyAdjustmentRow, 'id' | 'created_at'>>;
      };
    };
  };
}
