import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const projectId = process.env.SUPABASE_PROJECT_ID;
if (!projectId) {
  console.error("SUPABASE_PROJECT_ID est requis pour générer les types Supabase.");
  process.exit(1);
}

mkdirSync("src/lib/supabase", { recursive: true });
const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["--yes", "supabase@latest", "gen", "types", "typescript", "--project-id", projectId], {
  encoding: "utf8",
  env: { ...process.env },
  maxBuffer: 10 * 1024 * 1024,
});
if (result.status !== 0) {
  process.stderr.write(result.stderr || "La génération Supabase a échoué.\n");
  process.exit(result.status || 1);
}
writeFileSync("src/lib/supabase/database.types.ts", result.stdout);
console.log("Types Supabase générés dans src/lib/supabase/database.types.ts");
