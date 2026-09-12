import { createFileRoute } from "@tanstack/react-router";
import Overview from "@/modules/Overview/Overview";

export const Route = createFileRoute("/overview")({ component: Overview });
