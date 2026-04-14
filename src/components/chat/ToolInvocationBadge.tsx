"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  state: string;
  args: Record<string, unknown>;
}

function getFileName(path: unknown): string {
  if (typeof path !== "string" || !path) return "";
  return path.split("/").filter(Boolean).pop() ?? path;
}

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>
): string {
  const fileName = getFileName(args.path);

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return `Creating ${fileName}`;
      case "str_replace":
        return `Updating ${fileName}`;
      case "insert":
        return `Inserting into ${fileName}`;
      case "view":
        return `Reading ${fileName}`;
      default:
        return fileName ? `Editing ${fileName}` : "Editing file";
    }
  }

  if (toolName === "file_manager") {
    const newFileName = getFileName(args.new_path);
    switch (args.command) {
      case "rename":
        return `Renaming ${fileName} → ${newFileName}`;
      case "delete":
        return `Deleting ${fileName}`;
      default:
        return "Managing files";
    }
  }

  return toolName;
}

export function ToolInvocationBadge({
  toolName,
  state,
  args,
}: ToolInvocationBadgeProps) {
  const isDone = state === "result";
  const label = getToolLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
