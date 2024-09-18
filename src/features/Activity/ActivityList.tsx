import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useGetActivities } from "./api/GetActivities";

const ActivityList = () => {
  const { data: activityList } = useGetActivities();

  return (
    <Table>
      <TableCaption>A list of your recent activities.</TableCaption>
      <TableHeader className="bg-white">
        <TableRow>
          <TableHead>Activity Title</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Part of Budget</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="border-b border-slate-200">
        {activityList &&
          activityList.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.activity_title}
              </TableCell>
              <TableCell>${item.activity_amount}</TableCell>
              <TableCell>{item.budget ? item.budget?.title : "-"}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default ActivityList;
