// PeerJS initialize
const peer = new Peer(); 
let conn = null;
let points = 0;
let seconds = 1500;
let timerId = null;

// 1. Peer ID Generate Hona
peer.on('open', (id) => {
    document.getElementById('my-id').innerText = id;
    console.log("Your ID:", id);
});

// 2. Incoming Connection Handle Karna (Receiver Side)
peer.on('connection', (incomingConn) => {
    conn = incomingConn;
    setupConnection();
    console.log("Buddy connected to you!");
});

// 3. Connection Start Karna (Sender Side)
function connectToPeer() {
    const remoteId = document.getElementById('remotePeerId').value.trim();
    if (!remoteId) return alert("Pehle Buddy ki ID daalein!");
    
    updateBuddyStatus("Connecting...");
    conn = peer.connect(remoteId);
    setupConnection();
}

// 4. Sabhi Events ko Setup Karna
function setupConnection() {
    // Jab connection poori tarah khul jaye
    conn.on('open', () => {
        updateBuddyStatus("Buddy is Online 🟢");
        console.log("Connected successfully!");
        
        // Listen for data
        conn.on('data', (data) => {
            if (data.type === 'chat') {
                appendMessage(data.msg, 'buddy');
            } else if (data.type === 'status') {
                document.getElementById('sessionStatus').innerText = data.msg;
            }
        });
    });

    conn.on('close', () => {
        updateBuddyStatus("Disconnected 🔴");
        conn = null;
    });

    conn.on('error', (err) => {
        console.error("Peer Error:", err);
        updateBuddyStatus("Connection Error ❌");
    });
}

// Messaging Logic
function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();

    if (conn && conn.open) {
        conn.send({ type: 'chat', msg: msg });
        appendMessage(msg, 'me');
        input.value = '';
    } else {
        alert("Buddy connected nahi hai! Pehle ID connect karein.");
    }
}

// Enter Key Support
document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// UI Functions
function appendMessage(msg, sender) {
    const chatDiv = document.getElementById('chatMessages');
    const msgEl = document.createElement('div');
    msgEl.className = `msg ${sender}`;
    msgEl.innerText = msg;
    chatDiv.appendChild(msgEl);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

function updateBuddyStatus(status) {
    document.getElementById('buddyStatus').innerText = status;
}

function copyID() {
    const id = document.getElementById('my-id').innerText;
    navigator.clipboard.writeText(id).then(() => alert("ID Copied!"));
}

// Responsive Toggles
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }
function toggleChat() { document.getElementById('chatSidebar').classList.toggle('active'); }

// Timer Logic (Pichle code wala hi hai)
function toggleTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; document.getElementById('startBtn').innerText = "Resume Session"; }
    else { startTimer(); document.getElementById('startBtn').innerText = "Pause Session"; }
}
function startTimer() {
    timerId = setInterval(() => {
        if(seconds > 0) { seconds--; points++; updateDisplay(); }
    }, 1000);
}
function updateDisplay() {
    const m = Math.floor(seconds / 60); const s = seconds % 60;
    document.getElementById('timer').innerText = `${m}:${s < 10 ? '0'+s : s}`;
    document.getElementById('points').innerText = points;
}