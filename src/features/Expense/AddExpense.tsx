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
import { useAddExpenseWithBudget } from "./api/useAddExpenseWithBudget";
import { useAddExpense } from "./api/useAddExpense";
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
import { useGetBudgets } from "../Budget/api/GetBudgets";
import { Database } from "../../lib/databaseTypes";

const formSchema = z
  .object({
    budget_id: z.string().optional(),
    expense_name: z.string().min(2, {
      message: "title must be at least 2 characters.",
    }),
    expense_amount: z
      .number({
        invalid_type_error: "budget must be a number.",
      })
      .min(0, {
        message: "nah! not gonna let u do that :)",
      })
      .max(1000000, {
        message: "lol really dude?",
      }),
    part_of_budget: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.part_of_budget) {
        return data.budget_id !== undefined && data.budget_id !== "";
      }
      return true;
    },
    {
      message: "Choose a Budget to link this expense with.",
      path: ["budget_id"],
    },
  );

export type Activity = z.infer<typeof formSchema>;

const AddExpense = () => {
  const { data: budgetList } = useGetBudgets();

  const addExpense = useAddExpense();
  const addExpenseWithBudget = useAddExpenseWithBudget();

  // 1. Define your form.
  const form = useForm<Activity>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expense_name: "",
      expense_amount: 0,
      part_of_budget: true,
    },
  });

  // 2. Define a submit handler
  function onSubmit(values: Activity) {
    if (values?.budget_id) {
      const body: Database["public"]["Functions"]["add_activity_with_budget"]["Args"] =
        {
          budget_id: values.budget_id,
          expense_amount: values.expense_amount,
          expense_name: values.expense_name,
        };

      addExpenseWithBudget.mutate({
        body,
      });
    } else {
      const body: Database["public"]["Tables"]["expenses"]["Insert"] = {
        budget_id: null,
        expense_amount: values.expense_amount,
        expense_name: values.expense_name,
      };
      addExpense.mutate({
        body,
      });
    }
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
              name="expense_name"
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
              name="expense_amount"
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
                    value={value}
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
                              {option.budget_name}
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

export default AddExpense;
