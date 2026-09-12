import { createFileRoute } from "@tanstack/react-router";
import Settings from "@/modules/Settings/Settings";

export const Route = createFileRoute("/settings")({ component: Settings });
