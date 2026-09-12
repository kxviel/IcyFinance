import { createFileRoute } from "@tanstack/react-router";
import Targets from "@/modules/Targets/Targets";

export const Route = createFileRoute("/targets")({ component: Targets });
