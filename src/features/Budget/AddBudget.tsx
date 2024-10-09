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
import { Input } from "../../components/ui/input";
import { useAddBudget } from "./api/useAddBudget";
import { useState } from "react";

const formSchema = z.object({
  budget_name: z.string().min(2, {
    message: "title must be at least 2 characters.",
  }),
  budget_amount: z
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

const AddBudget = () => {
  const addBudget = useAddBudget();

  const [open, setOpen] = useState(false);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budget_name: "",
      budget_amount: 0,
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    addBudget.mutate(
      { body: values },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
        onError: (err) => {
          console.log(err);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              name="budget_name"
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
              name="budget_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
                  <FormControl>
                    <Input
                      className="col-span-3"
                      placeholder="$100"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
  );
};

export default AddBudget;
