import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { queryClient } from "../../../main";

type Props = {
  body: any;
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
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["GetBudgets"] });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};
