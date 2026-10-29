---
name: auditar-consigna-efi
description: "Trigger: auditar consigna, verificar requisitos EFI, checklist de entrega, validar proyecto. Verifica el cumplimiento de las consignas de Backend y Frontend."
license: Apache-2.0
metadata:
  author: "velox-team"
  version: "1.0"
---

## Activation Contract

Activate when the user requests an audit against the EFI 2026 academic requirements, a pre-delivery checklist verification, or validation of Backend (Ingeniería de Software) and Frontend (Programación III) rules.

## Hard Rules

- MUST verify claims against actual repository files and configuration; never assume a requirement passes without file evidence.
- MUST evaluate every mandatory requirement from both courses without omitting partial or missing items.
- MUST flag any unauthorized external dependency (e.g., MUI/Shadcn/Redux in Frontend, extra non-approved packages in Backend) as a blocking violation.

## Decision Gates

| Target Scope | Verification Checklist |
| :--- | :--- |
| **Backend Only** | Run Step 1 (Backend DRF 12-point audit) + Step 3 (GitFlow & Living Docs). |
| **Frontend Only** | Run Step 2 (Frontend Next.js R1–R8 audit) + Step 3 (GitFlow & Living Docs). |
| **Full Project** | Run Steps 1, 2, and 3 in full and cross-check API contract rules (`snake_case`, pagination, 4-op CRUD). |

## Execution Steps

1. **Audit Backend (Django + DRF):**
   - Check 10+ models (12 agreed, including `Usuario(AbstractUser)` with `rol` and `VarianteProducto` with `sku`).
   - Check 8+ ViewSets in router, `PageNumberPagination`, and `django-filter` in `ProductoViewSet`.
   - Check 2+ ViewSets using `NestedSerializers` on `list` (`ProductoViewSet`, `PedidoViewSet`) and 2+ `@action` endpoints (`destacados`, `stock_por_talle`, `cancelar_pedido`).
   - Check Session + SimpleJWT auth, Swagger/ReDoc (`/api/docs/`), root welcome HTML template (`/`), configured `admin.py`, `uv` (`pyproject.toml`), and Docker (`Dockerfile`, `docker-compose.yml`).
2. **Audit Frontend (Next.js App Router):**
   - Check 6+ main routes, 1+ nested route, 2+ dynamic routes, root + nested layouts, and `loading.jsx`/`error.jsx`/`not-found.jsx`.
   - Check 8+ reusable components in `src/components/` with 1-line Server vs. `"use client"` comments.
   - Check 4 CRUD operations (`GET`, `POST`, `PUT/PATCH`, `DELETE`) on a main resource + `Pedido` actions, JWT in HTTP-Only cookies, RHF + Zod (`snake_case`) on 2+ forms, `CartContext`, 4+ Vitest tests in `src/app/__tests__/`, and `NEXT_PUBLIC_API_URL`.
3. **Audit Workflow & Docs:** Check `README.md`, `docs/bitacora_defensa.md`, and GitFlow branch compliance (`main`, `develop`, `feature/*`).

## Output Contract

Return a structured markdown report with:
- Summary table of **Backend**, **Frontend**, and **Workflow/Docs** requirements using statuses: `CUMPLE`, `PARCIAL`, or `PENDIENTE` with file paths as evidence.
- Prioritized list of missing or non-compliant items required before final delivery.

## References

- `.agents/rules/backend_rules.md`
- `.agents/rules/frontend_rules.md`
- `.agents/rules/api_contract_rules.md`
- `.agents/rules/workflow_and_docs_rules.md`
