import { createFileRoute } from "@tanstack/react-router";
import Reports from "@/modules/Reports/Reports";

export const Route = createFileRoute("/reports")({ component: Reports });
