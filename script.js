let peer = new Peer();
let conn = null;
let points = 0;
let seconds = 1500;
let timerId = null;

peer.on('open', (id) => {
    document.getElementById('my-id').innerText = id;
});

// Incoming Connection
peer.on('connection', (connection) => {
    conn = connection;
    handleData();
    updateBuddyStatus("Buddy Connected ✅");
});

function connectToPeer() {
    const remoteId = document.getElementById('remotePeerId').value;
    conn = peer.connect(remoteId);
    handleData();
    updateBuddyStatus("Connecting...");
}

function handleData() {
    conn.on('open', () => {
        updateBuddyStatus("Buddy is Online 🟢");
        
        conn.on('data', (data) => {
            if (data.type === 'chat') {
                appendMessage(data.msg, 'buddy');
            } else if (data.type === 'status') {
                document.getElementById('sessionStatus').innerText = data.msg;
                if(data.msg.includes("Distracted")) {
                    document.getElementById('timer').classList.add('distracted-mode');
                } else {
                    document.getElementById('timer').classList.remove('distracted-mode');
                }
            }
        });
    });
}

// Chat Functions
function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value;
    if (msg && conn) {
        conn.send({ type: 'chat', msg: msg });
        appendMessage(msg, 'me');
        input.value = '';
    }
}

function appendMessage(msg, sender) {
    const chatDiv = document.getElementById('chatMessages');
    const msgEl = document.createElement('div');
    msgEl.className = `msg ${sender}`;
    msgEl.innerText = msg;
    chatDiv.appendChild(msgEl);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

// Visibility API
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if(conn) conn.send({ type: 'status', msg: "Buddy is Distracted! 🛑" });
        stopTimer();
    } else {
        if(conn) conn.send({ type: 'status', msg: "Buddy is back ✍️" });
    }
});

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
    timerId = setInterval(() => {
        seconds--;
        points += 2;
        updateDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerId);
    timerId = null;
}

function updateDisplay() {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    document.getElementById('timer').innerText = `${m}:${s < 10 ? '0'+s : s}`;
    document.getElementById('points').innerText = points;
}

function updateBuddyStatus(status) {
    document.getElementById('buddyStatus').innerText = status;
}

function copyID() {
    const id = document.getElementById('my-id').innerText;
    navigator.clipboard.writeText(id);
    alert("ID Copied!");
}