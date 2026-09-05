import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function parseEnvFile(filePath: string): Record<string, string> {
  const value: Record<string, string> = {};

  if (!existsSync(filePath)) return value;

  const contents = readFileSync(filePath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const separatorIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, separatorIndex).trim();
    let rawValue = trimmed.slice(separatorIndex + 1).trim();

    if ((rawValue.startsWith('"') && rawValue.endsWith('"')) || (rawValue.startsWith("'") && rawValue.endsWith("'"))) {
      rawValue = rawValue.slice(1, -1);
    }

    value[key] = rawValue;
  }

  return value;
}

export function loadRuntimeEnv(): void {
  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env.development"),
    path.resolve(process.cwd(), ".env.production"),
  ];

  const envMap: Record<string, string> = {};
  for (const candidate of candidates) {
    Object.assign(envMap, parseEnvFile(candidate));
  }

  for (const [key, value] of Object.entries(envMap)) {
    if (value && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadRuntimeEnv();
