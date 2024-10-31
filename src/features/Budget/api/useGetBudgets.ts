import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export type BudgetResponse = {
  budget_amount: number;
  budget_available: number;
  budget_expenses: number;
  budget_name: string;
  created_at: string;
  id: string;
  updated_at: string;
}[];

export const getBudgetAPI = async (): Promise<BudgetResponse> => {
  const { data, error } = await supabase
    .from("budget")
    .select()
    .order("budget_name");
  if (error) throw new Error(error.message);
  return data;
};

export const useGetBudgets = () => {
  return useQuery({
    queryKey: ["GetBudgets"],
    queryFn: getBudgetAPI,
  });
};
