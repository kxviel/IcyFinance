import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGetBudgets } from "./getBudgets";
import { useAddBudget } from "./addBudget";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "title must be at least 2 characters.",
  }),
  assigned_budget: z
    .number({
      invalid_type_error: "budget must be a number.",
    })
    .min(0, {
      message: "budget must be greater than 0.",
    })
    .max(1000000, {
      message: "budget must be less than 1,000,000.",
    }),
});

type Budget = {
  id: number;
  title: string;
  assigned_budget: number;
  activity: number;
  amount_available: number;
};

export default function Budget() {
  const { data: budgetList } = useGetBudgets();

  const addBudget = useAddBudget();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      assigned_budget: 0,
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    addBudget.mutate({ body: values });
  }

  return (
    <main className="flex h-full w-full flex-col items-center gap-[48px] p-8">
      <h1 className="self-start text-3xl font-bold">Budgets</h1>

      <div className="flex w-full items-center justify-between gap-2">
        <Input placeholder="Search" type="search" className="w-[50%]" />

        <Dialog>
          <DialogTrigger>
            <Button>Create Budget</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription>
                Enter the details of your new expense.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Title</FormLabel>
                      <FormControl>
                        <Input
                          className="col-span-3"
                          placeholder="Housing Expense"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the title of your budget.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assigned_budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Amount</FormLabel>
                      <FormControl>
                        <Input
                          className="col-span-3"
                          placeholder="$100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the amount of your budget.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
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
      </div>
      <Table>
        <TableCaption>A list of your recent budgets.</TableCaption>
        <TableHeader className="bg-white">
          <TableRow>
            <TableHead>Budgets</TableHead>
            <TableHead>Budget Assigned</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead className="text-right">Amount Available</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="border-b border-slate-200">
          {budgetList &&
            budgetList.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>${item.assigned_budget}</TableCell>
                <TableCell>${item.activity}</TableCell>
                <TableCell className="text-right">
                  ${item.amount_available}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </main>
  );
}
