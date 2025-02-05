// Load face-api.js models
async function loadModels() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        console.log('Models loaded successfully');
    } catch (err) {
        console.error('Error loading models:', err);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const startButton = document.getElementById('start-button');
    const ctx = canvas.getContext('2d');
    let isTracking = false;
    
    // Load models when page loads
    loadModels();
    
    startButton.addEventListener('click', async () => {
        if (!isTracking) {
            await startVideo();
            startButton.textContent = 'Stop Camera';
            isTracking = true;
            startFaceTracking();
        } else {
            stopVideo();
            startButton.textContent = 'Start Camera';
            isTracking = false;
        }
    });
    
    async function startVideo() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Error accessing camera. Please make sure you've granted camera permissions.");
        }
    }
    
    function stopVideo() {
        const stream = video.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            video.srcObject = null;
        }
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    async function startFaceTracking() {
        if (!isTracking) return;
        
        // Detect faces
        const detections = await faceapi.detectAllFaces(
            video, 
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks();
        
        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw face landmarks
        detections.forEach(detection => {
            // Draw face box
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                detection.detection.box.x,
                detection.detection.box.y,
                detection.detection.box.width,
                detection.detection.box.height
            );
            
            // Draw landmarks
            const landmarks = detection.landmarks;
            const points = landmarks.positions;
            
            points.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                ctx.fillStyle = '#ff0000';
                ctx.fill();
            });
        });
        
        // Continue tracking
        requestAnimationFrame(startFaceTracking);
    }
});
