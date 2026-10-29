---
name: documentar-avance
description: "Trigger: documentar avance, cerrar tarea, actualizar bitacora, preparar PR, actualizar README. Actualiza README.md y docs/bitacora_defensa.md por cada feature."
license: Apache-2.0
metadata:
  author: "velox-team"
  version: "1.0"
---

## Activation Contract

Activate when finishing a `feature/*` or `fix/*` branch, preparing a Pull Request to `develop`, or when the user asks to document progress, update `README.md`, or update `docs/bitacora_defensa.md`.

## Hard Rules

- MUST NOT close a task or prepare a PR without updating both `README.md` and `docs/bitacora_defensa.md` in the same change.
- MUST verify that every touched Next.js component has a 1-line top comment justifying Server vs. Client Component (`"use client"`).
- MUST verify that every touched DRF `ViewSet`, `Serializer`, and permission has a concise docstring explaining its role.
- MUST keep documentation in clear, neutral Spanish suitable for the oral defense before Prof. Facundo Lemo and Prof. Valentino Arballo.

## Decision Gates

| Change Scope | `README.md` Update | `docs/bitacora_defensa.md` Update |
| :--- | :--- | :--- |
| **Backend (Django/DRF)** | Update models, endpoints, env vars, or `uv`/Docker commands. | Append chronological entry + update Section 2 (Backend Defense Matrix). |
| **Frontend (Next.js)** | Update routes, env vars (`NEXT_PUBLIC_API_URL`), or test commands. | Append chronological entry + update Section 3 (Frontend Defense Matrix). |
| **Full-Stack / Docs** | Synchronize both architecture and setup sections. | Append chronological entry + update both defense matrices. |

## Execution Steps

1. Inspect modified and created files in the current branch (`git status` / `git diff`).
2. Audit code traceability comments (1-line Server/Client justification in Next.js; docstrings in DRF ViewSets/Serializers); add missing ones before documenting.
3. Update `README.md` with new endpoints, routes, environment variables, or verification commands introduced by the feature.
4. Append a new chronological block under Section 1 of `docs/bitacora_defensa.md` detailing: objective, touched files, technical rationale, solved issues, and oral defense talking points.
5. Update the quick-reference tables in Section 2 (Backend) and/or Section 3 (Frontend) of `docs/bitacora_defensa.md`.
6. Generate a ready-to-paste Pull Request description following Conventional Commits.

## Output Contract

Return a concise summary containing:
- List of updated documentation and code traceability files.
- The exact chronological entry added to `docs/bitacora_defensa.md`.
- A markdown block with the Pull Request title (`feat/fix(...)`), summary, test evidence checklist, and Kanban task link placeholder.

## References

- `.agents/rules/workflow_and_docs_rules.md`
- `docs/reglas_generales_y_flujo.md`
- `docs/bitacora_defensa.md`
