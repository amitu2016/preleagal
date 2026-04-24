# Preleagal Code Review - April 24, 2026

## Executive Summary
The `preleagal` project is a well-structured application for generating legal documents using AI. It demonstrates a high level of technical maturity in its architecture, type safety, and testing patterns. The transition from a single-document (NDA) focus to a generalized document generation platform is evident and well-planned.

---

## 1. Architecture & Design

### High-Level Structure
- **Separation of Concerns**: Excellent separation between the Next.js frontend and FastAPI backend. The frontend handles UI, real-time state management, and PDF rendering, while the backend manages AI orchestration, authentication, and data persistence.
- **Generalization Strategy**: The introduction of `DocumentApp`, `GenericDocPdf`, and `GenericDocPreview` shows a proactive approach to scaling the platform beyond NDAs. This is a strong architectural choice that avoids code duplication as new document types are added.

### AI Integration
- **Prompt Engineering**: System prompts in `backend/main.py` are detailed and effectively use JSON-mode to ensure structured data is returned from the AI.
- **Decoupled Logic**: The backend defines document-specific prompts and fields, keeping the frontend relatively agnostic of the specific legal logic for non-NDA documents.

---

## 2. Frontend Review (Next.js 14)

### Strengths
- **Type Safety**: Pervasive use of TypeScript interfaces (e.g., `NDAFormData`, `GenericDocFields`) ensures data consistency across the app.
- **Performance**: Use of `useDebounced` for PDF regeneration is a critical optimization that prevents UI lag during rapid typing.
- **Modern Patterns**: Correct use of Next.js 14 features like the App Router and dynamic imports (with `ssr: false`) for client-side libraries like `@react-pdf/renderer`.
- **Testing**: The test suite in `src/__tests__` is high quality. It effectively uses Jest mocks to isolate logic and fake timers to test asynchronous behavior (debouncing).

### Observations & Recommendations
- **Template Integration**: There is a current mismatch between the Markdown files in `templates/` and the hardcoded JSX in `NDADocument.tsx`. 
    - *Recommendation*: Implement a Markdown-to-PDF parser or a system that dynamically injects terms into the Markdown templates before rendering.
- **State Management**: While `mergeDeep` works well for the current state depth, as document models become more complex, consider a dedicated state management library or use standard Reducer patterns to handle complex updates more predictably.

---

## 3. Backend Review (FastAPI)

### Strengths
- **Robust Validation**: Extensive use of Pydantic models for both request and response validation ensures that the AI's output is sanitized before being sent to the frontend.
- **Async Implementation**: The use of `aiosqlite` and `AsyncOpenAI` allows the backend to handle multiple concurrent requests efficiently.
- **Security**: Standard auth implementation using JWT in HttpOnly cookies and Bcrypt for password hashing.

### Observations & Recommendations
- **Persistence**: `DB_PATH` defaults to `/tmp/prelegal.db`.
    - *Critical Recommendation*: Update the production configuration to use a persistent volume for the SQLite database to prevent data loss on container restarts.
- **Environment Configuration**: The backend relies on `OPENROUTER_API_KEY`.
    - *Recommendation*: Ensure that a comprehensive `.env.example` is provided and that there are fallbacks or clear error messages if the AI service is unavailable.
- **Python Version**: `pyproject.toml` specifies `requires-python = ">=3.14"`. 
    - *Observation*: Since Python 3.13 is current, this might be a typo or a very forward-looking requirement. Verify compatibility with standard 3.12/3.13 environments.

---

## 4. Documentation & Standards

- **Project Documentation**: `GEMINI.md` files provide excellent context for both human developers and AI assistants.
- **Consistency**: Coding styles and naming conventions are consistent across both Python and TypeScript codebases.

---

## Conclusion
`preleagal` is in a strong position for growth. The core infrastructure is solid, and the path to a multi-template system is clearly defined. Addressing the template parsing gap and ensuring database persistence are the most significant next steps for moving beyond the prototype stage.
