# DegenQuest-v2 Developer Quick Start Guide

## Project Overview

DegenQuest-v2 is a multiplayer web-based RPG built with:
- TypeScript
- BabylonJS (3D rendering)
- Colyseus (multiplayer server)
- Express (web server)
- SQLite (database)

The project uses ES Modules throughout and is structured as a monorepo.

## Getting Started

### Prerequisites

- Node.js 18+ 
- Bun runtime (recommended for server)
- Git
- VS Code or another TypeScript-compatible IDE

### First-Time Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/DegenQuest-v2.git
   cd DegenQuest-v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Bun (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

### Project Structure

- `/apps/game-client` - Main game client and server code
  - `/src/server` - Colyseus game server
  - `/src/client` - Web client and 3D game
  - `/src/shared` - Shared code between client and server
- `/packages` - Shared libraries
- `/content` - Game content and assets
- `/docs` - Documentation

## Development Workflow

### Running the Server

To start the game server:

```bash
cd apps/game-client
npm run server-start  # Uses Bun runtime
```

**Important**: Always use Bun for the server as it has better support for ES Module decorators used by Colyseus.

### Running the Client

To start the client development server:

```bash
cd apps/game-client
npm run client-dev
```

Then open http://localhost:5173 in your browser.

### Building for Production

```bash
cd apps/game-client
npm run client-build
npm run server-build
```

## Common Tasks

### Adding New Game Features

1. Create entity schema in `src/server/rooms/schema/`
2. Add server-side logic in `src/server/rooms/GameRoom.ts`
3. Implement client-side logic in `src/client/scenes/`
4. Update shared types in `src/shared/types.ts`

### Database Changes

The database schema is defined in `src/server/Database.ts`. Add new tables or columns there.

## Troubleshooting

### Module Resolution Errors

If you encounter module resolution errors, ensure:
1. All local imports have `.js` extensions (even for `.ts` files)
2. You're using ES Module import syntax (`import x from 'y'`)
3. Check tsconfig.json has proper ES Module settings

### Colyseus Decorator Errors

If you see errors related to Colyseus decorators:
1. Make sure you're running the server with Bun (`npm run server-start`)
2. Verify all schema classes properly extend `Schema` from Colyseus

### TypeScript Type Errors

For type errors with external libraries, you may need to use type assertions:
```typescript
(someObject as any).property = value;
```

## Key Technical Decisions

1. **ES Modules**: The project uses ES Modules (not CommonJS) for better future compatibility.

2. **Bun Runtime**: We use Bun for the server due to better decorator support with ES Modules.

3. **TypeScript**: All code is in TypeScript for better maintainability.

4. **File Extensions in Imports**: Always include `.js` extensions in imports, even for TypeScript files.

## Useful Resources

- [BabylonJS Documentation](https://doc.babylonjs.com/)
- [Colyseus Documentation](https://docs.colyseus.io/)
- [ES Module Migration Guide](planning/es-module-migration-guide.md)
- [Milestone 1 Technical Report](planning/milestone1-report.md)

## Getting Help

If you need help, check:
1. The documentation in the `/docs` directory
2. Project issues on GitHub
3. Contact the project maintainer

---

**Last Updated**: March 17, 2024 