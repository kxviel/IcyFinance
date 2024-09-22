import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { queryClient } from "../../../main";
import { Database } from "../../../lib/databaseTypes";

type Props = {
  body: Database["public"]["Tables"]["expenses"]["Insert"];
};

const addExpenseAPI = async ({ body }: Props) => {
  const { data, error } = await supabase.from("expenses").insert(body);

  if (error) throw new Error(error.message);
  return data;
};

export const useAddExpense = () => {
  return useMutation({
    mutationFn: addExpenseAPI,
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["GetExpenses"] });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};
