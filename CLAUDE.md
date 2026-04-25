# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation (PL-7) adds auth-gated access, document persistence, and UI polish. Users sign in, chat with the AI to create any of the 11 document types, save documents to their account, and reload them later to continue where they left off.

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

### Completed (PL-6)
- Support for all 11 document types from catalog.json
- `POST /api/chat` unified endpoint — AI detects document type, then routes to per-type prompt
- `GenericDocPreview` and `GenericDocPdf` components handle all non-NDA document types
- Per-document `keyTerms` dict for document-specific fields (e.g. uptime target for SLA)
- `GET /api/documents/{doc_type}/template` serves raw markdown templates

### Completed (PL-7)
- Auth-gated app — users must sign in; `AuthScreen` provides sign-in / sign-up UI
- `AuthContext` manages user state; resets all document state on user change (prevents data leak)
- `documents` table in SQLite stores document type, fields (JSON), and chat history (JSON) per user
- `POST /api/documents` — save document (authenticated)
- `GET /api/documents` — list user's saved documents
- `GET /api/documents/{id}` — load a saved document (fields + chat history)
- `DELETE /api/documents/{id}` — delete a saved document
- My Documents modal — view, load, and delete saved documents
- Save button in header with "Saving…" / "Saved!" feedback
- New Document button resets all state and remounts chat
- User menu in header shows email and sign-out
- Disclaimer banner: "Documents are drafts… do not constitute legal advice"
- Document state (fields + chat) fully restored when loading a saved document

### Current API Endpoints
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in and receive JWT cookie
- `POST /api/auth/signout` - Clear auth cookie
- `GET /api/auth/me` - Get current user info
- `POST /api/chat` - AI chat for any document type (detects type, extracts fields)
- `POST /api/chat/nda` - Legacy AI chat for Mutual NDA (unauthenticated)
- `POST /api/documents` - Save a document (authenticated)
- `GET /api/documents` - List user's saved documents (authenticated)
- `GET /api/documents/{id}` - Get a saved document with fields and messages (authenticated)
- `DELETE /api/documents/{id}` - Delete a saved document (authenticated)
- `GET /api/documents/{doc_type}/template` - Get raw markdown template for a document type
- `GET /api/health` - Health check