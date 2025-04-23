document.addEventListener('DOMContentLoaded', function() {
    // Game state
    const state = {
        balance: 1000,
        bets: {},
        spinning: false,
        history: []
    };

    // DOM elements
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spin-button');
    const clearBetsButton = document.getElementById('clear-bets');
    const restartButton = document.getElementById('restart-button');
    const betInput = document.getElementById('bet-input');
    const balanceDisplay = document.getElementById('balance');
    const resultNumber = document.getElementById('result-number');
    const resultColor = document.getElementById('result-color');
    const activeBets = document.getElementById('active-bets');
    const historyContainer = document.getElementById('history-container');
    var audio = document.getElementById("spinAudio");

    // Roulette numbers and colors
    const rouletteNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];



    const numberColors = {
        0: 'green',
        1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black',
        7: 'red', 8: 'black', 9: 'red', 10: 'black', 11: 'black', 12: 'red',
        13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red',
        19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black',
        25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red',
        31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red'
    };

    // Initialize wheel
    function initWheel() {
        // Clear any existing wheel content
        wheel.innerHTML = ""
    
        const totalNumbers = rouletteNumbers.length
        const segmentAngle = 360 / totalNumbers
    
        // Create a simple visual representation with colored segments
        for (let i = 0; i < totalNumbers; i++) {
          const number = rouletteNumbers[i]
          const color = numberColors[number]
    
          // Create segment
          const segment = document.createElement("div")
          segment.className = "wheel-segment"
          segment.style.position = "absolute"
          segment.style.width = "100%"
          segment.style.height = "100%"
          segment.style.transformOrigin = "center"
          segment.style.transform = `rotate(${i * segmentAngle}deg)`
    
          // Create the colored wedge
          const wedge = document.createElement("div")
          wedge.style.position = "absolute"
          wedge.style.width = "50%"
          wedge.style.height = "10px"
          wedge.style.right = "0"
          wedge.style.top = "calc(50% - 5px)"
          wedge.style.backgroundColor = color
          wedge.style.transformOrigin = "left center"
    
          // Add number label
          const label = document.createElement("div")
          label.textContent = number
          label.style.position = "absolute"
          label.style.right = "5px"
          label.style.top = "0"
          label.style.color = "white"
          label.style.fontSize = "12px"
          label.style.fontWeight = "bold"
          label.style.textShadow = "1px 1px 1px black"
    
          wedge.appendChild(label)
          segment.appendChild(wedge)
          wheel.appendChild(segment)
        }
      }  


    function resetFrontend() {
        state.balance = 1000;  // Reset the balance
        state.bets = {};  // Clear all active bets
        state.spinning = false;  // Allow new spin
        state.history = [];  // Clear history
        

        // Update balance display
        balanceDisplay.textContent = state.balance;

        // Reset result number and color
        resultNumber.textContent = '';  // Clear the result number
        resultColor.style.backgroundColor = '';  // Clear the result color

        // Clear any bet chips or active bets on the table
        updateBetsDisplay();
        updateHistoryDisplay();
    }

     // Event listener for the Restart button
     restartButton.addEventListener('click', function() {
        // Send a POST request to restart the game
        const formData = new FormData();
        formData.append('restart', 'true');  // Add a key-value pair to indicate the restart

        fetch('/restart_g', {
            method: 'POST',
            body: formData  // Send form data (without JSON)
        })
        .then(response => {
            if (response.ok) {
                console.log("Game restarted on backend");
                resetFrontend();  // Reset the frontend game state
            } else {
                console.error("Failed to restart the game on the backend");
            }
        })
        .catch(error => {
            console.error("Error restarting the game:", error);
        });
    });


    // Update balance display
    function updateBalance() {
        balanceDisplay.textContent = state.balance;
    }

    // Update bets display
    function updateBetsDisplay() {
        if (Object.keys(state.bets).length === 0) {
            activeBets.innerHTML = '<div class="no-bets">No active bets</div>';
            return;
        }
        
        activeBets.innerHTML = '';
        
        for (const [target, amount] of Object.entries(state.bets)) {
            const betItem = document.createElement('div');
            betItem.className = 'bet-item';
            
            betItem.innerHTML = `
                <div class="bet-target">${target}</div>
                <div class="bet-amount-display">$${amount}</div>
            `;
            
            activeBets.appendChild(betItem);
        }
    }

    

    // Add to history
    function addToHistory(number) {
        state.history.unshift(number);
        if (state.history.length > 10) {
            state.history.pop();
        }
        
        updateHistoryDisplay();
    }

    // Update history display
    function updateHistoryDisplay() {
        historyContainer.innerHTML = '';
        
        state.history.forEach(number => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${numberColors[number]}`;
            historyItem.textContent = number;
            
            historyContainer.appendChild(historyItem);
        });
    }

    // Place bet
    function placeBet(target, amount) {
        if (state.spinning) return;
        
        amount = parseInt(amount);
        
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid bet amount');
            return;
        }
        
        if (amount > state.balance) {
            alert('Not enough balance');
            return;
        }
        
        // Add or update bet
        if (state.bets[target]) {
            state.bets[target] += amount;
        } else {
            state.bets[target] = amount;
        }
        
        // Update balance
        state.balance -= amount;
        updateBalance();
        updateBetsDisplay();
        
        // Add chip to the betting table
        const targetElement = document.querySelector(`[data-number="${target}"], [data-bet="${target}"]`);
        if (targetElement) {
            let chip = targetElement.querySelector('.bet-chip');
            
            if (!chip) {
                chip = document.createElement('div');
                chip.className = 'bet-chip';
                targetElement.appendChild(chip);
            }
            
            chip.textContent = state.bets[target];
        }
    }



    // Clear all bets
    function clearBets() {
        if (state.spinning) return;
        
        // Refund all bets
        for (const amount of Object.values(state.bets)) {
            state.balance += amount;
        }
        
        state.bets = {};
        updateBalance();
        updateBetsDisplay();
        
        // Remove all chips
        document.querySelectorAll('.bet-chip').forEach(chip => {
            chip.remove();
        });
    }

     // Restart the game
     function restartGame() {
        // Reset the frontend game state
        state.balance = 1000;  // Reset balance to starting value
        state.bets = {};  // Clear bets
        state.history = [];  // Clear spin history
        updateBalance();
        updateBetsDisplay();
        updateHistoryDisplay();
        
        // Remove all chips
        document.querySelectorAll('.bet-chip').forEach(chip => {
            chip.remove();
        });
        
        // Reset wheel position without affecting backend data
        wheel.style.transition = 'transform 0s';  // Disable transition temporarily
        wheel.style.transform = 'rotate(0deg)';  // Reset wheel position to 0 degrees
        setTimeout(() => {
            wheel.style.transition = 'transform 5s ease-out';  // Re-enable transition
        }, 100);
        
        // Enable the buttons again after restart
        spinButton.disabled = false;
        clearBetsButton.disabled = false;
    }

    // Spin the wheel
    function spin() {
        if (state.spinning) return;
        if (Object.keys(state.bets).length === 0) {
            audio.pause();
            audio.currentTime=0;
            alert('Please place at least one bet');
            return;
        }
        
        state.spinning = true;
        spinButton.disabled = true;
        clearBetsButton.disabled = true;
        
        // Random result
        const randomIndex = Math.floor(Math.random() * rouletteNumbers.length);
        const result = rouletteNumbers[randomIndex];
        animate(result);
        // Calculate rotation
        const segmentAngle = 360 / rouletteNumbers.length;
        const rotations = 8*360; // Number of full rotations
        const targetAngle = rotations - ( randomIndex * segmentAngle);
         
        // Show result after animation
        setTimeout(() => {
            showResult(result);
            processWinnings(result);
            state.spinning = false;
            spinButton.disabled = false;
            clearBetsButton.disabled = false;
        }, 6000); // Match the CSS transition duration
    }

        // Set ball's initial position
        let centerX = 145;
        let centerY = 147;
        let radius = 133;
        let angle = 0;
        let speed = 0.3;
        let spinTime = 0;
        let spinTimeTotal = 10000//Math.random() * 1000 + 3500; // Random spin time between 5-8 seconds
    
        function animate(r) {
            spinTime += 30;
            if (spinTime >= spinTimeTotal) {
                stopAnimation(r);
                return spinTime=0;
            }
    
            let spinRemaining = spinTimeTotal - spinTime;
            let currentSpeed = speed * (spinRemaining / spinTimeTotal);
    
            // Update angle and ball position
            angle += currentSpeed;
            let x = centerX + radius * Math.cos(angle);
            let y = centerY + radius * Math.sin(angle);
            ball.style.left = `${x}px`;
            ball.style.top = `${y}px`;
            
            requestAnimationFrame(() => animate(r));
        }
    
        function stopAnimation(a) {
            // Ball stops at the winning number
            
            let finalAngle = (a / 37) * (2 * Math.PI);
            let finalX = centerX + radius * Math.cos(finalAngle);
            let finalY = centerY + radius * Math.sin(finalAngle);
    
            ball.style.left = `${finalX}px`;
            ball.style.top = `${finalY}px`;
            audio.pause();
            audio.currentTime=0;
        }


    // Show result
    function showResult(number) {
        resultNumber.textContent = number;
        resultColor.style.backgroundColor = numberColors[number];
        
        // Highlight winning number
        const winningElements = document.querySelectorAll(`[data-number="${number}"]`);
        winningElements.forEach(el => {
            el.classList.add('winning-number');
            setTimeout(() => {
                el.classList.remove('winning-number');
            }, 3000);
        });
        
        // Add to history
        addToHistory(number);
    }

    // Function to display win/loss message
    function showMessage(status, amount) {
    const messageContainer = document.getElementById('message-container');
    
    // Set the message content and the style class based on win or loss
    if (status === 'win') {
        messageContainer.textContent = `You Win! Amount: $${amount}`;
        messageContainer.classList.add('win');  // Adds green background
        messageContainer.classList.remove('lose');  // Removes red background if any
    } else if (status === 'lose') {
        messageContainer.textContent = `You Lose!`;
        messageContainer.classList.add('lose');  // Adds red background
        messageContainer.classList.remove('win');  // Removes green background if any
    }
    
    // Show the message container
    messageContainer.style.display = 'block';
    
    // Hide the message after 3 seconds
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 3000);  // Hide the message after 3 seconds
}


    // Process winnings
    function processWinnings(result) {
        let winnings = 0;
        
        for (const [target, amount] of Object.entries(state.bets)) {
            let won = false;
            
            // Check different bet types
            if (target === result.toString()) {
                // Straight up bet (35:1)
                winnings += amount * 10; // Return original bet + 35x
                won = true;
            } else if (target === 'red' && numberColors[result] === 'red') {
                // Red bet (1:1)
                winnings += amount * 2;
                won = true;
            } else if (target === 'black' && numberColors[result] === 'black') {
                // Black bet (1:1)
                winnings += amount * 2;
                won = true;
            } else if (target === 'odd' && result !== 0 && result % 2 === 1) {
                // Odd bet (1:1)
                winnings += amount * 2;
                won = true;
            } else if (target === 'even' && result !== 0 && result % 2 === 0) {
                // Even bet (1:1)
                winnings += amount * 2;
                won = true;
            } else if (target === '1-12' && result >= 1 && result <= 12) {
                // First dozen (2:1)
                winnings += amount * 3;
                won = true;
            } else if (target === '13-24' && result >= 13 && result <= 24) {
                // Second dozen (2:1)
                winnings += amount * 3;
                won = true;
            } else if (target === '25-36' && result >= 25 && result <= 36) {
                // Third dozen (2:1)
                winnings += amount * 3;
                won = true;
            }
            
            if (won) {
                // Flash winning bet
                const targetElement = document.querySelector(`[data-number="${target}"], [data-bet="${target}"]`);
                if (targetElement) {
                    targetElement.classList.add('winning-number');
                    setTimeout(() => {
                        targetElement.classList.remove('winning-number');
                    }, 3000);
                }
            }
        }
        
        // Update balance with winnings
        state.balance += winnings;
        updateBalance();
        
        // Clear bets for next round
        state.bets = {};
        updateBetsDisplay();
        
        // Remove all chips
        document.querySelectorAll('.bet-chip').forEach(chip => {
            chip.remove();
        });
        
        // Show winnings message if any
        if (winnings > 0) {
            showMessage('win', winnings);
            sendWinToBackend(winnings);
        } else {
            showMessage('lose');  // Show 'You Lose' if no winnings
        }
    }

    // Function to send the win amount to the backend
    function sendWinToBackend(winnings) {
        fetch('/save_win', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `win_amount=${winnings}`,  // Send win_amount as form data
        })
        .then(response => {
            if (response.ok) {
                console.log("Win amount sent to backend successfully.");
            } else {
                console.log("Failed to send win amount to backend.");
            }
        })
        .catch(error => {
            console.error("Error sending win amount:", error);
        });
    }

    // Event listeners
    spinButton.addEventListener('click', spin);
    clearBetsButton.addEventListener('click', clearBets);
    restartButton.addEventListener('click', restartGame);
   
    // Number betting
    document.querySelectorAll('.number').forEach(numberElement => {
        numberElement.addEventListener('click', () => {
            const number = numberElement.getAttribute('data-number');
            placeBet(number, betInput.value);
        });
    });
    
    // Special bets
    document.querySelectorAll('.special-bet , .special-bet1').forEach(specialBet => {
        specialBet.addEventListener('click', () => {
            const bet = specialBet.getAttribute('data-bet');
            placeBet(bet, betInput.value);
        });
    });
    


    // Initialize
    initWheel();
    updateBalance();
    updateBetsDisplay();
    updateHistoryDisplay();
});