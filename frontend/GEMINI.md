# GEMINI.md - Frontend

## Project Overview
This is the frontend for `preleagal`, a platform for drafting common legal agreements. It is built using **Next.js 14 (App Router)** and focuses on providing an interactive, live-updating experience for customizing legal documents.

The primary application currently implemented is the **Mutual NDA Creator**, which allows users to fill in business terms and generates a formatted PDF using `@react-pdf/renderer`.

### Tech Stack
- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **PDF Generation:** `@react-pdf/renderer`
- **Testing:** Jest, React Testing Library
- **State Management:** React `useState` with custom debouncing for PDF regeneration.

### Architecture
- `src/components/`: Contains the main application components (`NDAApp`, `NDAForm`, `NDAPreview`, `NDADocument`).
- `src/hooks/`: Custom hooks like `useDebounced` to optimize performance.
- `src/lib/`: Helper functions for formatting dates, generating filenames, and document logic.
- `src/types/`: TypeScript interfaces and default states.
- `src/__tests__/`: Comprehensive test suite for components, hooks, and helpers.
- `src/__mocks__/`: Mocks for libraries like `@react-pdf/renderer` to facilitate testing.

## Building and Running
The following commands are available from the `frontend` directory:

- `npm run dev`: Starts the development server at `http://localhost:3000`.
- `npm run build`: Compiles the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm test`: Runs the Jest test suite.
- `npm run test:watch`: Runs tests in watch mode.
- `npm run test:coverage`: Generates a test coverage report.

## Development Conventions
- **Live Preview:** The PDF preview is debounced (default 600ms) to prevent excessive re-renders during typing.
- **Styling:** Use Tailwind CSS for all UI components.
- **Testing:** New features should include Jest tests. Use the `MANUAL_TESTS.md` checklist for end-to-end verification.
- **PDF Rendering:** Note that `@react-pdf/renderer` runs in the browser. Avoid server-side rendering for components that use it (use `dynamic` import with `ssr: false`).
- **Templates:** The application logic is designed to eventually support multiple templates defined in the root `templates/` directory.

## Key Files
- `src/components/NDAApp.tsx`: The main entry point for the NDA creator.
- `src/components/NDADocument.tsx`: Defines the visual layout and content of the PDF.
- `src/lib/ndaHelpers.ts`: Logic for formatting data for the legal document.
- `MANUAL_TESTS.md`: Comprehensive checklist for manual verification of the NDA creator.
