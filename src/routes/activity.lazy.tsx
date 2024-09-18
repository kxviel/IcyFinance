import { createLazyFileRoute } from "@tanstack/react-router";
import Activity from "../components/Activity";

export const Route = createLazyFileRoute("/activity")({
  component: () => <Index />,
});

function Index() {
  return <Activity />;
}
