# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # Initial setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run Vitest tests
npm run db:reset     # Reset the SQLite database
```

To run a single test file:
```bash
npx vitest run src/path/to/file.test.ts
```

## Environment

Copy `.env` and add your key:
```
ANTHROPIC_API_KEY=...
```
Without the key, the app falls back to a `MockLanguageModel` — the UI still works but no real AI generation occurs.

## Architecture

**UIGen** is an AI-powered React component generator. Users describe components in a chat UI; Claude generates code using tool calls; a live iframe preview renders the result.

### Request flow

1. User sends a message → `POST /api/chat` (`src/app/api/chat/route.ts`)
2. The API builds a `VirtualFileSystem` from the request, then calls Claude via Vercel AI SDK (streaming)
3. Claude uses two tools to modify the virtual FS:
   - `str_replace_editor` (`src/lib/tools/str-replace.ts`) — search/replace within a file
   - `file_manager` (`src/lib/tools/file-manager.ts`) — rename / delete files
4. The streaming response is consumed by `useChat` in `src/lib/contexts/chat-context.tsx`
5. On completion the project is persisted to SQLite via Prisma
6. The `PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) re-renders the iframe:
   - `src/lib/transform/jsx-transformer.ts` converts the VFS into an import-map + Babel-compiled bundle
   - The iframe executes the bundle with React loaded from CDN

### Key abstractions

| Abstraction | Location | Purpose |
|---|---|---|
| `VirtualFileSystem` | `src/lib/file-system.ts` | In-memory tree of files; serialises to JSON for DB storage |
| `getLanguageModel()` | `src/lib/provider.ts` | Returns Claude or `MockLanguageModel` depending on env |
| `useFileSystem` | `src/lib/contexts/file-system-context.tsx` | React context wrapping the VFS |
| `useChat` | `src/lib/contexts/chat-context.tsx` | Drives the chat stream and syncs VFS changes |
| Auth (JWT) | `src/lib/auth.ts` | `createSession` / `getSession` / `deleteSession` via `jose` |
| Server actions | `src/actions/` | Auth (signUp/signIn/signOut) + project CRUD |

### Data model (SQLite via Prisma)

```
User  { id, email, password, ...timestamps }
  └── Project  { id, name, userId, messages: JSON, data: JSON, ...timestamps }
```

`messages` stores the full chat history; `data` stores the serialised `VirtualFileSystem`.

### UI layout

Three-panel layout in `src/app/main-content.tsx` (react-resizable-panels):
- **Left** — `ChatInterface` (message list + input)
- **Center** — `PreviewFrame` (live iframe)
- **Right** — `CodeEditor` (Monaco) + `FileTree`

Auth is gated by `src/middleware.ts` and surfaced through `AuthDialog`.

### AI model

The system prompt lives in `src/lib/prompts/generation.tsx`. The model used is `claude-haiku-4-5` (configured in `src/lib/provider.ts`). The chat API route sets `maxDuration: 120`.
