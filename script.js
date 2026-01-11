const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const sizePicker = document.getElementById('sizePicker');
const clearBtn = document.getElementById('clearBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn'); // Get PDF button

// Video Call Elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startVideoCallBtn = document.getElementById('startVideoCallBtn');
const endVideoCallBtn = document.getElementById('endVideoCallBtn');

// --- Canvas Logic ---
let painting = false;

// Function to resize canvas to fill its container
function resizeCanvas() {
    // Get the parent container's dimensions
    const canvasContainer = canvas.parentElement;
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
}
window.addEventListener('resize', resizeCanvas); // Resize on window resize
resizeCanvas(); // Initial resize

function startPosition(e) {
    painting = true;
    draw(e);
}

function finishedPosition() {
    painting = false;
    ctx.beginPath(); // Reset path to prevent connecting lines
}

function draw(e) {
    if (!painting) return;

    ctx.lineWidth = sizePicker.value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = colorPicker.value;

    // Adjust coordinates relative to the canvas's position
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

// Event Listeners for Mouse
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', finishedPosition);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseleave', finishedPosition); // Stop drawing if mouse leaves canvas

// Clear Canvas
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// --- Download PDF Functionality ---
downloadPdfBtn.addEventListener('click', () => {
    // Make sure jsPDF is loaded
    if (typeof window.jsPDF !== 'undefined') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Convert canvas to image data URL
        const imgData = canvas.toDataURL('image/png');

        // Add the image to the PDF
        // Parameters: imageData, format, x, y, width, height
        // We'll scale the image to fit the PDF page
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        doc.save('EduSync_Whiteboard.pdf');
    } else {
        alert('jsPDF library not loaded. Please check your internet connection or script tag.');
    }
});


// --- Simple Pomodoro Logic (as before) ---
let timeLeft = 25 * 60;
let timerInterval;

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        document.getElementById('timer').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        if (timeLeft === 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            alert("Time's up! Take a break."); // Optional alert
        }
        timeLeft--;
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    document.getElementById('timer').innerText = "25:00";
}


// --- Basic WebRTC for Video/Audio (Local only for now, needs server for remote) ---
let localStream;
let peerConnection; // This would connect to a remote peer via a signaling server

startVideoCallBtn.addEventListener('click', async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        startVideoCallBtn.disabled = true;
        endVideoCallBtn.disabled = false;

        // In a real application, you would now create a PeerConnection
        // and send this localStream to a remote peer via a signaling server (Socket.io)
        // Example (Conceptual - needs signaling server):
        // peerConnection = new RTCPeerConnection();
        // localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        // peerConnection.ontrack = (event) => {
        //     remoteVideo.srcObject = event.streams[0];
        // };
        // ... rest of WebRTC offer/answer/ICE candidate exchange
        alert("Video call started (local stream visible). To connect with others, a signaling server (e.g., Socket.io) is required.");

    } catch (error) {
        console.error("Error accessing media devices:", error);
        alert("Could not start video call. Make sure you have a camera/mic and granted permissions.");
    }
});

endVideoCallBtn.addEventListener('click', () => {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop()); // Stop all tracks
        localVideo.srcObject = null;
        localStream = null;
    }
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    remoteVideo.srcObject = null; // Clear remote video too
    startVideoCallBtn.disabled = false;
    endVideoCallBtn.disabled = true;
    alert("Video call ended.");
});