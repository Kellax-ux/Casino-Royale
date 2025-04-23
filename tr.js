document.addEventListener('DOMContentLoaded', function () {
    // Game elements
    const reelStrip1 = document.getElementById('reelStrip1');
    const reelStrip2 = document.getElementById('reelStrip2');
    const reelStrip3 = document.getElementById('reelStrip3');
    const leverArm = document.getElementById('leverArm');
    const leverHandle = document.getElementById('leverHandle');
    const betInput = document.getElementById('betAmount');
    const message = document.getElementById('message');
    const restartBtn = document.getElementById('restart-Btn');
    const chance1 = document.getElementById('chance1');
    const chance2 = document.getElementById('chance2');
    const chance3 = document.getElementById('chance3');
    const audio = document.getElementById('slotAudio');

    const SYMBOLS = ["🍒", "🔔", "7 ", "🍉", "⭐", "💎"]; // Example slot machine symbols
    let lwin= 0;

    console.log("JavaScript is working!");

    // Game state
    let chances = 3;
    let wins = 0;
    let isSpinning = false;

    function initializeReels() {
        const reels = [reelStrip1, reelStrip2, reelStrip3];
    
        reels.forEach(reel => {
            reel.innerHTML = ''; // Clear existing symbols
            for (let i = 0; i < 5; i++) {  // Show at least 5 random symbols at the start
                const tempSymbol = document.createElement('div');
                tempSymbol.className = 'reel-item';
                tempSymbol.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                reel.appendChild(tempSymbol);
            }
        });
    }
    

    // Update chances display
    function updateChancesDisplay() {
        const chanceElements = [chance1, chance2, chance3];
        chanceElements.forEach((el, index) => {
            if (index < chances) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }

    // Function to spin the reels and fetch results from Flask
    async function spinReels() {
        if (isSpinning || chances === 0) return;
    
        audio.play();
        isSpinning = true;
        message.textContent = '';
        message.classList.remove('win-message');
        leverArm.style.transform = 'translateX(-50%) rotate(-180deg)';
        const betAmountRaw = betInput.value.trim();
        const betAmount = Number(betAmountRaw);

    // Frontend bet validation
    if (!betAmount || isNaN(betAmount) || betAmount < 1 || betAmount > 1000) {
        audio.pause();
        audio.currentTime=0;
        alert("Please enter a valid bet amount between 1 and 1000.");
        betInput.focus();
        isSpinning = false;
        leverArm.style.transform = 'translateX(-50%) rotate(0deg)';
        return;
    }
    
        betInput.disabled = false;
    
        try {
            // Fetch spin results from Flask
            const response = await fetch("/spin", {
                method: "POST",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `bet=${betAmount}`
            });
    
            const result = await response.text();
            const [symbol1, symbol2, symbol3, winAmount, resultMessage] = result.split(';');
    
            const reels = [reelStrip1, reelStrip2, reelStrip3];
            const symbols = [symbol1, symbol2, symbol3];
    
            // Animation: Randomly scroll through symbols before stopping
            reels.forEach((reel, index) => {
                let count = 0;
                const spinInterval = setInterval(() => {
                    reel.innerHTML = ''; // Clear reel
                    for (let i = 0; i < 5; i++) {  // Show 5 random symbols
                        const tempSymbol = document.createElement('div');
                        tempSymbol.className = 'reel-item';
                        tempSymbol.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                        reel.appendChild(tempSymbol);
                    }
                    count++;
    
                    if (count >= 10) {  // Stop after 10 random cycles
                        clearInterval(spinInterval);
                        reel.innerHTML = `<div class="reel-item">${symbols[index]}</div>`;
                    }
                }, 200); // Change symbols every 200ms
            });
    
            setTimeout(() => {
                leverArm.style.transform = 'translateX(-50%) rotate(0deg)';
                message.textContent = resultMessage;
    
                if (resultMessage.includes("won")) {
                    lwin = Number(winAmount) + lwin;
                    message.classList.add('win-message');
                    wins++;
                    
                }
                
                chances--;
                updateChancesDisplay();
    
                if (chances === 0) {
                    restartBtn.style.display = 'block';
                    message.textContent += ` Game over! Total wins: ${wins}  & Total win amount:$ ${lwin}`;
                }
                
                betInput.disabled = false;
                isSpinning = false;
            }, 4000);

        } catch (error) {
            console.error("Error fetching spin results:", error);
        }
    }
    

    // Restart game logic
    restartBtn.addEventListener("click", async () => {
        try {
            const response = await fetch('/rest', { method: 'POST' });
            if (response.ok) {
                alert("Game restarted! You have 3 chances again."); // Optional confirmation
                location.reload(); // Reload page to reset UI
            } else {
                alert("Failed to restart the game. Please try again.");
            }
        } catch (error) {
            console.error("Error restarting the game:", error);
        }
    });

    // Attach event listener to lever
    if (leverHandle) {
        leverHandle.addEventListener('click', spinReels);
    } else {
        console.error('Lever handle element not found.');
    }

    // Prevent form submission on Enter key press inside the bet input field
    betInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            spinReels();  // Manually call spinReels when Enter is pressed
        }
    });

    // Initialize game
    initializeReels();
    updateChancesDisplay();
});
