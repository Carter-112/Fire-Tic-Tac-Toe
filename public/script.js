// Debug function to help troubleshoot
function debug(message) {
  console.log(`[DEBUG] ${message}`);
}

// Determine if we're in development or production
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Socket.io server URL - use local server for development, external server for production
// IMPORTANT: Replace this URL with your actual deployed Socket.io server URL
const SOCKET_SERVER_URL = isLocalhost ? '/' : 'https://fire-tic-tac-toe.onrender.com';

let socket;
let socketAvailable = false;

// Try to initialize Socket.io
try {
  if (typeof io !== 'undefined') {
    // Socket.io is available
    debug('Socket.io is available');

    let socketOptions = {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    };

    debug(`Connecting to socket server: ${SOCKET_SERVER_URL}`);
    socket = io(SOCKET_SERVER_URL, socketOptions);

    // Log connection status
    socket.on('connect', () => {
      debug('Connected to socket server');
      socketAvailable = true;

      // If we're already on the menu screen, enable multiplayer
      document.addEventListener('DOMContentLoaded', () => {
        enableMultiplayer();
      });
    });

    socket.on('connect_error', (error) => {
      debug(`Connection error: ${error.message}`);
      handleSocketUnavailable();
    });
  } else {
    debug('Socket.io is not available');
    handleSocketUnavailable();
  }
} catch (error) {
  debug(`Error initializing Socket.io: ${error.message}`);
  handleSocketUnavailable();
}

// Function to enable multiplayer when socket is connected
function enableMultiplayer() {
  debug('Enabling multiplayer mode');
  socketAvailable = true;

  // Remove any existing notification
  const notification = document.getElementById('connection-notification');
  if (notification) {
    notification.remove();
  }

  // Enable the human mode button
  const humanModeBtn = document.getElementById('human-mode-btn');
  if (humanModeBtn) {
    humanModeBtn.disabled = false;
    humanModeBtn.style.opacity = '1';
    humanModeBtn.style.cursor = 'pointer';
    humanModeBtn.title = 'Play against another human player';
  }
}

