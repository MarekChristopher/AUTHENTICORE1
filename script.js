// Set up references to video and canvas
const video = document.getElementById('videoInput');
const canvas = document.getElementById('canvas');
const displaySize = { width: video.width, height: video.height };

// Initialize face-api.js and load models
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),  // for face detection
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'), // for detecting 68 landmarks
    faceapi.nets.faceRecognitionNet.loadFromUri('/models')  // optional for face recognition
]).then(startVideo);

// Start video stream from webcam
function startVideo() {
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

// Detect faces and draw landmarks every 100ms
async function detectFace() {
    const detections = await faceapi.detectAllFaces(video)
        .withFaceLandmarks();  // Enable landmark detection (anchor points)
    
    // Resize the detections to fit the video dimensions
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    
    // Clear the canvas and draw new detections and landmarks
    canvas?.clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    
    // Repeat face detection every 100ms
    setTimeout(detectFace, 100);
}

