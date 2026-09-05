import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import "./src/lib/runtime-env";

const supabaseProjectId =
  process.env.VITE_SUPABASE_PROJECT_ID ?? process.env.SUPABASE_PROJECT_ID;
const supabaseUrl =
  process.env.VITE_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  (supabaseProjectId ? `https://${supabaseProjectId}.supabase.co` : undefined);
const supabasePublishableKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;

export default defineConfig({
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabasePublishableKey),
  },
  plugins: [
    ...tanstackStart({ server: { entry: "server" } }),
    nitro(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
