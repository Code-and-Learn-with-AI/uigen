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


# MCPs

![MCPs](./.debug/mcp.png)

One example of popular MCP server is Playwright MCP server

To add to our claude code

```bash
claude mcp add playwright npx @playwright/mcp@latest 
```

This will add the Playwright MCP server to our claude code.

Now you can ask claude code to go to a link in the browser, for example:
```bash
go to https://www.google.com

Or

Open the browser and navigate to localhost:3000
```

This will open the Google search page in the browser.

You can also ask claude code to click on a button, for example:
```bash
click on the search button
```

You might need to give permission each time. To avoid that, edit .claude/settings.json and add the following:
```json
{
    "permissions": {
        "allow": [
            "mcp_playwright"
        ],
        "deny": []
    }
}
```
==> will allow claude code to use the Playwright MCP server tools without asking for permission each time.

/init
```
This will generate a .claude.md file in the root of the project.

## Prompt hints for Claude to think up to ultrathink

Tell him "Think", "Think more", "Think a lot", "think longer" or "UltraThink" to get him to think more deeply.

You can also turn on plan mode (Shift Tab) to get him to think about the best plan of action.

## Planning Vs Thinking

Planning for wide, long tasks that require wide knowledge of your goals, steps and code base
Thinking to tackle particular problems, issues or features


## /login

Whenever you need to login, use the /login command, sessions might need to be renewed periodically.

## Escape

Stops the current task and returns to the command line.

## Escape Escape

Equivalent to /rewind ==> allows you to go back to a previous state of the conversation.


# Custom commands
If your project does not contain a .claude directory, create it

mkdir -p .claude/commands

touch .claude/commands/audit.md  (audit is the name of the command)

Another custom command that uses arguments: see .claude/commands/write_tests.md

==> can be used for example as "/write_tests the use-auth.ts file in the hook  dir"                                                                                             