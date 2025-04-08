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
   - Build command: `npm install && npm run build`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
6. Click "Deploy site"

### Important Netlify Settings

After deploying, you need to configure a few additional settings:

1. **Enable Functions**: Go to Site settings > Functions > Settings and ensure the functions directory is set to `netlify/functions`

2. **Check Redirects**: Go to Site settings > Domain management > Redirects and ensure the redirects from the `_redirects` file are properly configured

3. **Environment Variables**: If needed, set environment variables in Site settings > Build & deploy > Environment

### Troubleshooting Deployment

If multiplayer functionality doesn't work after deployment:

1. Check the Netlify Function logs in the Netlify dashboard
2. Ensure your site has the proper permissions for Functions
3. The game will automatically fall back to AI-only mode if the Socket.io connection fails
4. Try clearing your browser cache or using incognito mode

Netlify will automatically deploy your site and provide you with a URL. The multiplayer functionality will work through Netlify Functions.

## Game Rules

- Rock beats Scissors
- Scissors beats Paper
- Paper beats Rock
- Same choices result in a tie

## License

MIT
# TTT
