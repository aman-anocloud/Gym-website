# Verification

These checks passed locally after installing dependencies:

```bash
npm test
npm run check
npx tsc -p apps/api-nest/tsconfig.json --noEmit
npx tsc -p apps/web-next/tsconfig.json --noEmit
```

The dependency install reported npm audit vulnerabilities in transitive packages:

```text
33 vulnerabilities: 3 low, 19 moderate, 11 high
```

Before production deployment, run:

```bash
npm audit
npm audit fix
```

Review any breaking changes before using `npm audit fix --force`.
