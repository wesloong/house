import { create } from 'zustand';
import type { ProblemLog, ProblemType } from '@/types';

interface ProblemStore {
  problems: ProblemLog[];
  setProblems: (problems: ProblemLog[]) => void;
  addProblem: (problem: ProblemLog) => void;
  filters: {
    type: ProblemType | ''; // 问题类型筛选
    roomNumber: string;
    startDate: string;
    endDate: string;
  };
  setFilters: (filters: Partial<ProblemStore['filters']>) => void;
}

export const useProblemStore = create<ProblemStore>((set) => ({
  problems: [],
  setProblems: (problems) => set({ problems }),
  addProblem: (problem) => set((state) => ({ 
    problems: [problem, ...state.problems] 
  })),
  filters: {
    type: '',
    roomNumber: '',
    startDate: '',
    endDate: '',
  },
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
}));

