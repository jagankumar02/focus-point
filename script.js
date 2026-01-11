let peer = new Peer(); 
let conn = null;
let points = 0;
let seconds = 1500;
let timerId = null;

// Jab aapka Peer ID taiyar ho jaye
peer.on('open', (id) => {
    document.getElementById('my-id').innerText = id;
    console.log('My Peer ID: ' + id);
});

// Dusre peer se connection receive karna
peer.on('connection', (connection) => {
    conn = connection;
    console.log("Buddy connected to me!");
    setupConnection();
});

// Khud se connect karna
function connectToPeer() {
    const remoteId = document.getElementById('remotePeerId').value;
    if (!remoteId) return alert("Pehle ID toh daalo!");
    
    conn = peer.connect(remoteId);
    console.log("Connecting to: " + remoteId);
    setupConnection();
}

// Common function for both sides
function setupConnection() {
    conn.on('open', () => {
        console.log("Connection fully OPEN!");
        updateBuddyStatus("Buddy is Online 🟢");
        
        // Listen for messages
        conn.on('data', (data) => {
            console.log("Data received:", data);
            if (data.type === 'chat') {
                appendMessage(data.msg, 'buddy');
            } else if (data.type === 'status') {
                handleStatusChange(data.msg);
            }
        });
    });

    conn.on('close', () => {
        updateBuddyStatus("Connection Lost 🔴");
        conn = null;
    });

    conn.on('error', (err) => {
        console.error("Peer Error:", err);
        alert("Connection Error!");
    });
}

// Messaging Logic
function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();

    if (!conn || !conn.open) {
        alert("Buddy connected nahi hai! Pehle ID se connect karein.");
        return;
    }

    if (msg) {
        conn.send({ type: 'chat', msg: msg });
        appendMessage(msg, 'me');
        input.value = '';
    }
}

// ENTER key se message send karne ke liye
document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function appendMessage(msg, sender) {
    const chatDiv = document.getElementById('chatMessages');
    const msgEl = document.createElement('div');
    msgEl.className = `msg ${sender}`;
    msgEl.innerText = msg;
    chatDiv.appendChild(msgEl);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

// Status handling
function handleStatusChange(statusMsg) {
    document.getElementById('sessionStatus').innerText = statusMsg;
    if (statusMsg.includes("Distracted")) {
        document.getElementById('timer').classList.add('distracted-mode');
    } else {
        document.getElementById('timer').classList.remove('distracted-mode');
    }
}

// Visibility API (Tab Change Detect)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (conn && conn.open) conn.send({ type: 'status', msg: "Buddy is Distracted! 🛑" });
        stopTimer();
    } else {
        if (conn && conn.open) conn.send({ type: 'status', msg: "Buddy is back ✍️" });
    }
});

// Timer functions
function toggleTimer() {
    if (timerId) {
        stopTimer();
        document.getElementById('startBtn').innerText = "Resume Session";
    } else {
        startTimer();
        document.getElementById('startBtn').innerText = "Pause Session";
    }
}

function startTimer() {
    if (!timerId) {
        timerId = setInterval(() => {
            if (seconds > 0) {
                seconds--;
                points += 1;
                updateDisplay();
            }
        }, 1000);
    }
}

function stopTimer() {
    clearInterval(timerId);
    timerId = null;
}

function updateDisplay() {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    document.getElementById('timer').innerText = `${m}:${s < 10 ? '0' + s : s}`;
    document.getElementById('points').innerText = points;
}

function updateBuddyStatus(status) {
    document.getElementById('buddyStatus').innerText = status;
}

function copyID() {
    const id = document.getElementById('my-id').innerText;
    navigator.clipboard.writeText(id).then(() => alert("ID Copied!"));
}