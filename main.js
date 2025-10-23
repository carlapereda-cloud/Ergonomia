// PASO 1: Importar las herramientas que necesitamos
// NUEVO: Importamos PoseLandmarker y DrawingUtils (para dibujar las líneas)
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js";

// PASO 2: Encontrar los elementos HTML (esto queda igual)
const video = document.getElementById("webcam");
const canvas = document.getElementById("lienzo");
const ctx = canvas.getContext("2d");

// NUEVO: Variables para el detector de postura y el dibujador
let poseLandmarker;
let drawingUtils; // Herramienta para dibujar las líneas

// PASO 3: Crear y configurar el detector de postura
async function crearDetectorPostura() { // NUEVO: Nombre de la función
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    // NUEVO: Usamos PoseLandmarker en lugar de HandLandmarker
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
            // NUEVO: Usamos el "cerebro" (modelo) de postura.
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1, // Detectar solo 1 persona
    });

    // NUEVO: Creamos la herramienta de dibujo
    drawingUtils = new DrawingUtils(ctx);

    // Activamos la cámara (igual que antes)
    activarCamara();
}

// PASO 4: Activar la cámara (esta función es idéntica)
function activarCamara() {
    navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
    })
    .then(stream => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", iniciarDeteccion);
    })
    .catch(err => {
        console.error("¡ERROR! No se pudo acceder a la cámara:", err);
        alert("No se pudo acceder a la cámara. Asegúrate de estar en un sitio seguro (https) y de dar permiso.");
    });
}

// PASO 5: El bucle de detección (casi igual)
function iniciarDeteccion() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // NUEVO: Usamos poseLandmarker.detectForVideo
    const results = poseLandmarker.detectForVideo(video, performance.now());

    // NUEVO: Dibujamos los resultados de postura
    if (results.landmarks) {
        for (const landmarks of results.landmarks) {
            // Dibuja los puntos (codos, hombros, etc.)
            drawingUtils.drawLandmarks(landmarks, {
                color: '#FF0000', // Puntos rojos
                radius: 5,
                // Truco para voltear el dibujo y que coincida con el video-espejo
                projection: (point) => {
    // Voltea el punto X de MediaPipe (0=izquierda, 1=derecha)
    // para que coincida con el video volteado.
    const x_flipped = (1 - point.x) * canvas.width;
    const y_normal = point.y * canvas.height;
    return [
        x_flipped,
        y_normal,
        point.z
    ];
}
            });
            // Dibuja las líneas (el esqueleto)
            drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
                color: '#00FF00', // Líneas verdes
                lineWidth: 3,
                projection: (point) => {
    // Voltea el punto X de MediaPipe (0=izquierda, 1=derecha)
    // para que coincida con el video volteado.
    const x_flipped = (1 - point.x) * canvas.width;
    const y_normal = point.y * canvas.height;
    return [
        x_flipped,
        y_normal,
        point.z
    ];
}
            });
        }
    }

    requestAnimationFrame(iniciarDeteccion);
}

// ¡¡Empezar todo!!
crearDetectorPostura(); // NUEVO: Llamamos a la nueva función


