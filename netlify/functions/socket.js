const { Server } = require('socket.io');

// Global variables to store game state
let waitingPlayers = [];
let gameRooms = {};
let io;

exports.handler = async (event, context) => {
  // Initialize Socket.io if not already initialized
  if (!io) {
    io = new Server({
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });
    
    // Set up Socket.io event handlers
    setupSocketHandlers(io);
  }
  
  // Handle HTTP requests
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    },
    body: JSON.stringify({ status: 'Socket.io server is running' })
  };
};

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
  
    // Handle mode selection
    socket.on('selectMode', (mode) => {
      socket.gameMode = mode;
      
      if (mode === 'human') {
        // Add player to waiting queue
        waitingPlayers.push(socket.id);
        socket.emit('waiting');
        
        // If we have at least 2 players, create a game
        if (waitingPlayers.length >= 2) {
          const player1 = waitingPlayers.shift();
          const player2 = waitingPlayers.shift();
          const roomId = `${player1}-${player2}`;
          
          // Create game room
          gameRooms[roomId] = {
            players: [player1, player2],
            choices: {},
            rematchVotes: {}
          };
          
          // Join both players to the room
          io.sockets.sockets.get(player1).join(roomId);
          io.sockets.sockets.get(player2).join(roomId);
          
          // Store room ID in socket objects
          io.sockets.sockets.get(player1).roomId = roomId;
          io.sockets.sockets.get(player2).roomId = roomId;
          
          // Notify players that game is starting
          io.to(roomId).emit('gameStart');
        }
      }
    });
  
    // Handle player choice
    socket.on('makeChoice', (choice) => {
      const roomId = socket.roomId;
      
      if (roomId && gameRooms[roomId]) {
        // Store player's choice
        gameRooms[roomId].choices[socket.id] = choice;
        
        // Check if both players have made their choices
        const choices = gameRooms[roomId].choices;
        const players = gameRooms[roomId].players;
        
        if (players.length === 2 && choices[players[0]] && choices[players[1]]) {
          // Determine winner
          const result = determineWinner(choices[players[0]], choices[players[1]]);
          
          // Send result to both players
          io.to(roomId).emit('gameResult', {
            yourChoice: null, // Will be filled in by client
            opponentChoice: null, // Will be filled in by client
            result: result,
            player1: {
              id: players[0],
              choice: choices[players[0]]
            },
            player2: {
              id: players[1],
              choice: choices[players[1]]
            }
          });
          
          // Reset choices for next round
          gameRooms[roomId].choices = {};
        }
      }
    });
  
    // Handle rematch vote
    socket.on('rematchVote', (vote) => {
      const roomId = socket.roomId;
      
      if (roomId && gameRooms[roomId]) {
        // Store player's vote
        gameRooms[roomId].rematchVotes[socket.id] = vote;
        
        // Check if both players have voted
        const votes = gameRooms[roomId].rematchVotes;
        const players = gameRooms[roomId].players;
        
        if (players.length === 2 && votes[players[0]] !== undefined && votes[players[1]] !== undefined) {
          // If both voted yes, start new game
          if (votes[players[0]] && votes[players[1]]) {
            io.to(roomId).emit('gameStart');
          } else {
            // Otherwise, return to menu
            io.to(roomId).emit('returnToMenu');
            
            // Clean up room
            delete gameRooms[roomId];
            players.forEach(playerId => {
              const playerSocket = io.sockets.sockets.get(playerId);
              if (playerSocket) {
                playerSocket.roomId = null;
              }
            });
          }
          
          // Reset votes
          gameRooms[roomId].rematchVotes = {};
        }
      }
    });
  
    // Handle return to menu
    socket.on('returnToMenu', () => {
      handlePlayerLeave(socket);
    });
  
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      handlePlayerLeave(socket);
    });
  
    // Helper function to handle player leaving
    function handlePlayerLeave(socket) {
      // Remove from waiting queue if present
      const waitingIndex = waitingPlayers.indexOf(socket.id);
      if (waitingIndex !== -1) {
        waitingPlayers.splice(waitingIndex, 1);
      }
      
      // Handle active game if in one
      const roomId = socket.roomId;
      if (roomId && gameRooms[roomId]) {
        const opponent = gameRooms[roomId].players.find(id => id !== socket.id);
        
        if (opponent) {
          const opponentSocket = io.sockets.sockets.get(opponent);
          if (opponentSocket) {
            // Notify opponent that this player left
            opponentSocket.emit('opponentLeft');
            opponentSocket.roomId = null;
          }
        }
        
        // Clean up room
        delete gameRooms[roomId];
      }
    }
  });
}

// Determine winner function
function determineWinner(choice1, choice2) {
  if (choice1 === choice2) {
    return 'tie';
  }
  
  if (
    (choice1 === 'rock' && choice2 === 'scissors') ||
    (choice1 === 'paper' && choice2 === 'rock') ||
    (choice1 === 'scissors' && choice2 === 'paper')
  ) {
    return 'player1';
  } else {
    return 'player2';
  }
}
