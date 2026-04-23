# GEMINI.md - Preleagal Root

## Project Overview
`preleagal` is an open-source platform designed for drafting common legal agreements efficiently. It leverages standardized templates (primarily from **Common Paper**) and provides an interactive web interface for users to customize business terms and generate formatted legal documents (PDFs).

### Architecture
The project is divided into two main parts:
- **`frontend/`**: A Next.js 14 (App Router) application that provides the user interface for document customization and PDF generation.
- **`templates/`**: A collection of standardized legal agreement templates in Markdown format, containing placeholders for business terms.
- **`catalog.json`**: A central registry that maps agreement names and descriptions to their respective template files in the `templates/` directory.

## Core Components

### Templates (`templates/`)
Templates are Markdown files that follow the Common Paper standard. They use special markers like `<span class="coverpage_link">Term Name</span>` to identify fields that should be populated by the frontend.
Key templates include:
- Mutual NDA (Standard Terms and Cover Page)
- Cloud Service Agreement (CSA)
- Data Processing Agreement (DPA)
- Professional Services Agreement (PSA)
- AI Addendum

### Catalog (`catalog.json`)
This file acts as the single source of truth for available agreements. Each entry contains:
- `name`: Display name of the agreement.
- `description`: A brief summary of what the agreement covers.
- `filename`: The path to the Markdown template file.

### Frontend (`frontend/`)
The frontend is built with:
- **Next.js 14**: Framework for the web application.
- **TypeScript**: For type safety.
- **Tailwind CSS**: For styling.
- **@react-pdf/renderer**: For generating PDFs in the browser.

Refer to `frontend/GEMINI.md` for detailed frontend-specific documentation, including building, running, and testing instructions.

## Building and Running
The primary development occurs within the `frontend` directory.

- **Frontend Setup**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

- **Testing**:
  ```bash
  cd frontend
  npm test
  ```

## Development Conventions
- **Template Updates**: When adding or modifying a template in `templates/`, ensure the `catalog.json` is updated accordingly.
- **Placeholder Standard**: Use `<span class="coverpage_link">Field Name</span>` for all variable business terms in Markdown templates to ensure compatibility with the frontend parser.
- **Styling**: All UI components in the frontend should use Tailwind CSS.
- **Documentation**: Maintain `GEMINI.md` files at both the root and sub-project levels to ensure contextual clarity for AI assistants and contributors.
