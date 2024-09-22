import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export const getExpensesAPI = async () => {
  const { data, error } = await supabase.from("expenses").select(`
    id, expense_name, expense_amount, budget_id, budget (id, budget_name)
    `);
  if (error) throw new Error(error.message);
  return data;
};

export const useGetExpenses = () => {
  return useQuery({
    queryKey: ["GetExpenses"],
    queryFn: getExpensesAPI,
  });
};
