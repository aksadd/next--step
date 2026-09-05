// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { Legal } from "./privacy";
export const Route = createFileRoute("/terms")({ component: () => <Legal title="Terms" text="The Next Step website is provided for information, listening and conversation. Content remains the property of its respective owners. Do not reproduce, redistribute, or misuse podcast content without permission." /> });
