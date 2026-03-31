import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "partial-call" | "result";
  result?: unknown;
}

function basename(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? path;
}

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "partial-call" | "result"
): string {
  const done = state === "result";
  const path = typeof args.path === "string" ? basename(args.path) : "";

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return done ? `Created ${path}` : `Creating ${path}`;
      case "str_replace":
      case "insert":
        return done ? `Edited ${path}` : `Editing ${path}`;
      case "view":
        return done ? `Read ${path}` : `Reading ${path}`;
      case "undo_edit":
        return done ? "Undid edit" : "Undoing edit";
      default:
        return done ? `Edited ${path || "file"}` : `Editing ${path || "file"}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename":
        return done ? `Renamed ${path}` : `Renaming ${path}`;
      case "delete":
        return done ? `Deleted ${path}` : `Deleting ${path}`;
      default:
        return done ? "Managed file" : "Managing file";
    }
  }

  return toolName.replace(/_/g, " ");
}

export function ToolInvocationBadge({
  toolName,
  args,
  state,
  result,
}: ToolInvocationBadgeProps) {
  const isDone = state === "result" && result != null;
  const label = getToolLabel(toolName, args, state);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
