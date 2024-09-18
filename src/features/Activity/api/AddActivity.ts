import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { queryClient } from "../../../main";

type Props = {
  body: any;
};

const addActivityAPI = async ({ body }: Props) => {
  const { data: activityData, error: activityError } = await supabase.rpc(
    "activity_is_part_of_budget",
    body,
  );

  if (activityError) throw new Error(activityError.message);

  return activityData;
};

export const useAddActivity = () => {
  return useMutation({
    mutationFn: addActivityAPI,
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["GetActivities"] });
    },
    onError: (err) => {
      console.log(err);
    },
  });
};
