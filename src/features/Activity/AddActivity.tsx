import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { useGetBudgets } from "../../components/Budget/getBudgets";
import { useAddActivity } from "./api/AddActivity";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const formSchema = z
  .object({
    activity_title: z.string().min(2, {
      message: "title must be at least 2 characters.",
    }),
    activity_amount: z
      .number({
        invalid_type_error: "budget must be a number.",
      })
      .min(0, {
        message: "budget must be greater than 0.",
      })
      .max(1000000, {
        message: "budget must be less than 1,000,000.",
      }),
    part_of_budget: z.boolean(),
    budget_id: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.part_of_budget) {
        return data.budget_id !== undefined && data.budget_id !== "";
      }
      return true;
    },
    {
      message: "budget_id is required when part_of_budget is true",
      path: ["budget_id"],
    },
  );

export type Activity = z.infer<typeof formSchema>;

const AddActivity = () => {
  const { data: budgetList } = useGetBudgets();

  const addActivity = useAddActivity();

  // 1. Define your form.
  const form = useForm<Activity>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activity_title: "",
      activity_amount: 0,
      part_of_budget: true,
    },
  });

  // 2. Define a submit handler.
  function onSubmit({ part_of_budget, ...values }: Activity) {
    const body = {
      ...values,
      budget_id: part_of_budget ? values.budget_id : null,
    };

    addActivity.mutate({
      body,
    });
  }
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Add Expense</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Enter the details of your new expense.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="activity_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Title</FormLabel>
                  <FormControl>
                    <Input
                      className="col-span-3"
                      placeholder="Housing Expense"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the title of your Activity.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activity_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Amount</FormLabel>
                  <FormControl>
                    <Input
                      className="col-span-3"
                      placeholder="$100"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the amount of your Activity.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2">
              <FormField
                name="part_of_budget"
                control={form.control}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    id="terms"
                    onCheckedChange={onChange}
                    checked={!!value}
                  />
                )}
              />

              <label htmlFor="terms1" className="text-sm font-medium">
                Is this a part of a budget?
              </label>
            </div>

            <FormField
              name="budget_id"
              control={form.control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <div>
                  <Select
                    onValueChange={onChange}
                    value={value ? value.toString() : ""}
                    disabled={!form.watch("part_of_budget")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {budgetList &&
                          budgetList.map((option) => (
                            <SelectItem
                              key={option.id}
                              value={option.id.toString()}
                            >
                              {option.title}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {error && (
                    <p className="mt-1 text-sm text-red-500">{error.message}</p>
                  )}
                </div>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            Save Expense
          </Button>

          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                form.reset();
              }}
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddActivity;
