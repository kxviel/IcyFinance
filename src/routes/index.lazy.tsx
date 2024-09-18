import { createLazyFileRoute } from "@tanstack/react-router";
import Budget from "../components/Budget";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return <Budget />;
}
