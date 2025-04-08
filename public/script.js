// Debug function to help troubleshoot
function debug(message) {
  console.log(`[DEBUG] ${message}`);
}

// Connect to Socket.io server
// Determine if we're in development or production
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// For local development, connect to the local server
// For production on Netlify, use the socket function
let socketUrl;
let socketOptions = {};

if (isLocalhost) {
  socketUrl = '/';
} else {
  // For Netlify deployment
  socketUrl = '/.netlify/functions/socket';
  socketOptions = {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000
  };
}

debug(`Using socket URL: ${socketUrl}`);
const socket = io(socketUrl, socketOptions);

// Log connection status
socket.on('connect', () => {
  debug('Connected to server');
});

socket.on('connect_error', (error) => {
  debug(`Connection error: ${error.message}`);
  // Allow AI mode to work even without server connection
  debug('Socket.io connection error - AI gameplay will still work');

  // If we're in production and can't connect, show a message to the user
  if (!isLocalhost) {
    // Add a notification to the menu screen
    const menuScreen = document.getElementById('menu-screen');
    let notification = document.getElementById('connection-notification');

    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'connection-notification';
      notification.className = 'notification';
      notification.innerHTML = `
        <p>Multiplayer mode may not be available right now.</p>
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

      // Force AI mode
      const aiModeBtn = document.getElementById('ai-mode-btn');
      if (aiModeBtn) {
        aiModeBtn.click();
      }
    }
  }
});

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
    } else {
      socket.emit('selectMode', 'human');
      showScreen('waiting');
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
