// 1. Tab Change Detection (Visibility API)
document.addEventListener('visibilitychange', () => {
    const sessionStatus = document.getElementById('sessionStatus');
    const vibeCard = document.getElementById('vibeCard');

    if (document.hidden) {
        // JAB USER TAB BADAL DE
        console.log("User is distracted!");
        
        // Browser Alert (Simple Alert use karenge taaki screen stop ho jaye)
        // Note: Kuch browsers isse block karte hain, isliye chat message zaroori hai
        
        const distractionMsg = `${user ? user.name : 'Buddy'} is DISTRACTED! 🛑`;
        
        // Local UI update
        sessionStatus.innerText = "Status: You are distracted! 🛑";
        vibeCard.classList.add('vibe-danger');
        document.getElementById('timer').classList.add('distracted-mode');

        // Buddy ko data bhejna
        if (conn && conn.open) {
            conn.send({ 
                type: 'status', 
                msg: distractionMsg,
                isDistracted: true 
            });
        }

        // Optional: Timer pause kar dena punishment ke taur par
        stopTimer();
        alert("Wapas padhai par aao! Timer ruk gaya hai. ⚠️");

    } else {
        // JAB USER WAPAS AAYE
        const backMsg = `${user ? user.name : 'Buddy'} is back to focus! ✍️`;
        
        sessionStatus.innerText = "Status: Focusing... ✍️";
        vibeCard.classList.remove('vibe-danger');
        document.getElementById('timer').classList.remove('distracted-mode');

        if (conn && conn.open) {
            conn.send({ 
                type: 'status', 
                msg: backMsg,
                isDistracted: false 
            });
        }
    }
});

// 2. Receiver Side: Jab dusre ka status message aaye
// Isse setupConnection() function ke andar 'conn.on(data)' mein update karein:
function setupConnection() {
    conn.on('open', () => {
        updateBuddyStatus("Buddy is Online 🟢");
        
        conn.on('data', (data) => {
            if (data.type === 'status') {
                // Screen par bade aksharon mein alert dikhana
                document.getElementById('sessionStatus').innerText = data.msg;
                
                if (data.isDistracted) {
                    // Chat mein auto-message daalna
                    appendMessage("⚠️ SYSTEM: " + data.msg, 'buddy');
                    document.getElementById('timer').classList.add('distracted-mode');
                    // Ek beep sound play kar sakte hain yahan
                    playAlertSound();
                } else {
                    document.getElementById('timer').classList.remove('distracted-mode');
                }
            }
            // ... baaki chat logic
        });
    });
}

// 3. Alert Sound (Professional feel ke liye)
function playAlertSound() {
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play().catch(e => console.log("Audio play blocked by browser"));
}