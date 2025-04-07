# Rock Paper Scissors Multiplayer Game

A fully functional rock-paper-scissors game that works on both mobile and PC. The game offers two modes: playing against an AI opponent or playing against another human player online.

## Features

- Responsive design for mobile and desktop
- Two game modes:
  - Play against AI
  - Play against another human player online
- Real-time multiplayer functionality using Socket.io
- Win/lose/tie detection
- Play again or return to menu options
- Automatic timeout for multiplayer rematch (10 seconds)
- Automatic handling of player disconnections

## Technologies Used

- HTML5, CSS3, JavaScript
- Node.js and Express for the server
- Socket.io for real-time communication
- Font Awesome for icons

## How to Run

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Deployment

### Deploying to Netlify

1. Push your code to GitHub
2. Sign up for a Netlify account if you don't have one
3. Click "New site from Git" on the Netlify dashboard
4. Select your GitHub repository
5. Configure the build settings:
   - Build command: `npm install`
   - Publish directory: `public`
6. Click "Deploy site"

Netlify will automatically deploy your site and provide you with a URL. The multiplayer functionality will work through Netlify Functions.

## Game Rules

- Rock beats Scissors
- Scissors beats Paper
- Paper beats Rock
- Same choices result in a tie

## License

MIT
# TTT
