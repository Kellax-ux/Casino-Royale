let balance = 1000;
let betAmount = 10;
let minesCount = 5;
let gameActive = false;
let revealedCount = 0;
let totalPayout = 1;
let nextPayout = 1;
let minePositions = [];

const balanceElement = document.getElementById("balanceAmount");
const betAmountInput = document.getElementById("betAmount");
const minesCountInput = document.getElementById("minesCount");
const startGameBtn = document.getElementById("startGameBtn");
const cashoutBtn = document.getElementById("cashoutBtn");
const minesGrid = document.getElementById("minesGrid");
const messageElement = document.getElementById("message");
const nextPayoutElement = document.getElementById("nextPayout");
const totalPayoutElement = document.getElementById("totalPayout");
const currentProfitElement = document.getElementById("currentProfit");
const errorMessageElement = document.getElementById("errorMessage");

startGameBtn.addEventListener("click", startGame);
cashoutBtn.addEventListener("click", cashout);
betAmountInput.addEventListener("change", updateBetAmount);
minesCountInput.addEventListener("change", updateMinesCount);

createGrid();

function updateBetAmount() {
  betAmount = Number.parseInt(betAmountInput.value);
}

function updateMinesCount() {
  minesCount = Number.parseInt(minesCountInput.value);
}

function startGame() {
  errorMessageElement.textContent = ""; // Clear previous error messages
  document.getElementById('bombAudio').pause();
  document.getElementById('bombAudio').currentTime=0;

  // Bet Validation
  if (betAmount < 1 || betAmount > 1000) {
    errorMessageElement.textContent = "Bet amount must be between 1 and 1000.";
    return;
  }

  if (betAmount > balance) {
    messageElement.textContent = "Insufficient balance!";
    showMessage();
    return;
  }

  gameActive = true;
  revealedCount = 0;
  totalPayout = 1;
  nextPayout = calculateNextPayout();
  balance -= betAmount;
  updateBalance();

  minePositions = generateMinePositions();
  createGrid();

  // Enable the grid for interaction
  document.querySelector(".game-board").classList.add("active"); // Enable game interaction

  startGameBtn.disabled = true;
  
  cashoutBtn.disabled = false;
  
  currentProfitElement.textContent = ``;
  updatePayoutInfo();
}

function generateMinePositions() {
  const positions = [];
  while (positions.length < minesCount) {
    const position = Math.floor(Math.random() * 25);
    if (!positions.includes(position)) {
      positions.push(position);
    }
  }
  return positions;
}

function createGrid() {
  minesGrid.innerHTML = "";
  for (let i = 0; i < 25; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.addEventListener("click", () => revealCell(cell, i));
    minesGrid.appendChild(cell);
  }
}

function revealCell(cell, index) {
  if (!gameActive || cell.classList.contains("revealed")) return;

  cell.classList.add("revealed");

  if (minePositions.includes(index)) {
    cell.classList.add("mine");
    cell.textContent = "💣";
    document.getElementById('bombAudio').play();
    endGame(false);
    
  } else {
    cell.classList.add("gem");
    cell.textContent = "💎";
    document.getElementById('diamondAudio').play();

    revealedCount++;
    totalPayout = nextPayout;
    nextPayout = calculateNextPayout();
    updatePayoutInfo();

    if (revealedCount === 25 - minesCount) {
      endGame(true);
    }
  }
}

function calculateNextPayout() {
  const remainingCells = 25 - revealedCount;
  const safeCells = remainingCells - minesCount;
  return Number.parseFloat(((totalPayout * remainingCells) / safeCells).toFixed(2));
}

function updatePayoutInfo() {
  nextPayoutElement.textContent = `Next payout: ${nextPayout.toFixed(2)}x`;
  totalPayoutElement.textContent = `Total payout: ${totalPayout.toFixed(2)}x`;
}

function endGame(won) {
  gameActive = false;
  startGameBtn.disabled = false;
  cashoutBtn.disabled = true;
  showMessage();

  if (won) {
    // Don't calculate win here, we'll do it on cashout
    messageElement.textContent = "You finished the game, but you need to cash out to claim your winnings.";
    showMessage();
  } else {
    messageElement.textContent = "Game over! You hit a mine.";
    showMessage();
    currentProfitElement.textContent =" Current Profit: $0";
  }

  revealAllMines();
  updateBalance();

  showMessage();
  
}

function showMessage() {
  messageElement.style.display = 'block'; // Show the message

  // Optionally hide the message after a few seconds
  setTimeout(() => {
    messageElement.style.display = 'none'; // Hide after 3 seconds
  }, 3000); // Adjust the time as necessary
}

function revealAllMines() {
  const cells = minesGrid.children;
  minePositions.forEach((position) => {
    cells[position].classList.add("revealed", "mine");
    cells[position].textContent = "💣";
  });
}

function cashout() {
  const winAmount = betAmount * totalPayout;
  balance += winAmount;
  const profit = winAmount-betAmount
  updateBalance();
  messageElement.textContent = `Cashed out! You won $${winAmount.toFixed(2)}!`;
  showMessage();
  currentProfitElement.textContent = `Current Profit: $${profit.toFixed(2)}`;
  storeWin(winAmount)
  
  gameActive = false;
  startGameBtn.disabled = false;
  cashoutBtn.disabled = true;
  document.getElementById('bombAudio').play();
  revealAllMines();
}

function updateBalance() {
  balanceElement.textContent = balance.toFixed(2);
}

function storeWin(winAmount) {
    // Send POST request to Flask backend
    fetch('/store_win', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `win_amount=${winAmount}`, // Pass the win amount
    })
      .then(response => response.text())
      .then(data => {
        console.log(data); // Log backend response
      })
      .catch(error => {
        console.error('Error storing win amount:', error);
      });
  }
  
  const restartBtn = document.getElementById("restartBtn");
  restartBtn.addEventListener("click", restartGame);
  
  function restartGame() {
    // Reset variables
    balance = 1000;
    gameActive = false;
    revealedCount = 0;
    totalPayout = 1;
    nextPayout = 1;
    minePositions = [];
    document.getElementById('bombAudio').pause();
    document.getElementById('bombAudio').currentTime=0;

  
    // Reset UI elements
    balanceElement.textContent = balance.toFixed(2);
    messageElement.textContent = ""; // Clear message
    errorMessageElement.textContent = ""; // Clear error messages
    currentProfitElement.textContent = `Current Profit: $0.00`; // Reset profit display
    nextPayoutElement.textContent = `Next payout: 1.00x`; // Reset payout
    totalPayoutElement.textContent = `Total payout: 1.00x`; // Reset payout
  
    // Re-enable buttons
    startGameBtn.disabled = false;
    cashoutBtn.disabled = true;
  
    // Clear and recreate the grid
    createGrid();
  
    // Optionally reset bet amount and mine count inputs
    betAmountInput.value = 10; // Default bet amount
    minesCountInput.value = 5;// Default mines count
    
    betAmount = 10;
    minesCount = 5;
    
  }

  // function getHighestWin() {
  //   // Fetch the highest win amount from backend
  //   fetch('/highest_win')
  //     .then(response => response.text())
  //     .then(data => {
  //       console.log(data); // Log highest win amount
  //       alert(data); // Show it to the user (Optional)
  //     })
  //     .catch(error => {
  //       console.error('Error fetching highest win amount:', error);
  //     });
  // }

updateBalance();
