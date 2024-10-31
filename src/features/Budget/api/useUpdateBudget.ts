import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { queryClient } from "../../../main";
import { Database } from "../../../lib/databaseTypes";

type Props = {
  body: Database["public"]["Tables"]["budget"]["Update"];
};

const updateBudgetAPI = async ({ body }: Props) => {
  if (!body.id) throw new Error("Budget id is required");

  const { data, error } = await supabase
    .from("budget")
    .update(body)
    .eq("id", body.id);
  if (error) throw new Error(error.message);
  return data;
};

export const useUpdateBudget = () => {
  return useMutation({
    mutationFn: updateBudgetAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GetBudgets"] });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};
