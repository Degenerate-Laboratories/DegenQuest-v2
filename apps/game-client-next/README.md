# T5C - The 5th Continent Game Client (Next.js)

This is a Next.js implementation of the T5C game client, migrated from the original Vite-based version.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the game.

## Project Structure

- `src/app` - Next.js app router pages and layouts
- `src/components` - React components for UI elements
- `src/game` - Core game engine code using BabylonJS
- `src/utils` - Utility functions and helpers
- `public` - Static assets (models, textures, etc.)

## Game Engine

The game uses BabylonJS for 3D rendering and Colyseus for multiplayer networking. The core game logic is initialized in the `src/game/engine.ts` file.

## Features

- 3D rendering with BabylonJS
- Responsive design
- Service worker for CORS handling
- Modern ESM module structure
- Type safety with TypeScript

## Development Notes

- The game canvas is created and managed by React
- BabylonJS is loaded and initialized after the component mounts
- All game assets are loaded asynchronously

## Production Build

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

The build will be available in the `.next` directory.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [BabylonJS Documentation](https://doc.babylonjs.com/)
- [Colyseus Documentation](https://docs.colyseus.io/) 