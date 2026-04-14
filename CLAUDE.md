# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**UIGen** is an AI-powered React component generator that uses Claude to generate React components in real-time with live preview. The application provides a chat interface where users describe components, which Claude generates using tool-use to create and modify files in a virtual file system that's previewed live.

## Development Commands

### Setup & Installation
```bash
npm run setup          # Install dependencies, generate Prisma client, run migrations
npm install           # Install dependencies only
npx prisma generate   # Generate Prisma client
npx prisma migrate dev # Run pending migrations
npm run db:reset      # Reset database (deletes all data)
```

### Running the Application
```bash
npm run dev           # Start dev server with Turbopack on http://localhost:3000
npm run dev:daemon    # Start dev server in background, logs to logs.txt
npm run build         # Build for production
npm start             # Run production server
```

### Quality & Testing
```bash
npm run lint          # Run ESLint
npm test              # Run Vitest unit tests
npm test -- --watch   # Run tests in watch mode
npm test -- --ui      # Run tests with UI dashboard
```

### Environment Setup
Create a `.env.local` file with:
```
ANTHROPIC_API_KEY=your-api-key-here
```
The app works without this key (returns static code instead of AI-generated).

## Architecture

### High-Level Structure

The application follows a standard Next.js 15 App Router pattern with a clear separation of concerns:

```
Frontend (React components in Browser)
    ↓
Next.js Pages & API Routes
    ↓
Server Actions & Database (Prisma)
    ↓
Anthropic Claude API
```

### Core Systems

**1. Virtual File System (In-Memory)**
- Located in `src/lib/file-system.ts`
- Custom `VirtualFileSystem` class manages component files without writing to disk
- Serializes/deserializes to JSON for storage in database
- Used throughout the app via React Context (`FileSystemContext`)
- Files have a tree structure: `FileNode` with `type`, `name`, `path`, `content`, `children`

**2. AI Chat & Code Generation**
- API endpoint: `src/app/api/chat/route.ts`
- Uses Vercel AI SDK `streamText` with Anthropic Claude
- Configured with:
  - System prompt: `src/lib/prompts/generation.tsx`
  - Two AI tools for code manipulation:
    - `str_replace_editor`: Find and replace code (built in `src/lib/tools/str-replace.ts`)
    - `file_manager`: Create/delete files/directories (built in `src/lib/tools/file-manager.ts`)
  - Max tokens: 10,000
  - Max steps: 4 (mock provider) or 40 (with API key)
  - Prompt caching enabled (ephemeral cache control)
- Messages and file state persisted to database on completion

**3. React Components & UI**
- Chat interface: `src/components/chat/` (ChatInterface, MessageList, MessageInput, MarkdownRenderer)
- Code editor: `src/components/editor/` (CodeEditor with Monaco, FileTree)
- Preview: `src/components/preview/PreviewFrame.tsx` (uses Babel to transpile JSX in browser)
- UI components: `src/components/ui/` (Radix-based primitive components)
- Auth: `src/components/auth/` (SignUp, SignIn, AuthDialog)
- Contexts: `src/lib/contexts/` (FileSystemContext, ChatContext)

**4. Database & Persistence**
- SQLite with Prisma ORM (`prisma/schema.prisma`)
- Two main models:
  - `User`: Email, password (bcrypt hashed), projects relation
  - `Project`: Name, userId, messages (JSON), data (serialized file system)
- Authentication: JWT-based via `src/lib/auth.ts`
- Actions: `src/actions/` (server-side functions for user/project operations)

**5. Rendering Pipeline**
- User's JSX code is transformed in the browser using Babel (`src/lib/transform/jsx-transformer.ts`)
- Rendered in isolated iframe (`PreviewFrame`) with Tailwind CSS v4
- Hot reload: Component updates trigger preview refresh via React context

