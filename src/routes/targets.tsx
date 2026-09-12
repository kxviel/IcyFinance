import { createFileRoute } from "@tanstack/react-router";
import Targets from "@/pages/Targets";

export const Route = createFileRoute("/targets")({ component: Targets });
