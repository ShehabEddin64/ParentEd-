import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
const failures = [];
const fail = (file, reason) => failures.push(`${file}: ${reason}`);
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
for (const name of [
  "@supabase/supabase-js",
  "supabase",
  "wrangler",
  "@anthropic-ai/sdk",
  "openai",
  "resend",
  "stripe",
]) {
  if (pkg.dependencies?.[name] || pkg.devDependencies?.[name])
    fail("package.json", "cloud/billing dependency " + name);
}
for (const name of Object.keys(pkg.scripts))
  if (/deploy|cloudflare|supabase|seed:users/.test(name))
    fail("package.json", "cloud action " + name);
for (const file of [
  "wrangler.jsonc",
  "wrangler.toml",
  "src/data/supabase.ts",
  "supabase/config.toml",
])
  if (existsSync(file)) fail(file, "retired integration restored");
const patterns = [
  /sk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}/,
  /sb_secret_[A-Za-z0-9_-]{16,}/,
  /sb_publishable_[A-Za-z0-9_-]{16,}/,
  /gh[pousr]_[A-Za-z0-9_]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /AKIA[A-Z0-9]{16}/,
  /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];
const files = new Set(
  execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { encoding: "utf8" },
  )
    .split("\0")
    .filter(Boolean),
);
function walk(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else files.add(file);
  }
}
walk("dist");
for (const file of files) {
  if (
    !existsSync(file) ||
    !statSync(file).isFile() ||
    !/\.(?:tsx?|m?js|jsonc?|md|txt|toml|sql|html|css)$|(?:^|\/)\.env[^/]*$|_headers$/.test(
      file,
    )
  )
    continue;
  const text = readFileSync(file, "utf8");
  if (patterns.some((p) => p.test(text)))
    fail(file, "credential-like value detected (redacted)");
  if (
    file.startsWith("src/") &&
    /\bfetch\s*\(|XMLHttpRequest|new\s+WebSocket|\.tileLayer\s*\(|import\.meta\.env|functions\.invoke/.test(
      text,
    )
  )
    fail(file, "runtime network/environment activation path");
  if (
    file.startsWith("dist/") &&
    /(?:supabase\.co|api\.anthropic\.com|api\.resend\.com|api\.open-meteo\.com|tile\.openstreetmap\.org)/.test(
      text,
    )
  )
    fail(file, "retired service endpoint in build");
}
for (const file of readdirSync(".").filter(
  (f) => /^\.env(?:\.|$)/.test(f) && f !== ".env.example",
)) {
  if (
    readFileSync(file, "utf8")
      .split("\n")
      .some((line) => /^\s*[A-Z_][A-Z0-9_]*\s*=\s*\S/.test(line))
  )
    fail(file, "populated local environment file");
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "Safety checks passed: no detected credentials, cloud dependencies or runtime service activation paths.",
  );
