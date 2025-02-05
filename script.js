// Load face-api.js models
const video = document.getElementById('videoInput');
const canvas = document.getElementById('canvas');
const displaySize = { width: video.width, height: video.height };

// Initialize face-api.js and set up canvas
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
    // Access the user's webcam
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then((stream) => {
            video.srcObject = stream;
            video.onplay = () => {
                faceapi.matchDimensions(canvas, displaySize);
                detectFace();
            };
        })
        .catch((err) => console.error("Error accessing webcam: ", err));
}

async function detectFace() {
    // Detect face and landmarks every 100 milliseconds
    const detections = await faceapi.detectAllFaces(video)
        .withFaceLandmarks();
    
    // Resize the detections to fit the canvas
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    
    // Clear the canvas and draw the new detections
    canvas?.clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    
    // Call detectFace every 100ms for live detection
    setTimeout(detectFace, 100);
}
