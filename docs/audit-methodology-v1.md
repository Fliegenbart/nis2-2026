# NIS2 Audit Methodology v1

## Scope
This methodology supports a readiness assessment against Directive (EU) 2022/2555 (NIS2).

## Versioning
- Framework version: `nis2-2026-v1`
- Methodology version: `methodology-v1`

Every audit persists both values on creation. Reports lock a snapshot so outputs remain reproducible after questionnaire updates.

## Scoring Model (v2)
The engine scores at control level and aggregates upward.

- Control weight by severity:
  - `kritisch`: 5
  - `hoch`: 3
  - `mittel`: 1
- Answer weight:
  - `fulfilled`: 1.0
  - `partial`: 0.5
  - `not_fulfilled`: 0.0
  - `not_applicable`: excluded from denominator

Formula:
`overall_score = sum(weighted_earned) / sum(weighted_max) * 100`

## Gap Logic
- Gap: answered control that is not `fulfilled`
- Critical gap: gap with severity `kritisch`

## Risk Model (v1)
Risk level combines score, open gaps, critical gaps, and exposure indicators (revenue, employee count):
- `low`, `medium`, `high`, `critical`

The model also returns:
- Potential fine estimate (NIS2 max-fine heuristic)
- Confidence score
- Rationale list

## Tenant and Role Foundation
Data model includes:
- Organization
- Client
- User role enum (`admin`, `consultant`, `reviewer`, `client_readonly`)

## Control Catalog
Control mappings are persisted in `ControlCatalog` with:
- Framework/methodology versions
- Category/question IDs
- Article and legal references
- Severity and weight
- Evidence requirement flag

Use `POST /api/framework/current` to sync in-memory control definitions into DB.
