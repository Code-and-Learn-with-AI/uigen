# UIGen

AI-powered React component generator with live preview.

## Prerequisites

- Node.js 18+
- npm

## Setup

1. **Optional** Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your-api-key-here
```

The project will run without an API key. Rather than using a LLM to generate components, static code will be returned instead.

2. Install dependencies and initialize database

```bash
npm run setup
```

This command will:

- Install all dependencies
- Generate Prisma client
- Run database migrations

## Running the Application

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Sign up or continue as anonymous user
2. Describe the React component you want to create in the chat
3. View generated components in real-time preview
4. Switch to Code view to see and edit the generated files
5. Continue iterating with the AI to refine your components

## Features

- AI-powered component generation using Claude
- Live preview with hot reload
- Virtual file system (no files written to disk)
- Syntax highlighting and code editor
- Component persistence for registered users
- Export generated code

## Tech Stack

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma with SQLite
- Anthropic Claude AI
- Vercel AI SDK


# Useful claude commands
## Setup CLAUDE.md

```bash
claude 

/init
```
This will generate a .claude.md file in the root of the project.

## Prompt hints for Claude to think up to ultrathink

Tell him "Think", "Think more", "Think a lot", "think longer" or "UltraThink" to get him to think more deeply.

You can also turn on plan mode (Shift Tab) to get him to think about the best plan of action.

## Planning Vs Thinking

Planning for wide, long tasks that require wide knowledge of your goals, steps and code base
Thinking to tackle particular problems, issues or features