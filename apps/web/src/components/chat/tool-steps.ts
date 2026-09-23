import {
  FileText,
  HandCoins,
  PieChart,
  Receipt,
  Tags,
  UserRound,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";

// Friendly labels for the ai service's chat tools (services/ai/app/tools).
// `active` shows while the tool runs, `done` once it has returned.
const TOOL_STEPS: Record<string, { icon: LucideIcon; active: string; done: string }> = {
  get_my_balances: { icon: Wallet, active: "Checking your balances", done: "Checked your balances" },
  get_spending_summary: { icon: PieChart, active: "Summarizing your spending", done: "Summarized your spending" },
  list_my_categories: { icon: Tags, active: "Looking up categories", done: "Looked up categories" },
  list_my_expenses: { icon: Receipt, active: "Fetching your expenses", done: "Fetched your expenses" },
  get_expense_details: { icon: FileText, active: "Opening expense details", done: "Opened expense details" },
  list_my_groups: { icon: Users, active: "Fetching your groups", done: "Fetched your groups" },
  get_group_members: { icon: UserRound, active: "Looking up group members", done: "Looked up group members" },
  list_my_settlements: { icon: HandCoins, active: "Fetching your settlements", done: "Fetched your settlements" },
};

export function toolStep(name: string) {
  const known = TOOL_STEPS[name];
  if (known) return known;
  // "some_new_tool" -> "Some new tool"
  const label = name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " ");
  return { icon: Wrench, active: label, done: label };
}

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

// Tool args are mostly ids and limits; show the ones a person can read.
export function readableArgs(input: unknown): string[] {
  if (!input || typeof input !== "object") return [];
  return Object.entries(input as Record<string, unknown>)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .filter(([, v]) => !new RegExp(`^${UUID}$`, "i").test(String(v)))
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${String(v)}`);
}

// Tool outputs are plain text for the model: either "a | b | c" tables with
// a header row, or one item per line with inline "(x_id: <uuid>, ...)".
// Turn them into short human-readable lines with the ids stripped out.
export function outputLines(output: unknown): string[] {
  if (typeof output !== "string") return output == null ? [] : [JSON.stringify(output)];
  const lines = output.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  if (lines[0].includes(" | ")) {
    const header = lines[0].split(" | ");
    const keep = header.map((h, i) => (/(^|_)id$/.test(h.trim()) ? -1 : i)).filter((i) => i >= 0);
    return lines
      .slice(1)
      .map((row) => {
        if (!row.includes(" | ")) return row; // footer like "(showing 50 of 80)"
        const cells = row.split(" | ");
        return keep.map((i) => cells[i]?.trim()).filter((c) => c && c !== "-").join(" · ");
      })
      .filter(Boolean);
  }

  return lines.map((line) =>
    line
      .replace(new RegExp(`\\b\\w*id: ${UUID},?\\s*`, "gi"), "")
      .replace(new RegExp(UUID, "gi"), "")
      .replace(/\(\s*\)/g, "")
      .replace(/\(\s*,?\s*/g, "(")
      .trim()
  );
}
