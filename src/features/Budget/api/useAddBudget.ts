import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { queryClient } from "../../../main";
import { Database } from "../../../lib/databaseTypes";

type Props = {
  body: Database["public"]["Tables"]["budget"]["Insert"];
};

const addBudgetAPI = async ({ body }: Props) => {
  console.log(body);

  const { data, error } = await supabase.from("budget").insert(body);
  if (error) throw new Error(error.message);
  return data;
};

export const useAddBudget = () => {
  return useMutation({
    mutationFn: addBudgetAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GetBudgets"] });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};
