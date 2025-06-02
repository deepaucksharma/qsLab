# Bug Report: Node.js Version Compatibility Issue

## Bug Information
- **Bug ID**: BUG-001
- **Date Discovered**: June 2, 2025
- **Severity**: High
- **Priority**: High
- **Status**: Open
- **Reporter**: Testing Assistant

## Summary
ESLint fails to run due to Node.js version incompatibility. The project requires Node.js 18+ but system is running Node.js 12.22.9.

## Environment
- **OS**: WSL Ubuntu
- **Node.js Version**: 12.22.9 (Installed)
- **Required Node.js**: 18+ (per package.json)
- **npm Version**: 8.5.1

## Steps to Reproduce
1. Navigate to techflix directory
2. Run `npm run lint`
3. Observe ESLint syntax error

## Expected Behavior
ESLint should run successfully and check code for linting issues.

## Actual Behavior
ESLint fails with syntax error:
```
SyntaxError: Unexpected token '?'
    at wrapSafe (internal/modules/cjs/loader.js:915:16)
```

## Error Details
```
> techflix@2.0.0 lint
> eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0

/home/deepak/src/qsLab/techflix/node_modules/eslint-plugin-react-refresh/index.js:62
    } = context.options[0] ?? {};
                            ^
SyntaxError: Unexpected token '?'
```

## Root Cause
The installed Node.js version (12.22.9) does not support the nullish coalescing operator (`??`) which was introduced in Node.js 14. The eslint-plugin-react-refresh package uses this modern syntax.

## Impact
- **Development**: Cannot run linting, which is part of development workflow
- **CI/CD**: Pre-commit hooks may fail
- **Code Quality**: Cannot verify code style and catch potential issues
- **Build Process**: May affect other build tools that rely on modern Node.js features

## Proposed Solutions

### Option 1: Update Node.js (Recommended)
```bash
# Using Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
nvm alias default 18
```

### Option 2: Use Docker Development Environment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]
```

## Testing Required After Fix
1. Verify `npm run lint` runs successfully
2. Test all npm scripts in package.json
3. Verify development server starts (`npm run dev`)
4. Confirm build process works (`npm run build`)

---

**Next Action**: Update Node.js to version 18+ or set up proper development environment
