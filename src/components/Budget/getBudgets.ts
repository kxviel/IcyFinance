import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

export const getBudgetAPI = async () => {
  const { data, error } = await supabase.from("budget").select();
  if (error) throw new Error(error.message);
  return data;
};

export const useGetBudgets = () => {
  return useQuery({
    queryKey: ["GetBudgets"],
    queryFn: () => getBudgetAPI(),
    // select: ({ data }) => data.data,
  });
};
