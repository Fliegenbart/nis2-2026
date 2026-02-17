# Week 5 Operations: Reviews, Escalation, Audit Trail

## 1) Reviewer Queue API
`GET /api/consultant/reviews`

Supported query params:
- `scope=my|queue|all`
- `status=draft|in_review|approved|closed`
- `severity=critical|high|medium|low`
- `sort=due_asc|due_desc|updated_desc|severity_desc`
- `overdue=1`

## 2) Finding Status Audit Trail Export
`GET /api/audit/{auditId}/findings/history?format=csv`

Returns an exportable CSV with timestamp, finding, status change, user, and note.

## 3) Automatic Overdue Escalation

### Environment variables
- `ESCALATION_WEBHOOK_URLS`
  - comma separated
  - format: `channel=https://endpoint` or plain `https://endpoint`
  - example: `slack=https://hooks.slack.com/...,pagerduty=https://events.pagerduty.com/...`
- `ESCALATION_RUNNER_TOKEN`
  - token for internal escalation trigger endpoint

### Trigger endpoint
`POST /api/internal/escalations/overdue`

Auth header:
- `x-escalation-token: <ESCALATION_RUNNER_TOKEN>`
  or
- `Authorization: Bearer <ESCALATION_RUNNER_TOKEN>`

Optional query params:
- `limit=<number>`
- `dryRun=1`

### CLI runner
`npm run escalations:run`

Optional flags:
- `--dry-run`
- `--limit=500`

Recommendation:
Run the endpoint or script every hour via cron or GitHub Actions.