### Key Files & Responsibilities

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing page, handles auth redirect |
| `src/app/[projectId]/page.tsx` | Project workspace page |
| `src/app/api/chat/route.ts` | AI chat streaming endpoint |
| `src/lib/file-system.ts` | Virtual file system implementation |
| `src/lib/auth.ts` | JWT authentication utilities |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/provider.ts` | Language model provider (Claude selection) |
| `src/lib/prompts/generation.tsx` | System prompt for code generation |
| `src/lib/tools/` | Tool definitions for Claude (str_replace, file_manager) |
| `src/lib/contexts/` | React contexts (FileSystem, Chat state) |
| `src/components/chat/` | Chat UI and message handling |
| `src/components/editor/` | Code editor and file tree |
| `src/components/preview/` | Live preview iframe |

## Technology Stack & Dependencies

- **Framework**: Next.js 15 (App Router, SSR, API routes)
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4, class-variance-authority, clsx
- **Component Library**: Radix UI (Dialog, Tabs, Scroll Area, etc.)
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **JSX Transpiler**: Babel standalone (@babel/standalone) - browser-based
- **Database**: SQLite with Prisma v6
- **Authentication**: JWT with jose, bcrypt for password hashing
- **AI**: Anthropic Claude via @ai-sdk/anthropic
- **Build**: Turbopack for dev, Next.js bundler for production
- **Testing**: Vitest + React Testing Library
- **Markdown**: react-markdown with rehype plugins
- **Utilities**: server-only, react-resizable-panels, lucide-react (icons)

## Important Notes

### Prompt Caching
The system message in the chat endpoint uses Anthropic's ephemeral cache control to reduce token usage on repeated calls. See `src/app/api/chat/route.ts:22-24`.

### Mock Provider Fallback
When `ANTHROPIC_API_KEY` is not set, a mock provider returns static code. This is intentional for development without an API key. Check `src/lib/provider.ts` for implementation.

### Browser-Side JSX Transpilation
Unlike a typical backend-compiled approach, JSX is compiled in the browser using Babel. This means:
- No server-side code generation overhead
- Component code can be iterated instantly
- Limited to browser-safe libraries (no Node.js APIs)
- See `src/lib/transform/jsx-transformer.ts` for transpilation logic

### Virtual File System Serialization
Files are kept in memory as `VirtualFileSystem` objects, serialized to JSON for database storage, and deserialized on project load. The serialization strips the Map structure and rebuilds it on deserialization.

### Node Compatibility Layer
The project uses `node-compat.cjs` to polyfill Node.js APIs for browser compatibility. This is required for tools like Babel standalone.

## Testing

- Unit tests use Vitest with jsdom environment
- React components tested with React Testing Library
- Test files colocated: `src/components/**/__tests__/`, `src/lib/**/__tests__/`
- Run tests with `npm test` or `npm test -- --watch`

## Code Style & Standards

- **Comments**: Use comments sparingly. Only comment complex code that isn't self-explanatory. Self-documenting code with clear variable names and function purposes is preferred.
- **Type Safety**: Leverage TypeScript's type system—avoid `any` types.
- **Formatting**: ESLint configurations are in place; run `npm run lint` to check compliance.

## Database Reference

The database schema is defined in `prisma/schema.prisma`. Reference this file anytime you need to understand the structure of data stored in the database:
- **User model**: Stores user credentials and relationships
- **Project model**: Stores project metadata, chat messages (JSON), and file system state (JSON)
- Run `npx prisma studio` to visually browse the database
- Generate Prisma client after schema changes: `npx prisma generate`
- Create migrations: `npx prisma migrate dev --name <migration_name>`

## Common Development Tasks

**Add a new UI component:**
- Create in `src/components/ui/component-name.tsx`
- Use Radix UI primitives as building blocks
- Export from `src/components/ui/index.ts` if needed

**Modify code generation behavior:**
- Edit system prompt in `src/lib/prompts/generation.tsx`
- Add tools in `src/lib/tools/` and register in `src/app/api/chat/route.ts`

**Change database schema:**
- Edit `prisma/schema.prisma`
- Run `npx prisma migrate dev --name your_migration_name`
- Type-safe queries available via `prisma` import

**Add authentication features:**
- Auth logic in `src/lib/auth.ts`
- User/project actions in `src/actions/`
- Use `useAuth()` hook in components (defined in `src/hooks/use-auth.ts`)

## Notes for Future Work

- The metadata in `src/app/layout.tsx` still shows "Create Next App" and should be updated
- Consider optimizing the virtual file system serialization for large projects
- Error handling in the chat endpoint could be more granular (currently logs to console)
