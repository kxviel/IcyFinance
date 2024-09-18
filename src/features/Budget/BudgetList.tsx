import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useGetBudgets } from "./api/GetBudgets";

const BudgetList = () => {
  const { data: budgetList } = useGetBudgets();

  return (
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
  );
};

export default BudgetList;
