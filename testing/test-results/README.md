# Test Results

This directory stores test execution results and reports.

## Structure

```
test-results/
├── unit/           # Unit test results
├── integration/    # Integration test results
├── e2e/            # End-to-end test results
├── performance/    # Performance test results
└── reports/        # Generated HTML/PDF reports
```

## File Naming Convention

Test results should follow this naming pattern:
- `YYYY-MM-DD-HH-mm-test-type-result.json`
- `YYYY-MM-DD-test-summary.html`

## Retention Policy

- Keep latest 10 test runs
- Archive older results to `/archive` directory
- Performance baselines retained indefinitely

## CI/CD Integration

Test results are automatically uploaded to:
- Pull request comments
- Test dashboard
- Slack notifications for failures