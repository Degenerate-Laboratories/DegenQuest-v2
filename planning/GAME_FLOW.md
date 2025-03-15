# DegenQuest v2 Game Flow Plan

## Reference Codebases
- Game and Character Selection: `/Users/highlander/WebstormProjects/t5c`
- Auth and Wallet Integration: `/Users/highlander/WebstormProjects/keepkey-affilates-v5`

## Flow Structure

1. **Landing Page**
   - Hero section with game introduction
   - "Play Now" CTA button (centered)
   - Game features and highlights
   - Visual assets and game preview

2. **Wallet Connection (Pre-requisite)**
   - Implement RainbowKit wallet connection
   - Required before character creation
   - Store Ethereum address in global state
   - Handle wallet connection persistence

3. **Character Creation**
   - Only accessible after wallet connection
   - Character customization interface
   - Stats allocation
   - Character preview
   - Save character data to blockchain/database

4. **Main Game**
   - Game world entry point
   - Character loaded with selected attributes
   - Game mechanics and interactions

## Technical Implementation Steps

1. **Setup & Configuration**
   - Port RainbowKit configuration from keepkey-affiliates-v5
   - Set up global state management
   - Configure routing system

2. **Landing Page Development**
   - Create responsive landing layout
   - Implement smooth transitions
   - Connect CTA to wallet flow

3. **Wallet Integration**
   - Port wallet connection logic
   - Implement global wallet state
   - Add persistence layer
   - Setup wallet requirement guards

4. **Character Creation System**
   - Port character creation system from t5c
   - Integrate with wallet state
   - Add blockchain integration for character NFTs

5. **Game World Setup**
   - Port game mechanics from t5c
   - Integrate character data
   - Setup game state management

## Key Components to Port

### From keepkey-affiliates-v5
- Wallet connection components
- Authentication system
- Global state management
- Web3 utilities

### From t5c
- Character creation interface
- Game engine components
- Character data management
- Game world implementation

## Next Steps
1. Set up project structure
2. Begin with landing page implementation
3. Port wallet connection system
4. Integrate character creation
5. Connect game world components 