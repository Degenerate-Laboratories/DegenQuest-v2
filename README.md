# DegenQuest-v2
Brave the Abyss—Fortunes Minted by the Bold.

## Getting Started

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
   Or if using pnpm:
   ```
   pnpm install
   ```

### Running the Game

#### From the root directory:
- Start the server: `npm run server-dev`
- Start the client: `npm run client-dev` 
- Start both simultaneously: `npm run start-all` (requires concurrently to be installed)

#### Or from the game-client directory:
```
cd apps/game-client
npm run server-dev
npm run client-dev
```

### Access Points
- Client: http://localhost:8080
- Server: http://localhost:3000
- Colyseus Monitor: http://localhost:3000/colyseus (not /monitor)
- Colyseus Playground: http://localhost:3000/playground

### Troubleshooting
If you see "Cannot GET /monitor", use http://localhost:3000/colyseus instead. The monitor is configured at /colyseus in the server code.
