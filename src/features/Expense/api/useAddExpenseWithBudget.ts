import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { queryClient } from "../../../main";
import { Database } from "../../../lib/databaseTypes";

type Props = {
  body: Database["public"]["Functions"]["add_activity_with_budget"]["Args"];
};

const addExpenseWithBudgetAPI = async ({ body }: Props) => {
  const { data, error } = await supabase.rpc("add_activity_with_budget", body);

  if (error) throw new Error(error.message);
  return data;
};

export const useAddExpenseWithBudget = () => {
  return useMutation({
    mutationFn: addExpenseWithBudgetAPI,
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["GetExpenses"] });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};
