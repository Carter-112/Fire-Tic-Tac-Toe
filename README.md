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

2. For local development (recommended):
   ```
   npm run local
   ```

   Or for Netlify Functions development:
   ```
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

   The local development server provides better debugging and doesn't require Netlify Functions setup.

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

### Setting Up Multiplayer Functionality

To enable multiplayer functionality when deployed to Netlify, you need to deploy the Socket.io server separately. This is because Netlify doesn't support persistent WebSocket connections needed for real-time multiplayer.

#### Deploying the Socket.io Server

1. **Create an account on a platform that supports WebSockets**:
   - [Render](https://render.com/) (recommended, has a free tier)
   - [Glitch](https://glitch.com/)
   - [Railway](https://railway.app/)
   - [Heroku](https://www.heroku.com/) (requires credit card for free tier)

2. **Deploy the Socket.io server**:
   - Create a new Web Service
   - Connect your GitHub repository or upload the `socket-server.js` file
   - Set the build command: `npm install`
   - Set the start command: `node socket-server.js`
   - Deploy the server

3. **Update the client code**:
   - After deploying, you'll get a URL for your Socket.io server
   - Open `public/script.js` and update the `SOCKET_SERVER_URL` variable with your server URL
   - Redeploy your Netlify site

When properly configured:
- The game will automatically connect to your Socket.io server
- The "Play vs Human" option will be enabled
- Players can play against each other in real-time

### Local Development with Multiplayer

To test the multiplayer functionality locally:

```
npm run local
```

This will start a local server with full Socket.io support, allowing you to test the multiplayer functionality.

Netlify will automatically deploy your site and provide you with a URL.

## Game Rules

- Rock beats Scissors
- Scissors beats Paper
- Paper beats Rock
- Same choices result in a tie

## License

MIT
# TTT
