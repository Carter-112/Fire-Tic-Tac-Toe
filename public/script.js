// Connect to Socket.io server
const socket = io('/.netlify/functions/server');

// Game state
let gameMode = 'ai'; // Default mode is AI
let timerInterval = null;

// DOM Elements
const screens = {
  menu: document.getElementById('menu-screen'),
  waiting: document.getElementById('waiting-screen'),
  game: document.getElementById('game-screen'),
  result: document.getElementById('result-screen')
};

const elements = {
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

// Event Listeners
// Mode selection
elements.aiModeBtn.addEventListener('click', () => {
  gameMode = 'ai';
  elements.aiModeBtn.classList.add('active');
  elements.humanModeBtn.classList.remove('active');
});

elements.humanModeBtn.addEventListener('click', () => {
  gameMode = 'human';
  elements.humanModeBtn.classList.add('active');
  elements.aiModeBtn.classList.remove('active');
});

// Play button
elements.playBtn.addEventListener('click', () => {
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
