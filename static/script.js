document.addEventListener('DOMContentLoaded', function () {
    // Game elements
    const reelStrip1 = document.getElementById('reelStrip1');
    const reelStrip2 = document.getElementById('reelStrip2');
    const reelStrip3 = document.getElementById('reelStrip3');
    const leverArm = document.getElementById('leverArm');
    const leverHandle = document.getElementById('leverHandle');
    const betInput = document.getElementById('betAmount');
    const message = document.getElementById('message');
    const restartBtn = document.getElementById('restartBtn');
    const chance1 = document.getElementById('chance1');
    const chance2 = document.getElementById('chance2');
    const chance3 = document.getElementById('chance3');

    // Game state
    let chances = 3;
    let wins = 0;
    let isSpinning = false;

    // Symbols for the reels (more common symbols appear more frequently)
    const symbols = [
        { symbol: '7', class: 'seven', weight: 2 },
        { symbol: 'A', class: '', weight: 5 },
        { symbol: 'K', class: '', weight: 5 },
        { symbol: 'Q', class: '', weight: 5 },
        { symbol: 'J', class: '', weight: 5 },
        { symbol: '10', class: '', weight: 5 },
        { symbol: '♦', class: '', weight: 4 },
        { symbol: '♥', class: '', weight: 4 },
        { symbol: '♠', class: '', weight: 4 },
        { symbol: '♣', class: '', weight: 4 }
    ];

    // Initialize reels
    function initializeReels() {
        let weightedSymbols = [];
        symbols.forEach(s => {
            for (let i = 0; i < s.weight; i++) {
                weightedSymbols.push(s);
            }
        });

        [reelStrip1, reelStrip2, reelStrip3].forEach(strip => {
            strip.innerHTML = '';
            for (let i = 0; i < 20; i++) {
                const randomSymbol = weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
                const item = document.createElement('div');
                item.className = `reel-item ${randomSymbol.class}`;
                item.textContent = randomSymbol.symbol;
                strip.appendChild(item);
            }
            strip.style.top = '0px';
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

    // Spin the reels
    function spinReels() {
        if (isSpinning || chances === 0) return;

        isSpinning = true;
        message.textContent = '';
        message.classList.remove('win-message');
        leverArm.style.transform = 'translateX(-50%) rotate(45deg)';
        const betAmount = parseInt(betInput.value) || 10;

        betInput.disabled = true;
        initializeReels();

        const reels = [reelStrip1, reelStrip2, reelStrip3];
        const isWin = Math.random() < 0.1;

        reels.forEach((reel, index) => {
            const items = reel.querySelectorAll('.reel-item');
            const randomPosition = Math.floor(Math.random() * (items.length - 3));
            const stopPosition = isWin && index === 0 ? -172 : randomPosition * -172;

            setTimeout(() => {
                reel.style.transition = 'top 3s ease';
                reel.style.top = `${stopPosition}px`;
            }, 500 * index);
        });

        setTimeout(() => {
            leverArm.style.transform = 'translateX(-50%) rotate(0deg)';

            // Check visible symbols for all reels
            const visibleSymbols = [];
            reels.forEach(reel => {
                const reelTop = parseInt(reel.style.top); // Get reel's top position
                const itemHeight = 172; // Height of a single item
                const visibleIndex = Math.abs(Math.round(reelTop / itemHeight));
                const items = reel.querySelectorAll('.reel-item');
                if (items[visibleIndex]) {
                    visibleSymbols.push(items[visibleIndex].textContent);
                }
            });

            // Check if all visible symbols are '7'
            const allSevens = visibleSymbols.every(symbol => symbol === '7');

            if (allSevens) {
                wins++;
                message.textContent = `You won! Total wins: ${wins}.`;
                message.classList.add('win-message');
            } else {
                message.textContent = "No luck this time!";
            }

            chances--;
            updateChancesDisplay();

            if (chances === 0) {
                restartBtn.style.display = 'block';
                if (wins === 0) {
                    message.textContent = "Game over! Better luck next time.";
                } else {
                    message.textContent = `Game over! Total wins: ${wins}.`;
                }
            }

            betInput.disabled = false;
            isSpinning = false;
        }, 4000);
    }

    // Restart game logic
  restartBtn.addEventListener("click", async () => {
    try {
        const response = await fetch("/reht", { method: "POST" });
        if (response.ok) {
            alert("Game restarted! You have 3 chances again.");
            location.reload(); // Reload the page to reset UI
        }
    } catch (error) {
        console.error("Error restarting the game:", error);
    }
});

    // Attach lever event listener
    if (leverHandle) {
        leverHandle.addEventListener('click', spinReels);
    } else {
        console.error('Lever handle element not found.');
    }

    // Initialize the game
    initializeReels();
    updateChancesDisplay();
});
