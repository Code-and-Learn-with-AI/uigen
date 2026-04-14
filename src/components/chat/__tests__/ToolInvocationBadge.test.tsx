import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getToolLabel, ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(cleanup);

describe("getToolLabel", () => {
  describe("str_replace_editor", () => {
    it("returns 'Creating <filename>' for create command", () => {
      expect(
        getToolLabel("str_replace_editor", {
          command: "create",
          path: "/src/components/Card.tsx",
        })
      ).toBe("Creating Card.tsx");
    });

    it("returns 'Updating <filename>' for str_replace command", () => {
      expect(
        getToolLabel("str_replace_editor", {
          command: "str_replace",
          path: "/src/components/Button.tsx",
        })
      ).toBe("Updating Button.tsx");
    });

    it("returns 'Inserting into <filename>' for insert command", () => {
      expect(
        getToolLabel("str_replace_editor", {
          command: "insert",
          path: "/src/utils/helpers.ts",
        })
      ).toBe("Inserting into helpers.ts");
    });

    it("returns 'Reading <filename>' for view command", () => {
      expect(
        getToolLabel("str_replace_editor", {
          command: "view",
          path: "/src/app/page.tsx",
        })
      ).toBe("Reading page.tsx");
    });

    it("returns 'Editing <filename>' for unknown command", () => {
      expect(
        getToolLabel("str_replace_editor", {
          command: "undo_edit",
          path: "/src/index.ts",
        })
      ).toBe("Editing index.ts");
    });

    it("handles nested path and extracts only filename", () => {
      expect(
        getToolLabel("str_replace_editor", {
          command: "create",
          path: "/very/deeply/nested/path/Component.tsx",
        })
      ).toBe("Creating Component.tsx");
    });
  });

  describe("file_manager", () => {
    it("returns 'Renaming <name> → <new name>' for rename command", () => {
      expect(
        getToolLabel("file_manager", {
          command: "rename",
          path: "/src/OldName.tsx",
          new_path: "/src/NewName.tsx",
        })
      ).toBe("Renaming OldName.tsx → NewName.tsx");
    });

    it("returns 'Deleting <filename>' for delete command", () => {
      expect(
        getToolLabel("file_manager", {
          command: "delete",
          path: "/src/Unused.tsx",
        })
      ).toBe("Deleting Unused.tsx");
    });

    it("returns 'Managing files' for unknown command", () => {
      expect(
        getToolLabel("file_manager", { command: "unknown", path: "/src/file.ts" })
      ).toBe("Managing files");
    });
  });

  it("returns raw tool name for unknown tools", () => {
    expect(getToolLabel("some_other_tool", {})).toBe("some_other_tool");
  });
});

describe("ToolInvocationBadge", () => {
  it("shows spinner and label while pending", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        state="call"
        args={{ command: "create", path: "/src/Card.tsx" }}
      />
    );
    expect(screen.getByText("Creating Card.tsx")).toBeDefined();
    expect(document.querySelector(".animate-spin")).toBeDefined();
    expect(document.querySelector(".bg-emerald-500")).toBeNull();
  });

  it("shows green dot and label when done", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        state="result"
        args={{ command: "str_replace", path: "/src/Button.tsx" }}
      />
    );
    expect(screen.getByText("Updating Button.tsx")).toBeDefined();
    expect(document.querySelector(".bg-emerald-500")).toBeDefined();
    expect(document.querySelector(".animate-spin")).toBeNull();
  });

  it("shows correct label for file_manager delete", () => {
    render(
      <ToolInvocationBadge
        toolName="file_manager"
        state="result"
        args={{ command: "delete", path: "/src/OldComponent.tsx" }}
      />
    );
    expect(screen.getByText("Deleting OldComponent.tsx")).toBeDefined();
  });
});
