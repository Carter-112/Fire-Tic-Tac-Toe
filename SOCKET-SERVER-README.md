# Rock Paper Scissors Socket.io Server

This is the Socket.io server for the Rock Paper Scissors multiplayer game. It handles real-time communication between players.

## Deployment Instructions

### Deploying to Render (Recommended)

1. Create a Render account at [render.com](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository or upload the `socket-server.js` and `socket-server-package.json` files
   - If uploading directly, rename `socket-server-package.json` to `package.json`
4. Configure the service:
   - Build Command: `npm install`
   - Start Command: `node socket-server.js`
5. Deploy the service
6. Once deployed, copy the URL provided by Render

### Deploying to Glitch

1. Create a Glitch account at [glitch.com](https://glitch.com/)
2. Create a new project
3. Upload the `socket-server.js` and `socket-server-package.json` files
   - Rename `socket-server-package.json` to `package.json`
4. Glitch will automatically install dependencies and start the server
5. Copy the URL provided by Glitch

### Deploying to Railway

1. Create a Railway account at [railway.app](https://railway.app/)
2. Create a new project
3. Connect your GitHub repository or upload the files
4. Configure the service:
   - Build Command: `npm install`
   - Start Command: `node socket-server.js`
5. Deploy the service
6. Copy the URL provided by Railway

## After Deployment

After deploying the Socket.io server, you need to update the client code:

1. Open `public/script.js` in your Rock Paper Scissors game project
2. Find the `SOCKET_SERVER_URL` variable (around line 11)
3. Replace the URL with your deployed Socket.io server URL
4. Redeploy your Netlify site

## Testing

To test if your Socket.io server is running correctly, visit the server URL in your browser. You should see a JSON response: `{"status":"Socket.io server is running"}`
