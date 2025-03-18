# ES Module Migration Guide

## Introduction

This guide provides a systematic approach to migrating TypeScript/JavaScript projects from CommonJS to ES Modules, based on our experience with the DegenQuest-v2 project. Following these steps will help you avoid common pitfalls and ensure a smooth transition.

## Pre-Migration Checklist

Before starting a migration, verify:

- [ ] **Current module system**: Confirm which module system your project currently uses
- [ ] **Dependencies**: Check if all dependencies support ES Modules
- [ ] **TypeScript version**: Ensure you're using TypeScript 4.7+ for best ESM support
- [ ] **Build tools**: Verify that bundlers and build tools support ES Modules

## Step-by-Step Migration Process

### 1. Create a Git Branch

Always work in a separate branch to isolate your changes:

```bash
git checkout -b esm-migration
```

### 2. Update Package Configuration

Add the ES Module indicator to your package.json:

```json
{
  "type": "module"
}
```

### 3. Update TypeScript Configuration

Modify tsconfig.json to support ES Modules:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    // Other settings...
  }
}
```

### 4. Convert Import/Export Statements

#### CommonJS to ES Module conversion examples:

| CommonJS | ES Module |
|----------|-----------|
| `const fs = require('fs')` | `import fs from 'fs'` |
| `const { method } = require('lib')` | `import { method } from 'lib'` |
| `module.exports = function(){}` | `export function(){}` |
| `module.exports = { a, b }` | `export { a, b }` |
| `module.exports.fn = function(){}` | `export function fn(){}` |
| `module.exports = class{}` | `export default class{}` |

### 5. Add File Extensions to Imports

ES Modules require explicit file extensions for local imports:

```typescript
// Before (CommonJS)
import { User } from './models/User';

// After (ES Module)
import { User } from './models/User.js';
```

**Important**: Even for TypeScript files, use `.js` extension in imports, not `.ts`.

### 6. Handle __dirname and __filename

ES Modules don't have `__dirname` or `__filename`. Use this pattern instead:

```javascript
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### 7. Handle Dynamic Imports

Replace `require()` with dynamic imports:

```javascript
// Before (CommonJS)
const module = require(dynamicPath);

// After (ES Module)
const module = await import(dynamicPath);
```

### 8. Update Scripts in package.json

Add proper ES Module flags to your scripts:

```json
{
  "scripts": {
    "start": "node --experimental-specifier-resolution=node app.js",
    "dev": "tsx src/index.ts",
    "build": "tsc"
  }
}
```

### 9. Handle Library-Specific Issues

#### Type Assertions for Libraries Not Fully ESM Compatible

Some libraries may have type issues when used with ES Modules. Use type assertions:

```typescript
// For libraries with readonly properties you need to modify
(someObject as any).readonlyProperty = newValue;

// For accessing potentially undefined properties
const value = (someObject as any).maybeUndefinedProperty || defaultValue;
```

### 10. Test Incrementally

Don't convert everything at once. Follow this order:

1. Update configuration files
2. Convert utility modules with few dependencies
3. Convert core modules
4. Convert entry points last

## Common Issues and Solutions

### Module Not Found Errors

**Problem**: `Error: Cannot find module './Component'`

**Solution**: Add file extension to import:
```typescript
import { Component } from './Component.js';
```

### Type Errors with External Libraries

**Problem**: `Property 'x' does not exist on type 'Y'`

**Solution**: Use type assertions or update type definitions:
```typescript
(libraryObject as any).property = value;
```

### Decorator Issues

**Problem**: `TypeError: Cannot read properties of undefined (reading 'constructor')`

**Solution**: Use Bun runtime which has better decorator support, or update to the latest TypeScript.

### Runtime Compatibility

**Problem**: Some features don't work properly after migration.

**Solution**: Consider running with specific runtimes that better support ES Modules:
- Bun for best TypeScript+ESM compatibility
- Node.js 16+ with proper flags
- Deno (natively supports ESM)

## Testing Your Migration

After migration, verify:

- Unit tests pass
- Integration tests pass
- Build process completes without errors
- Application starts and functions correctly

## Final Tips

1. **Commit Often**: Make small, atomic commits during the migration
2. **Add Comprehensive Comments**: Document workarounds for future reference
3. **Update Documentation**: Update your project's setup and contribution guides
4. **Gradual Adoption**: Consider using a hybrid approach temporarily if needed

## Conclusion

Migrating to ES Modules provides long-term benefits including better tree-shaking, top-level await, and future compatibility. While the migration process can be challenging, following this systematic approach will help minimize issues and ensure success.

---

**Author**: Development Team  
**Last Updated**: March 17, 2024 