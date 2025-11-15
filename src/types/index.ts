// 시술 타입
export interface Treatment {
  id: string;
  name: string;
  price: number;
  icon?: string;
  color: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

// 일별 기록 타입
export interface DailyRecord {
  id: string;
  date: string;
  treatment_id: string;
  count: number;
  total_amount: number;
  created_at?: string;
  treatment?: Treatment;
}

// 지출 항목 타입
export interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string;
  order: number;
  created_at?: string;
}

// 월별 지출 타입
export interface MonthlyExpense {
  id: string;
  year_month: string;
  category_id: string;
  amount: number;
  created_at?: string;
  category?: ExpenseCategory;
}

// 데이터베이스 타입
export interface Database {
  public: {
    Tables: {
      treatments: {
        Row: Treatment;
        Insert: Omit<Treatment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Treatment, 'id' | 'created_at' | 'updated_at'>>;
      };
      daily_records: {
        Row: DailyRecord;
        Insert: Omit<DailyRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<DailyRecord, 'id' | 'created_at'>>;
      };
      expense_categories: {
        Row: ExpenseCategory;
        Insert: Omit<ExpenseCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<ExpenseCategory, 'id' | 'created_at'>>;
      };
      monthly_expenses: {
        Row: MonthlyExpense;
        Insert: Omit<MonthlyExpense, 'id' | 'created_at'>;
        Update: Partial<Omit<MonthlyExpense, 'id' | 'created_at'>>;
      };
    };
  };
}
