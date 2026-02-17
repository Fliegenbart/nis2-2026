import { runOverdueEscalations } from "../src/lib/escalation-runner";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;

  const result = await runOverdueEscalations({
    dryRun,
    limit: Number.isFinite(limit) ? limit : undefined,
  });

  console.log(JSON.stringify({ dryRun, result }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
