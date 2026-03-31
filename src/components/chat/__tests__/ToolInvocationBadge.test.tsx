import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  ToolInvocationBadge,
  getToolLabel,
} from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// --- getToolLabel unit tests ---

test("getToolLabel: str_replace_editor create (pending)", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" }, "call")).toBe("Creating App.jsx");
});

test("getToolLabel: str_replace_editor create (done)", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" }, "result")).toBe("Created App.jsx");
});

test("getToolLabel: str_replace_editor str_replace (pending)", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/Card.jsx" }, "call")).toBe("Editing Card.jsx");
});

test("getToolLabel: str_replace_editor str_replace (done)", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/Card.jsx" }, "result")).toBe("Edited Card.jsx");
});

test("getToolLabel: str_replace_editor insert (pending)", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/index.tsx" }, "call")).toBe("Editing index.tsx");
});

test("getToolLabel: str_replace_editor insert (done)", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/index.tsx" }, "result")).toBe("Edited index.tsx");
});

test("getToolLabel: str_replace_editor view (pending)", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" }, "call")).toBe("Reading App.jsx");
});

test("getToolLabel: str_replace_editor view (done)", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" }, "result")).toBe("Read App.jsx");
});

test("getToolLabel: str_replace_editor undo_edit (pending)", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }, "call")).toBe("Undoing edit");
});

test("getToolLabel: str_replace_editor undo_edit (done)", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }, "result")).toBe("Undid edit");
});

test("getToolLabel: str_replace_editor unknown command fallback", () => {
  expect(getToolLabel("str_replace_editor", { command: "unknown", path: "/App.jsx" }, "call")).toBe("Editing App.jsx");
  expect(getToolLabel("str_replace_editor", { command: "unknown", path: "/App.jsx" }, "result")).toBe("Edited App.jsx");
});

test("getToolLabel: file_manager rename (pending)", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.jsx" }, "call")).toBe("Renaming old.jsx");
});

test("getToolLabel: file_manager rename (done)", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.jsx" }, "result")).toBe("Renamed old.jsx");
});

test("getToolLabel: file_manager delete (pending)", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/Card.jsx" }, "call")).toBe("Deleting Card.jsx");
});

test("getToolLabel: file_manager delete (done)", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/Card.jsx" }, "result")).toBe("Deleted Card.jsx");
});

test("getToolLabel: file_manager unknown command fallback", () => {
  expect(getToolLabel("file_manager", { command: "unknown" }, "call")).toBe("Managing file");
  expect(getToolLabel("file_manager", { command: "unknown" }, "result")).toBe("Managed file");
});

test("getToolLabel: unknown tool name falls back to humanized name", () => {
  expect(getToolLabel("some_other_tool", {}, "call")).toBe("some other tool");
});

test("getToolLabel: nested path extracts basename", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/src/components/Button.tsx" }, "call")).toBe("Creating Button.tsx");
});

// --- ToolInvocationBadge rendering tests ---

test("ToolInvocationBadge shows label and green dot when done", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("Created App.jsx")).toBeDefined();
  const dot = document.querySelector(".bg-emerald-500");
  expect(dot).not.toBeNull();
});

test("ToolInvocationBadge shows label and spinner when pending", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );

  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).not.toBeNull();
  const dot = document.querySelector(".bg-emerald-500");
  expect(dot).toBeNull();
});

test("ToolInvocationBadge shows spinner when result is undefined", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/Card.jsx" }}
      state="result"
      result={undefined}
    />
  );

  expect(screen.getByText("Edited Card.jsx")).toBeDefined();
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).not.toBeNull();
});

test("ToolInvocationBadge file_manager delete shows correct label", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "delete", path: "/Card.jsx" }}
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText("Deleted Card.jsx")).toBeDefined();
});

test("ToolInvocationBadge partial-call state shows spinner", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="partial-call"
    />
  );

  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).not.toBeNull();
});
