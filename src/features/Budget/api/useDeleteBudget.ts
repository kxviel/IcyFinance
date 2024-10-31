import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { queryClient } from "../../../main";

type Props = {
  body: {
    id: string;
  };
};

const deleteBudgetAPI = async ({ body }: Props) => {
  if (!body.id) throw new Error("Budget id is required");

  const { data, error } = await supabase
    .from("budget")
    .delete()
    .eq("id", body.id);
  if (error) throw new Error(error.message);
  return data;
};

export const useDeleteBudget = () => {
  return useMutation({
    mutationFn: deleteBudgetAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GetBudgets"] });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};
