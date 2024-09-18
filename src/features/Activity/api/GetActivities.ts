import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";

export const getActivityAPI = async () => {
  const { data, error } = await supabase.from("budget_activity").select(`
    id, activity_title, activity_amount, budget (id, title)
    `);
  if (error) throw new Error(error.message);
  return data;
};

export const useGetActivities = () => {
  return useQuery({
    queryKey: ["GetActivities"],
    queryFn: () => getActivityAPI(),
    // select: ({ data }) => data.data,
  });
};