// Function to handle when Socket.io is not available
function handleSocketUnavailable() {
  debug('Socket.io unavailable - Disabling multiplayer');
  socketAvailable = false;

  // Create a mock socket object with empty event handlers if socket is undefined
  if (!socket) {
    socket = {
      on: (event, callback) => {},
      emit: (event, data) => {
        debug(`Mock socket emit: ${event}`);
        return false;
      },
      connected: false
    };
  }

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', () => {
    // Add a notification to the menu screen
    const menuScreen = document.getElementById('menu-screen');
    if (menuScreen) {
      let notification = document.getElementById('connection-notification');

      if (!notification) {
        notification = document.createElement('div');
        notification.id = 'connection-notification';
        notification.className = 'notification';
        notification.innerHTML = `
          <p>Multiplayer server is currently unavailable.</p>
          <p>You can still play against the AI!</p>
        `;
        menuScreen.appendChild(notification);

        // Add notification styles
        const style = document.createElement('style');
        style.textContent = `
          .notification {
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid rgba(255, 87, 34, 0.5);
            border-radius: 8px;
            padding: 10px 15px;
            margin-top: 15px;
            color: #fff;
            font-size: 0.9rem;
            text-align: center;
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }

      // Disable the human mode button
      const humanModeBtn = document.getElementById('human-mode-btn');
      if (humanModeBtn) {
        humanModeBtn.disabled = true;
        humanModeBtn.style.opacity = '0.5';
        humanModeBtn.style.cursor = 'not-allowed';
        humanModeBtn.title = 'Multiplayer mode is currently unavailable';

        // Force AI mode
        const aiModeBtn = document.getElementById('ai-mode-btn');
        if (aiModeBtn) {
          aiModeBtn.click();
        }
      }
    }
  });
}

// Game state
let gameMode = 'ai'; // Default mode is AI
let timerInterval = null;

// Initialize DOM elements after document is fully loaded
let screens = {};
let elements = {};

document.addEventListener('DOMContentLoaded', () => {
  debug('Document loaded, initializing elements');

  // DOM Elements
  screens = {
    menu: document.getElementById('menu-screen'),
    waiting: document.getElementById('waiting-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen')
  };

  elements = {
    aiModeBtn: document.getElementById('ai-mode-btn'),
    humanModeBtn: document.getElementById('human-mode-btn'),
    playBtn: document.getElementById('play-btn'),
    cancelWaitBtn: document.getElementById('cancel-wait-btn'),
    choiceBtns: document.querySelectorAll('.choice-btn'),
    gameStatus: document.getElementById('game-status'),
    opponentStatus: document.getElementById('opponent-status'),
    resultText: document.getElementById('result-text'),
    playerChoiceIcon: document.getElementById('player-choice-icon'),
    opponentChoiceIcon: document.getElementById('opponent-choice-icon'),
    playAgainBtn: document.getElementById('play-again-btn'),
    menuBtn: document.getElementById('menu-btn'),
    rematchTimer: document.getElementById('rematch-timer'),
    timerCount: document.getElementById('timer-count')
  };

  // Initialize event listeners
  initEventListeners();
});

// Helper functions
function showScreen(screenId) {
  Object.values(screens).forEach(screen => {
    screen.classList.remove('active');
  });
  screens[screenId].classList.add('active');
}

function setChoiceIcon(element, choice) {
  element.innerHTML = '';
  const icon = document.createElement('i');

  switch (choice) {
    case 'rock':
      icon.className = 'fas fa-hand-rock';
      break;
    case 'paper':
      icon.className = 'fas fa-hand-paper';
      break;
    case 'scissors':
      icon.className = 'fas fa-hand-scissors';
      break;
  }

  element.appendChild(icon);
}

function startTimer(seconds, onComplete) {
  clearInterval(timerInterval);
  elements.timerCount.textContent = seconds;
  elements.rematchTimer.style.display = 'block';

  timerInterval = setInterval(() => {
    seconds--;
    elements.timerCount.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(timerInterval);
      onComplete();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  elements.rematchTimer.style.display = 'none';
}

// AI game logic
function playAgainstAI(playerChoice) {
  const choices = ['rock', 'paper', 'scissors'];
  const aiChoice = choices[Math.floor(Math.random() * choices.length)];

  let result;
  if (playerChoice === aiChoice) {
    result = 'tie';
  } else if (
    (playerChoice === 'rock' && aiChoice === 'scissors') ||
    (playerChoice === 'paper' && aiChoice === 'rock') ||
    (playerChoice === 'scissors' && aiChoice === 'paper')
  ) {
    result = 'win';
  } else {
    result = 'lose';
  }

  showResult(playerChoice, aiChoice, result);
}

function showResult(playerChoice, opponentChoice, result) {
  // Set choice icons
  setChoiceIcon(elements.playerChoiceIcon, playerChoice);
  setChoiceIcon(elements.opponentChoiceIcon, opponentChoice);

  // Set result text
  if (result === 'tie') {
    elements.resultText.textContent = "It's a Tie!";
  } else if (result === 'win') {
    elements.resultText.textContent = "You Win!";
  } else {
    elements.resultText.textContent = "You Lose!";
  }

  // Show result screen
  showScreen('result');

  // Start timer for multiplayer mode
  if (gameMode === 'human') {
    startTimer(10, () => {
      socket.emit('returnToMenu');
      showScreen('menu');
    });
  }
}

// Initialize all event listeners
function initEventListeners() {
  debug('Initializing event listeners');

  // Mode selection
  elements.aiModeBtn.addEventListener('click', () => {
    debug('AI mode selected');
    gameMode = 'ai';
    elements.aiModeBtn.classList.add('active');
    elements.humanModeBtn.classList.remove('active');
  });

  elements.humanModeBtn.addEventListener('click', () => {
    // Only allow human mode if Socket.io is available
    if (!socketAvailable) {
      debug('Human mode selected but Socket.io is not available');
      return; // Don't allow selection if socket is not available
    }

    debug('Human mode selected');
    gameMode = 'human';
    elements.humanModeBtn.classList.add('active');
    elements.aiModeBtn.classList.remove('active');
  });

  // Play button
  elements.playBtn.addEventListener('click', () => {
    debug(`Play button clicked. Current game mode: ${gameMode}`);

    if (gameMode === 'ai') {
      showScreen('game');
      elements.gameStatus.textContent = 'Choose your move';
      elements.opponentStatus.style.display = 'none';
    } else if (socketAvailable) {
      // Only try to use socket if it's available
      socket.emit('selectMode', 'human');
      showScreen('waiting');
    } else {
      // Fallback to AI mode if socket is not available
      debug('Falling back to AI mode because Socket.io is not available');
      gameMode = 'ai';
      elements.aiModeBtn.classList.add('active');
      elements.humanModeBtn.classList.remove('active');
      showScreen('game');
      elements.gameStatus.textContent = 'Choose your move';
      elements.opponentStatus.style.display = 'none';
    }
  });

  // Cancel wait button
  elements.cancelWaitBtn.addEventListener('click', () => {
    socket.emit('returnToMenu');
    showScreen('menu');
  });

  // Choice buttons
  elements.choiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const choice = btn.dataset.choice;

      if (gameMode === 'ai') {
        playAgainstAI(choice);
      } else {
        socket.emit('makeChoice', choice);
        elements.gameStatus.textContent = 'You chose ' + choice.charAt(0).toUpperCase() + choice.slice(1);
        elements.opponentStatus.textContent = 'Waiting for opponent...';
      }
    });
  });

  // Play again button
  elements.playAgainBtn.addEventListener('click', () => {
    stopTimer();

    if (gameMode === 'ai') {
      showScreen('game');
      elements.gameStatus.textContent = 'Choose your move';
    } else {
      socket.emit('rematchVote', true);
      showScreen('waiting');
    }
  });

  // Menu button
  elements.menuBtn.addEventListener('click', () => {
    stopTimer();

    if (gameMode === 'human') {
      socket.emit('returnToMenu');
    }

    showScreen('menu');
  });

  debug('All event listeners initialized');
}

// Socket.io event handlers
socket.on('waiting', () => {
  showScreen('waiting');
});

socket.on('gameStart', () => {
  showScreen('game');
  elements.gameStatus.textContent = 'Choose your move';
  elements.opponentStatus.textContent = 'Opponent is choosing...';
  elements.opponentStatus.style.display = 'block';
});

socket.on('gameResult', (data) => {
  let playerChoice, opponentChoice, result;

  // Determine which player we are
  if (socket.id === data.player1.id) {
    playerChoice = data.player1.choice;
    opponentChoice = data.player2.choice;
    result = data.result === 'player1' ? 'win' : (data.result === 'player2' ? 'lose' : 'tie');
  } else {
    playerChoice = data.player2.choice;
    opponentChoice = data.player1.choice;
    result = data.result === 'player2' ? 'win' : (data.result === 'player1' ? 'lose' : 'tie');
  }

  showResult(playerChoice, opponentChoice, result);
});

socket.on('returnToMenu', () => {
  stopTimer();
  showScreen('menu');
});

socket.on('opponentLeft', () => {
  if (screens.game.classList.contains('active')) {
    // If in game, auto-win
    showResult('rock', 'scissors', 'win');
    elements.resultText.textContent = 'You Win! (Opponent left)';
  } else if (screens.waiting.classList.contains('active')) {
    // If waiting for rematch
    showScreen('menu');
  } else if (screens.result.classList.contains('active')) {
    // If on result screen
    stopTimer();
    startTimer(3, () => {
      showScreen('menu');
    });
    elements.rematchTimer.textContent = 'Opponent left. Returning to menu...';
  }
});
