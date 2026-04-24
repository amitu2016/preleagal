# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation (PL-5) adds an AI chat interface for Mutual NDA creation. The user chats with the AI, which extracts document fields via structured outputs and updates the live preview in real time.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use the `AsyncOpenAI` client (from the `openai` package) pointed at OpenRouter:

```python
from openai import AsyncOpenAI

_ai = AsyncOpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
    default_headers={"HTTP-Referer": "https://prelegal.app", "X-Title": "Prelegal"},
)
```

Use model `openai/gpt-oss-120b` and `response_format={"type": "json_object"}` for structured outputs so you can reliably extract and populate fields in the legal document. OpenRouter auto-routes to the best available provider (Cerebras, Bedrock, etc.).

There is an `OPENROUTER_API_KEY` in the `.env` file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database uses SQLite at `/tmp/prelegal.db` — ephemeral in the container, so it is fresh on each start. The users table supports sign up and sign in.  
The frontend is statically exported (`next build` → `out/`) and served by FastAPI via `StaticFiles` at `/`.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

### Completed (PL-4)
- Docker multi-stage build (Node frontend + Python backend)
- FastAPI backend with SQLite (fresh DB each container start)
- Next.js static export served by FastAPI at localhost:8000
- Auth routes: POST /api/auth/signup, POST /api/auth/signin, POST /api/auth/signout, GET /api/auth/me
- Start/stop scripts for Mac, Linux, Windows
- Mutual NDA form with live preview and PDF download

### Completed (PL-5)
- AI chat interface replaces manual NDA form
- AsyncOpenAI SDK → OpenRouter → `openai/gpt-oss-120b` with structured JSON output
- `POST /api/chat/nda` — stateless; frontend sends full message history each request
- AI extracts NDA fields incrementally; live preview updates via deep-merge of partial responses
- `NDAChat` component with loading states, error recovery, auto-greeting on mount
- `ChatMessage.role` restricted to `Literal["user", "assistant"]` (prompt injection guard)

### Planned (PL-6)
- Support for all 11 document types from catalog.json
- AI detects document type from user requests and routes accordingly
- Dedicated preview/PDF components per document type

### Planned (PL-7)
- Document persistence — users can save documents to their account
- My Documents modal to view, load, and delete saved documents
- User menu with sign out; New Document button

### Current API Endpoints
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in and receive JWT cookie
- `POST /api/auth/signout` - Clear auth cookie
- `GET /api/auth/me` - Get current user info
- `POST /api/chat/nda` - AI chat for Mutual NDA field extraction (unauthenticated)
- `GET /api/health` - Health check